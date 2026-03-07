import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  TablePagination,
  useTheme,
  alpha,
  IconButton,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  Collapse,
  Divider,
  InputAdornment,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { PiFileCsvFill } from 'react-icons/pi';
import { ImFileEmpty, ImSpinner4 } from 'react-icons/im';
import { LiaEdit } from 'react-icons/lia';
import { AiFillDelete } from 'react-icons/ai';
import { PiUserCircleCheckFill } from 'react-icons/pi';
import { TbUserCancel } from 'react-icons/tb';
import swal from 'sweetalert';

const API = import.meta.env.VITE_APP_SERVER;
const TOKEN = () => localStorage.getItem('dfsp_v2_token') || '';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN()}`,
});

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const AVATAR_PALETTE = [
  '#05569f',
  '#7c3aed',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#db2777',
  '#16a34a',
];
const avatarBg = (str = '') =>
  AVATAR_PALETTE[(str.charCodeAt(0) || 0) % AVATAR_PALETTE.length];

const STATUS_CFG = {
  1: { label: 'Active', color: '#059669', bg: '#dcfce7' },
  0: { label: 'Inactive', color: '#dc2626', bg: '#fee2e2' },
};
// const F = ({form, k, label, type = 'text', disabled = false, half = true }) => (
//   <Grid item xs={12} sm={half ? 6 : 12}>
//     <TextField
//       fullWidth
//       size='small'
//       label={label}
//       type={type}
//       value={form[k]}
//       onChange={(e) => set(k, e.target.value)}
//       error={!!errors[k]}
//       helperText={errors[k]}
//       disabled={disabled}
//     />
//   </Grid>
// );
const F = ({
  form,
  errors,
  set,
  k,
  label,
  type = 'text',
  disabled = false,
  half = true,
}) => (
  <Grid item xs={12} sm={half ? 6 : 12}>
    <TextField
      fullWidth
      size='small'
      label={label}
      type={type}
      value={form[k]}
      onChange={(e) => set(k, e.target.value)}
      error={!!errors[k]}
      helperText={errors[k]}
      disabled={disabled}
    />
  </Grid>
);
function MerchantFormDialog({ open, onClose, onSaved, editData }) {
  const theme = useTheme();
  const isEdit = !!editData?.id;

  const blank = {
    display_name: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    dob: '',
    id_type: 'MSISDN',
    id_value: '',
    nid: '',
    acc_no: '',
    daily_limit: '0',
    single_transaction_limit: '0',
    email: '',
    password: '',
    open_account: '',
  };

  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setErrors({});
      setForm(
        isEdit
          ? {
              display_name: editData.display_name || '',
              first_name: editData.first_name || '',
              middle_name: editData.middle_name || '',
              last_name: editData.last_name || '',
              dob: editData.dob || '',
              id_type: editData.id_type || 'MSISDN',
              id_value: editData.id_value || '',
              nid: editData.nid || '',
              acc_no: editData.acc_no || '',
              daily_limit: editData.daily_limit || '0',
              single_transaction_limit:
                editData.single_transaction_limit || '0',
              email: '',
              password: '',
              open_account: '',
            }
          : blank,
      );
    }
  }, [open, editData]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.display_name.trim()) e.display_name = 'Required';
    if (!form.first_name.trim()) e.first_name = 'Required';
    if (!form.id_type) e.id_type = 'Required';
    if (!form.id_value.trim()) e.id_value = 'Required';
    if (!isEdit && !form.email.trim()) e.email = 'Required';
    if (!isEdit && !form.password.trim()) e.password = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const url = isEdit
        ? `${API}/api/parties/${editData.id}`
        : `${API}/api/parties/add`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      swal(
        'Success',
        isEdit ? 'Merchant updated.' : 'Merchant registered.',
        'success',
      );
      onSaved();
      onClose();
    } catch (err) {
      swal('Error', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          bgcolor: alpha('#05569f', 0.05),
          borderBottom: `1px solid ${alpha('#05569f', 0.12)}`,
          fontWeight: 700,
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isEdit ? 'Edit Merchant' : 'Add New Merchant'}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, mt: 2 }}>
        <div className='space-y-4 h-[60vh]' container spacing={2}>
          {/* Personal info */}
          <Grid item xs={12}>
            <Typography
              variant='caption'
              fontWeight={700}
              color='text.secondary'
              sx={{ textTransform: 'uppercase' }}
            >
              Personal Information
            </Typography>
          </Grid>

          <F
            form={form}
            errors={errors}
            set={set}
            k='display_name'
            label='Business Name *'
          />
          <F
            form={form}
            errors={errors}
            set={set}
            k='first_name'
            label='First Name *'
          />
          <F
            form={form}
            errors={errors}
            set={set}
            k='middle_name'
            label='Middle Name'
          />
          <F
            form={form}
            errors={errors}
            set={set}
            k='last_name'
            label='Last Name'
          />
          <F
            form={form}
            errors={errors}
            set={set}
            k='dob'
            label='Date of Birth'
          />

          <F form={form} errors={errors} set={set} k='nid' label='NID Number' />

          {/* ID info */}
          <Grid item xs={12}>
            <Typography
              variant='caption'
              fontWeight={700}
              color='text.secondary'
              sx={{ textTransform: 'uppercase' }}
            >
              Account Identification
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size='small' error={!!errors.id_type}>
              <InputLabel>ID Type *</InputLabel>
              <Select
                value={form.id_type}
                label='ID Type *'
                onChange={(e) => set('id_type', e.target.value)}
                disabled={isEdit}
              >
                {[
                  'MSISDN',
                  'ACCOUNT_ID',
                  'EMAIL',
                  'PERSONAL_ID',
                  'BUSINESS',
                  'DEVICE',
                  'IBAN',
                  'ALIAS',
                ].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <F
            form={form}
            errors={errors}
            set={set}
            k='id_value'
            label='ID Value *'
            disabled={isEdit}
          />
          <F
            form={form}
            errors={errors}
            set={set}
            k='acc_no'
            label='Account Number'
          />
          {!isEdit && (
            <F
              form={form}
              errors={errors}
              set={set}
              k='open_account'
              label='Deposit Amount/ Existing Balance'
            />
          )}
          {/* Limits */}
          <Grid item xs={12}>
            <Typography
              variant='caption'
              fontWeight={700}
              color='text.secondary'
              sx={{ textTransform: 'uppercase' }}
            >
              Transaction Limits
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size='small'
              label='Daily Limit'
              type='number'
              value={form.daily_limit}
              onChange={(e) => set('daily_limit', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>৳</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size='small'
              label='Single Transaction Limit'
              type='number'
              value={form.single_transaction_limit}
              onChange={(e) => set('single_transaction_limit', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>৳</InputAdornment>
                ),
              }}
            />
          </Grid>
          {/* open_account */}
          {/* Portal credentials — add only */}
          {!isEdit && (
            <>
              <Grid item xs={12}>
                <Typography
                  variant='caption'
                  fontWeight={700}
                  color='text.secondary'
                  sx={{ textTransform: 'uppercase' }}
                >
                  Auth Credentials
                </Typography>
              </Grid>
              <F
                form={form}
                errors={errors}
                set={set}
                k='email'
                label='Email *'
                type='email'
              />
              <F
                form={form}
                errors={errors}
                set={set}
                k='password'
                label='Password *'
                type='password'
              />
            </>
          )}
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: 'none' }}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving ? <ImSpinner4 className='animate-spin' /> : null}
          sx={{
            textTransform: 'none',
            bgcolor: '#05569f',
            '&:hover': { bgcolor: '#044a8a' },
            minWidth: 130,
          }}
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Register Merchant'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DetailRow({ merchant, colSpan }) {
  const fields = [
    [
      'Full Name',
      `${merchant.first_name || ''} ${merchant.middle_name || ''} ${merchant.last_name || ''}`.trim(),
    ],
    ['NID', merchant.nid],
    ['Account No.', merchant.acc_no],
    ['FSP ID', merchant.fsp_id],
    [
      'Daily Limit',
      merchant.daily_limit
        ? `৳ ${Number(merchant.daily_limit).toLocaleString()}`
        : '—',
    ],
    [
      'Single Txn Limit',
      merchant.single_transaction_limit
        ? `৳ ${Number(merchant.single_transaction_limit).toLocaleString()}`
        : '—',
    ],
    ['Portal Username', merchant.username],
    ['Portal Email', merchant.email],
    ['Last Login', fmtDate(merchant.last_login)],
    ['Registered', fmtDate(merchant.created_at)],
  ];

  return (
    <TableRow>
      <TableCell colSpan={colSpan} sx={{ p: 0, border: 0 }}>
        <Box
          sx={{
            bgcolor: alpha('#05569f', 0.025),
            borderLeft: '3px solid #05569f',
            px: 3,
            py: 2,
          }}
        >
          <Grid container spacing={1.5}>
            {fields.map(([label, val]) => (
              <Grid item xs={12} sm={6} md={3} key={label}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  fontWeight={600}
                  display='block'
                >
                  {label}
                </Typography>
                <Typography fontSize={12} sx={{ wordBreak: 'break-all' }}>
                  {val || '—'}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      </TableCell>
    </TableRow>
  );
}

function CsvUploadDialog({ open, onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (open) {
      setFile(null);
      setPreview([]);
      setResult(null);
    }
  }, [open]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').filter(Boolean);
      const header = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1, 6).map((line) => {
        const vals = line.split(',').map((v) => v.trim().replace(/"/g, ''));
        return Object.fromEntries(header.map((h, i) => [h, vals[i] || '']));
      });
      setPreview(rows);
    };
    reader.readAsText(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(Boolean);
      const header = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
      const parties = lines
        .slice(1)
        .map((line) => {
          const vals = line.split(',').map((v) => v.trim().replace(/"/g, ''));
          return Object.fromEntries(header.map((h, i) => [h, vals[i] || '']));
        })
        .filter((p) => p.id_value);

      const res = await fetch(`${API}/api/parties/bulk-add`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ parties }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      swal('Error', err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csv =
      'display_name,first_name,middle_name,last_name,dob,id_type,id_value,nid,acc_no,daily_limit,single_transaction_limit,email,password\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merchant_template.csv';
    a.click();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          borderBottom: `1px solid ${alpha('#05569f', 0.12)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <PiFileCsvFill /> Bulk Upload via CSV
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Download template */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            size='small'
            startIcon={<DownloadIcon />}
            onClick={downloadTemplate}
            sx={{ textTransform: 'none', color: '#05569f' }}
          >
            Download Template
          </Button>
        </Box>

        {/* Drop zone */}
        <Box
          onClick={() => fileRef.current?.click()}
          sx={{
            border: `2px dashed ${alpha('#05569f', 0.3)}`,
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: alpha('#05569f', 0.02),
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: '#05569f',
              bgcolor: alpha('#05569f', 0.05),
            },
            mb: 2,
          }}
        >
          <FileUploadIcon
            sx={{ fontSize: 40, color: alpha('#05569f', 0.4), mb: 1 }}
          />
          <Typography fontSize={14} fontWeight={600}>
            {file ? file.name : 'Click to select CSV file'}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supported: .csv'}
          </Typography>
          <input
            ref={fileRef}
            type='file'
            accept='.csv'
            hidden
            onChange={handleFile}
          />
        </Box>

        {/* Preview */}
        {preview.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              fontSize={12}
              fontWeight={600}
              mb={1}
              color='text.secondary'
            >
              Preview (first 5 rows):
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size='small'>
                <TableHead sx={{ bgcolor: alpha('#05569f', 0.06) }}>
                  <TableRow>
                    {Object.keys(preview[0]).map((k) => (
                      <TableCell
                        key={k}
                        sx={{
                          fontSize: 10,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {k}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row).map((v, j) => (
                        <TableCell
                          key={j}
                          sx={{ fontSize: 11, whiteSpace: 'nowrap' }}
                        >
                          {v || '—'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        )}

        {/* Results */}
        {result && (
          <Box>
            <Alert
              severity={
                result.failed === 0
                  ? 'success'
                  : result.success === 0
                    ? 'error'
                    : 'warning'
              }
              sx={{ mb: 1 }}
            >
              <strong>Total: {result.total}</strong> &nbsp;·&nbsp; ✓ Success:{' '}
              {result.success} &nbsp;·&nbsp; ✗ Failed: {result.failed}
            </Alert>
            {result.status === 'PENDING' && (
              <Alert severity='info' sx={{ fontSize: 12 }}>
                Bulk registration submitted. requestId:{' '}
                <strong>{result.requestId}</strong>
                <br />
                ALS is processing — results will appear within seconds.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Close
        </Button>
        <Button
          variant='contained'
          onClick={handleUpload}
          disabled={!file || uploading}
          startIcon={
            uploading ? (
              <ImSpinner4 className='animate-spin' />
            ) : (
              <FileUploadIcon />
            )
          }
          sx={{
            textTransform: 'none',
            bgcolor: '#05569f',
            '&:hover': { bgcolor: '#044a8a' },
          }}
        >
          {uploading ? 'Uploading…' : 'Upload & Register'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ================================================================
//  MAIN PAGE
// ================================================================
function Merchant() {
  const theme = useTheme();
  // ── data ──────────────────────────────────────────────────
  const [parties, setParties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // ── filters ───────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [idTypeFilter, setIdTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ── pagination ────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ── dialogs ───────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // ── fetch ─────────────────────────────────────────────────
  const fetchData = useCallback(
    async (pg = 0, rpp = 10) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (statusFilter) params.set('status', statusFilter);
        if (idTypeFilter) params.set('id_type', idTypeFilter);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        params.set('page', pg + 1);
        params.set('per_page', rpp);

        const res = await fetch(`${API}/api/parties?${params}`, {
          headers: authHeaders(),
        });
        const data = await res.json();

        if (res.ok) {
          setParties(data.data || []);
          setTotal(data.pagination?.total || 0);
        }
      } catch (err) {
        console.error('fetchData:', err);
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter, idTypeFilter, dateFrom, dateTo],
  );

  useEffect(() => {
    setPage(0);
    fetchData(0, rowsPerPage);
  }, [fetchData]);

  const handleStatus = (party, newStatus) => {
    swal({
      title: 'Are you sure?',
      text: `${newStatus === '0' ? 'Deactivate' : 'Activate'} "${party.display_name}"?`,
      icon: 'warning',
      buttons: true,
      dangerMode: newStatus === '0',
    }).then(async (confirmed) => {
      if (!confirmed) return;
      setActionLoading(party.id);
      try {
        const res = await fetch(
          `${API}/api/merchant/update/status/${party.id}`,
          {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status: newStatus }),
          },
        );
        if (res.ok) {
          swal('Updated', 'Merchant status updated.', 'success');
          fetchData(page, rowsPerPage);
        } else {
          swal('Oops!', 'Something went wrong.', 'error');
        }
      } catch {
        swal('Oops!', 'Network error.', 'error');
      } finally {
        setActionLoading(null);
      }
    });
  };

  const handleDelete = (party) => {
    swal({
      title: 'Are you sure?',
      text: `Delete "${party.display_name}"? This will also delete linked users.`,
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then(async (confirmed) => {
      if (!confirmed) return;
      setActionLoading(party.id);
      try {
        const res = await fetch(`${API}/api/parties/${party.id}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
        if (res.ok) {
          swal('Deleted', 'Merchant deleted.', 'success');
          fetchData(page, rowsPerPage);
        } else {
          swal('Oops!', 'Something went wrong.', 'error');
        }
      } catch {
        swal('Oops!', 'Network error.', 'error');
      } finally {
        setActionLoading(null);
      }
    });
  };

  const hasFilters = statusFilter || idTypeFilter || dateFrom || dateTo;

  const activeCount = parties.filter((p) => p.status === '1').length;
  const inactiveCount = parties.filter((p) => p.status === '0').length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant='h5' fontWeight={600}>
            <span className='text-[#05569f]'>Merchant</span> List
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Tooltip title='Refresh'>
            <IconButton
              onClick={() => fetchData(page, rowsPerPage)}
              sx={{ border: `1px solid ${alpha('#05569f', 0.2)}` }}
            >
              <RefreshIcon fontSize='small' />
            </IconButton>
          </Tooltip>

          {/* <Button
            variant='outlined'
            startIcon={<PiFileCsvFill />}
            onClick={() => setCsvOpen(true)}
            sx={{
              textTransform: 'none',
              borderColor: alpha('#05569f', 0.4),
              color: '#05569f',
              '&:hover': {
                borderColor: '#05569f',
                bgcolor: alpha('#05569f', 0.04),
              },
            }}
          >
            Upload CSV
          </Button>  */}

          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => {
              setEditData(null);
              setFormOpen(true);
            }}
            sx={{
              textTransform: 'none',
              bgcolor: '#05569f',
              '&:hover': { bgcolor: '#044a8a' },
            }}
          >
            Add Merchant
          </Button>
        </Box>
      </Box>

      {/* ── Summary chips ── */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        {[
          { label: `${total} Total`, color: '#05569f' },
          { label: `${activeCount} Active`, color: '#059669' },
          { label: `${inactiveCount} Inactive`, color: '#dc2626' },
        ].map(({ label, color }) => (
          <Chip
            key={label}
            label={label}
            size='small'
            sx={{
              fontWeight: 700,
              fontSize: 12,
              bgcolor: alpha(color, 0.08),
              color,
              borderRadius: 0,
            }}
          />
        ))}
      </Box>

      {/* ── Search + Filter bar ── */}
      <Paper
        elevation={0}
        component='form'
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
          fetchData(0, rowsPerPage);
        }}
        sx={{
          border: `1px solid ${alpha('#05569f', 0.12)}`,
          borderRadius: 2,
          p: 2,
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <TextField
            size='small'
            placeholder='Search by name, ID value, NID, account…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon color='action' sx={{ mr: 1, fontSize: 18 }} />
              ),
            }}
            sx={{ flex: '1 1 240px', minWidth: 200 }}
          />

          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label='Status'
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value=''>All</MenuItem>
              <MenuItem value='1'>Active</MenuItem>
              <MenuItem value='0'>Inactive</MenuItem>
            </Select>
          </FormControl>

          <Button
            type='submit'
            variant='contained'
            sx={{
              textTransform: 'none',
              bgcolor: '#05569f',
              '&:hover': { bgcolor: '#044a8a' },
            }}
          >
            Search
          </Button>

          {/* Advanced filter toggle */}
          <Tooltip title='More filters'>
            <IconButton
              onClick={() => setShowFilters((p) => !p)}
              sx={{
                border: `1px solid ${alpha('#05569f', hasFilters ? 1 : 0.2)}`,
                bgcolor: hasFilters ? alpha('#05569f', 0.08) : 'transparent',
                color: hasFilters ? '#05569f' : 'inherit',
                position: 'relative',
              }}
            >
              <TuneIcon fontSize='small' />
              {hasFilters && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#05569f',
                  }}
                />
              )}
            </IconButton>
          </Tooltip>

          {(search || hasFilters) && (
            <Button
              variant='text'
              size='small'
              startIcon={<CloseIcon fontSize='small' />}
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setIdTypeFilter('');
                setDateFrom('');
                setDateTo('');
              }}
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              Reset
            </Button>
          )}
        </Box>

        {/* Advanced filters */}
        <Collapse in={showFilters}>
          <Divider sx={{ my: 1.5 }} />
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <FormControl size='small' sx={{ minWidth: 160 }}>
              <InputLabel>ID Type</InputLabel>
              <Select
                value={idTypeFilter}
                label='ID Type'
                onChange={(e) => setIdTypeFilter(e.target.value)}
              >
                <MenuItem value=''>All Types</MenuItem>
                {[
                  'MSISDN',
                  'ACCOUNT_ID',
                  'EMAIL',
                  'PERSONAL_ID',
                  'BUSINESS',
                  'DEVICE',
                  'IBAN',
                  'ALIAS',
                ].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size='small'
              label='Registered From'
              type='date'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 165 }}
            />

            <TextField
              size='small'
              label='Registered To'
              type='date'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 165 }}
            />
          </Box>
        </Collapse>
      </Paper>

      {/* ── Table ── */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: `1px solid ${alpha('#05569f', 0.1)}`,
          borderRadius: 1,
          overflowX: 'auto',
        }}
      >
        {loading && <LinearProgress />}

        <Table size='small'>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                Merchant
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>DOB</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                Limits
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                Registered
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align='center'>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!loading && parties.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align='center'
                  sx={{ py: 6, color: 'text.secondary' }}
                >
                  <Typography fontSize={28} mb={0.5}>
                    <ImFileEmpty />
                  </Typography>
                  <Typography fontWeight={600}>No merchants found</Typography>
                  <Typography variant='caption'>
                    Try adjusting your search or filters
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              parties.map((party, idx) => {
                const isExpanded = expandedId === party.id;
                const isActioning = actionLoading === party.id;
                const sc = STATUS_CFG[party.status] || STATUS_CFG['0'];

                return (
                  <React.Fragment key={party.id}>
                    <TableRow
                      hover
                      selected={isExpanded}
                      sx={{
                        opacity: party.status === '0' ? 0.65 : 1,
                        transition: 'all 0.15s',
                        '&.Mui-selected': { bgcolor: alpha('#05569f', 0.04) },
                        '&:hover': { bgcolor: alpha('#05569f', 0.03) },
                      }}
                    >
                      <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>

                      {/* Merchant name + avatar */}
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: 13,
                              fontWeight: 700,
                              bgcolor: alpha(
                                avatarBg(party.display_name),
                                0.15,
                              ),
                              color: avatarBg(party.display_name),
                            }}
                          >
                            {party.display_name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography
                              fontSize={13}
                              fontWeight={600}
                              lineHeight={1.2}
                            >
                              {party.display_name}
                            </Typography>
                            {party.acc_no && (
                              <Typography fontSize={10} color='text.secondary'>
                                Acc: {party.acc_no}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* ID type + value */}
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: alpha('#05569f', 0.07),
                            mb: 0.25,
                          }}
                        >
                          <Typography
                            fontSize={10}
                            fontWeight={700}
                            color='#05569f'
                          >
                            {party.id_type}
                          </Typography>
                        </Box>
                        <Typography fontSize={12} fontFamily='monospace'>
                          {party.id_value}
                        </Typography>
                      </TableCell>

                      {/* DOB */}
                      <TableCell>
                        <Typography fontSize={12} color='text.secondary'>
                          {party.dob || '—'}
                        </Typography>
                      </TableCell>

                      {/* Limits */}
                      <TableCell>
                        <Typography fontSize={11} color='text.secondary'>
                          Daily:{' '}
                          <strong>
                            ৳{Number(party.daily_limit || 0).toLocaleString()}
                          </strong>
                        </Typography>
                        <Typography fontSize={11} color='text.secondary'>
                          Single:{' '}
                          <strong>
                            ৳
                            {Number(
                              party.single_transaction_limit || 0,
                            ).toLocaleString()}
                          </strong>
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: sc.bg,
                            color: sc.color,
                          }}
                        >
                          {party.status === '1' ? (
                            <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />
                          ) : (
                            <CancelOutlinedIcon sx={{ fontSize: 13 }} />
                          )}
                          <Typography fontSize={11} fontWeight={700}>
                            {sc.label}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <Typography
                          fontSize={11}
                          color='text.secondary'
                          whiteSpace='nowrap'
                        >
                          {fmtDate(party.created_at)}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align='center'>
                        {isActioning ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 0.5,
                            }}
                          >
                            <ImSpinner4 className='animate-spin' size={13} />
                            <Typography fontSize={11} color='text.secondary'>
                              …
                            </Typography>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 0.25,
                            }}
                          >
                            {/* Detail expand */}
                            <Tooltip title='View details'>
                              <IconButton
                                size='small'
                                onClick={() =>
                                  setExpandedId(isExpanded ? null : party.id)
                                }
                                sx={{
                                  color: isExpanded
                                    ? '#05569f'
                                    : 'text.secondary',
                                  bgcolor: isExpanded
                                    ? alpha('#05569f', 0.1)
                                    : 'transparent',
                                }}
                              >
                                <VisibilityIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>

                            {party.status === '1' ? (
                              <Tooltip title='Deactivate'>
                                <IconButton
                                  size='small'
                                  color='warning'
                                  onClick={() => handleStatus(party, '0')}
                                >
                                  <TbUserCancel size={18} />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title='Activate'>
                                <IconButton
                                  size='small'
                                  color='success'
                                  onClick={() => handleStatus(party, '1')}
                                >
                                  <PiUserCircleCheckFill size={18} />
                                </IconButton>
                              </Tooltip>
                            )}

                            {/* Edit */}
                            <Tooltip title='Edit'>
                              <IconButton
                                size='small'
                                color='primary'
                                onClick={() => {
                                  setEditData(party);
                                  setFormOpen(true);
                                }}
                              >
                                <LiaEdit size={18} />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title='Delete'>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => handleDelete(party)}
                              >
                                <AiFillDelete size={18} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>

                    {isExpanded && <DetailRow merchant={party} colSpan={8} />}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 1.5,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant='caption' color='text.secondary'>
          Showing {parties.length} of {total} merchants
          {(search || hasFilters) && ' (filtered)'}
        </Typography>
        <TablePagination
          component='div'
          count={total}
          page={page}
          onPageChange={(_, np) => {
            setPage(np);
            fetchData(np, rowsPerPage);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            const rpp = parseInt(e.target.value, 10);
            setRowsPerPage(rpp);
            setPage(0);
            fetchData(0, rpp);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{ '.MuiTablePagination-toolbar': { minHeight: 40 } }}
        />
      </Box>
      <MerchantFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditData(null);
        }}
        onSaved={() => fetchData(page, rowsPerPage)}
        editData={editData}
      />

      <CsvUploadDialog
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onDone={() => {
          setCsvOpen(false);
          fetchData(0, rowsPerPage);
        }}
      />
    </Box>
  );
}

export default Merchant;
