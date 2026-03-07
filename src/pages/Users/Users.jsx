import { useState, useEffect, useCallback } from 'react';
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
  Switch,
  FormControlLabel,
  Tooltip,
  InputAdornment,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import swal from 'sweetalert';
import { ImSpinner4 } from 'react-icons/im';

const API = import.meta.env.VITE_APP_SERVER;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('dfsp_v2_token') || ''}`,
});

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

function getInitials(name, username) {
  const n = name || username || '?';
  return n
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  '#05569f',
  '#7c3aed',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#db2777',
  '#9333ea',
  '#16a34a',
  '#b45309',
];
const avatarColor = (str) =>
  AVATAR_COLORS[(str || '').charCodeAt(0) % AVATAR_COLORS.length];

function UserFormDialog({ open, onClose, onSaved, editUser, merchants }) {
  const theme = useTheme();
  const isEdit = !!editUser?.id;

  const empty = {
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    merchant_id: '',
    role: 'MERCHANT',
    is_active: 1,
  };

  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setErrors({});
      setShowPw(false);
      setForm(
        isEdit
          ? {
              username: editUser.username || '',
              email: editUser.email || '',
              password: '',
              full_name: editUser.full_name || '',
              phone: editUser.phone || '',
              merchant_id: editUser.merchant_id || '',
              role: editUser.role || 'MERCHANT',
              is_active: editUser.is_active ?? 1,
            }
          : empty,
      );
    }
  }, [open, editUser]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!isEdit && !form.password) e.password = 'Password is required';
    if (!isEdit && form.password.length > 0 && form.password.length < 8)
      e.password = 'Minimum 8 characters';
    if (form?.role !== 'ADMIN') {
      if (!form.merchant_id) e.merchant_id = 'Merchant is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const body = { ...form };
      if (isEdit && !body.password) delete body.password; // skip empty pw on edit

      const url = isEdit
        ? `${API}/api/auth/users/${editUser.id}`
        : `${API}/api/auth/users`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Request failed');

      swal('Success', isEdit ? 'User updated.' : 'User created.', 'success');
      onSaved();
      onClose();
    } catch (err) {
      swal('Error', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const field = (key, label, type = 'text', extra = {}) => (
    <TextField
      fullWidth
      size='small'
      label={label}
      type={type}
      value={form[key]}
      onChange={(e) => set(key, e.target.value)}
      error={!!errors[key]}
      helperText={errors[key]}
      {...extra}
    />
  );

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
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          fontWeight: 700,
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isEdit ? <EditIcon color='primary' /> : <AddIcon color='primary' />}
          {isEdit ? 'Edit User' : 'Add New User'}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <div className='space-y-4 grid mt-5'>
          {/* Row 1 */}
          <Grid item xs={12} sm={6}>
            {field('username', 'Username *')}
          </Grid>
          <Grid item xs={12} sm={6}>
            {field('email', 'Email *', 'email')}
          </Grid>

          {/* Password */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size='small'
              label={
                isEdit ? 'New Password (leave blank to keep)' : 'Password *'
              }
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              error={!!errors.password}
              helperText={
                errors.password ||
                (isEdit
                  ? 'Leave blank to keep current password'
                  : 'Minimum 8 characters')
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      onClick={() => setShowPw((p) => !p)}
                      edge='end'
                    >
                      {showPw ? (
                        <VisibilityOffIcon fontSize='small' />
                      ) : (
                        <VisibilityIcon fontSize='small' />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Full name */}
          <Grid item xs={12} sm={6}>
            {field('full_name', 'Full Name')}
          </Grid>

          {/* Phone */}
          <Grid item xs={12} sm={6}>
            {field('phone', 'Phone')}
          </Grid>

          {/* Role */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size='small'>
              <InputLabel>Role *</InputLabel>
              <Select
                value={form.role}
                label='Role *'
                onChange={(e) => set('role', e.target.value)}
              >
                <MenuItem value='ADMIN'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AdminPanelSettingsIcon fontSize='small' color='error' />{' '}
                    ADMIN
                  </Box>
                </MenuItem>
                <MenuItem value='MERCHANT'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize='small' color='primary' /> MERCHANT
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Merchant */}
          {form?.role == 'MERCHANT' && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size='small' error={!!errors.merchant_id}>
                <InputLabel>Merchant *</InputLabel>
                <Select
                  value={form.merchant_id}
                  label='Merchant *'
                  onChange={(e) => set('merchant_id', e.target.value)}
                >
                  {(merchants || []).map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.display_name || m.id_value}
                    </MenuItem>
                  ))}
                </Select>
                {errors.merchant_id && (
                  <Typography
                    variant='caption'
                    color='error'
                    sx={{ ml: 1.5, mt: 0.5 }}
                  >
                    {errors.merchant_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          )}
          {/* Active toggle (edit only) */}
          {isEdit && (
            <Grid item xs={12}>
              <Divider sx={{ mb: 1 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active === 1}
                    onChange={(e) => set('is_active', e.target.checked ? 1 : 0)}
                    color='success'
                  />
                }
                label={
                  <Typography fontSize={13} fontWeight={600}>
                    Account {form.is_active === 1 ? 'Active' : 'Disabled'}
                  </Typography>
                }
              />
            </Grid>
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
            minWidth: 120,
          }}
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ResetPasswordDialog({ open, onClose, user }) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setPw('');
      setConfirm('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (pw.length < 8) {
      setError('Minimum 8 characters');
      return;
    }
    if (pw !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `${API}/api/auth/users/${user.id}/reset-password`,
        {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ new_password: pw }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      swal('Done', `Password reset for ${user.username}.`, 'success');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='xs'
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <LockResetIcon color='warning' /> Reset Password
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {user && (
          <Alert severity='info' sx={{ mb: 2, fontSize: 12 }}>
            Resetting password for{' '}
            <strong>{user.full_name || user.username}</strong>
          </Alert>
        )}
        {error && (
          <Alert severity='error' sx={{ mb: 2, fontSize: 12 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          size='small'
          label='New Password'
          type={showPw ? 'text' : 'password'}
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            setError('');
          }}
          sx={{ mb: 2 }}
          helperText='Minimum 8 characters'
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  size='small'
                  onClick={() => setShowPw((p) => !p)}
                  edge='end'
                >
                  {showPw ? (
                    <VisibilityOffIcon fontSize='small' />
                  ) : (
                    <VisibilityIcon fontSize='small' />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          size='small'
          label='Confirm Password'
          type={showPw ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setError('');
          }}
        />
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
          color='warning'
          onClick={handleSubmit}
          disabled={saving}
          startIcon={
            saving ? <ImSpinner4 className='animate-spin' /> : <LockResetIcon />
          }
          sx={{ textTransform: 'none', minWidth: 130 }}
        >
          {saving ? 'Resetting…' : 'Reset Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Users() {
  const theme = useTheme();

  const [users, setUsers] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);

  const fetchUsers = useCallback(
    async (pg = 0, rpp = 10) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (roleFilter) params.set('role', roleFilter);
        if (activeFilter !== '') params.set('is_active', activeFilter);
        params.set('page', pg + 1);
        params.set('per_page', rpp);

        const res = await fetch(`${API}/api/auth/users?${params}`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(data.data || []);
          setTotal(data.pagination?.total || 0);
        }
      } catch (err) {
        console.error('fetchUsers:', err);
      } finally {
        setLoading(false);
      }
    },
    [search, roleFilter, activeFilter],
  );

  const fetchMerchants = async () => {
    try {
      const res = await fetch(`${API}/api/parties?per_page=200`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) setMerchants(data.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  useEffect(() => {
    setPage(0);
    fetchUsers(0, rowsPerPage);
  }, [fetchUsers]);

  const handleChangePage = (_, np) => {
    setPage(np);
    fetchUsers(np, rowsPerPage);
  };
  const handleChangeRowsPerPage = (e) => {
    const rpp = parseInt(e.target.value, 10);
    setRowsPerPage(rpp);
    setPage(0);
    fetchUsers(0, rpp);
  };

  const handleToggleActive = (user) => {
    const action = user.is_active ? 'Disable' : 'Enable';
    swal({
      title: 'Are you sure?',
      text: `${action} account for "${user.username}"?`,
      icon: 'warning',
      buttons: true,
      dangerMode: !user.is_active,
    }).then(async (confirmed) => {
      if (!confirmed) return;
      setActionLoading(user.id);
      try {
        const res = await fetch(`${API}/api/auth/users/${user.id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ is_active: user.is_active ? 0 : 1 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        swal('Done', `Account ${action.toLowerCase()}d.`, 'success');
        fetchUsers(page, rowsPerPage);
      } catch (err) {
        swal('Error', err.message, 'error');
      } finally {
        setActionLoading(null);
      }
    });
  };

  const handleDelete = (user) => {
    swal({
      title: 'Deactivate user?',
      text: `"${user.username}" will be deactivated and cannot log in.`,
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then(async (confirmed) => {
      if (!confirmed) return;
      setActionLoading(user.id);
      try {
        const res = await fetch(`${API}/api/auth/users/${user.id}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        swal('Done', 'User deactivated.', 'success');
        fetchUsers(page, rowsPerPage);
      } catch (err) {
        swal('Error', err.message, 'error');
      } finally {
        setActionLoading(null);
      }
    });
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setFormOpen(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers(0, rowsPerPage);
  };

  const adminCount = users?.filter((u) => u?.role === 'ADMIN').length;
  const activeCount = users?.filter((u) => u?.is_active).length;
  const inactiveCount = users?.filter((u) => !u?.is_active).length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant='h5' fontWeight={600}>
            <span className='text-[#05569f]'>User</span> Management
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Tooltip title='Refresh'>
            <IconButton
              onClick={() => fetchUsers(page, rowsPerPage)}
              sx={{ border: `1px solid ${alpha('#05569f', 0.2)}` }}
            >
              <RefreshIcon fontSize='small' />
            </IconButton>
          </Tooltip>

          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => {
              setEditUser(null);
              setFormOpen(true);
            }}
            sx={{
              textTransform: 'none',
              bgcolor: '#05569f',
              '&:hover': { bgcolor: '#044a8a' },
            }}
          >
            Add User
          </Button>
        </Box>
      </Box>
      {/* <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        {[
          {
            label: `${total} Total`,
            bg: alpha('#05569f', 0.08),
            color: '#05569f',
          },
          {
            label: `${activeCount} Active`,
            bg: alpha('#059669', 0.08),
            color: '#059669',
          },
          {
            label: `${inactiveCount} Inactive`,
            bg: alpha('#dc2626', 0.08),
            color: '#dc2626',
          },
          {
            label: `${adminCount} Admins`,
            bg: alpha('#d97706', 0.08),
            color: '#d97706',
          },
        ].map(({ label, bg, color }) => (
          <Chip
            key={label}
            label={label}
            size='small'
            sx={{
              fontWeight: 700,
              fontSize: 12,
              bgcolor: bg,
              color,
              border: `1px solid ${alpha(color, 0.2)}`,
            }}
          />
        ))}
      </Box> */}
      <Paper
        elevation={0}
        component='form'
        onSubmit={handleSearch}
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
            placeholder='Search by name, username or email…'
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
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label='Role'
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value=''>All Roles</MenuItem>
              <MenuItem value='ADMIN'>Admin</MenuItem>
              <MenuItem value='MERCHANT'>Merchant</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={activeFilter}
              label='Status'
              onChange={(e) => setActiveFilter(e.target.value)}
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

          {(search || roleFilter || activeFilter !== '') && (
            <Button
              variant='text'
              size='small'
              sx={{ textTransform: 'none', color: 'text.secondary' }}
              onClick={() => {
                setSearch('');
                setRoleFilter('');
                setActiveFilter('');
              }}
            >
              Reset
            </Button>
          )}
        </Box>
      </Paper>

      {/* ── Table ── */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: `1px solid ${alpha('#05569f', 0.1)}`,
          borderRadius: 2,
          overflowX: 'auto',
        }}
      >
        {loading && <LinearProgress />}

        <Table size='small'>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                Username
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                Merchant
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                Last Login
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                Joined
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align='center'>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!loading && users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  align='center'
                  sx={{ py: 6, color: 'text.secondary' }}
                >
                  <Typography fontSize={28} mb={0.5}>
                    👤
                  </Typography>
                  <Typography fontWeight={600}>No users found</Typography>
                  <Typography variant='caption'>
                    Try adjusting your search filters
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, idx) => {
                const isActioning = actionLoading === user.id;
                const initials = getInitials(user.full_name, user.username);
                const bgColor = avatarColor(user.username);

                return (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      opacity: !user.is_active ? 0.6 : 1,
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: alpha('#05569f', 0.03) },
                    }}
                  >
                    {/* # */}
                    <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {page * rowsPerPage + idx + 1}
                    </TableCell>

                    {/* User */}
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                      >
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            fontSize: 13,
                            fontWeight: 700,
                            bgcolor: alpha(bgColor, 0.15),
                            color: bgColor,
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Box>
                          <Typography
                            fontSize={13}
                            fontWeight={600}
                            lineHeight={1.2}
                          >
                            {user.full_name || '—'}
                          </Typography>
                          <Typography fontSize={11} color='text.secondary'>
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Username */}
                    <TableCell>
                      <Typography
                        fontSize={12}
                        fontFamily='monospace'
                        color='#05569f'
                      >
                        @{user.username}
                      </Typography>
                      {user.phone && (
                        <Typography fontSize={10} color='text.secondary'>
                          {user.phone}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Chip
                        icon={
                          user.role === 'ADMIN' ? (
                            <AdminPanelSettingsIcon
                              sx={{ fontSize: '14px !important' }}
                            />
                          ) : (
                            <PersonIcon sx={{ fontSize: '14px !important' }} />
                          )
                        }
                        label={user.role}
                        size='small'
                        sx={{
                          fontSize: 10,
                          fontWeight: 700,
                          height: 22,
                          bgcolor:
                            user.role === 'ADMIN'
                              ? alpha('#d97706', 0.1)
                              : alpha('#05569f', 0.1),
                          color: user.role === 'ADMIN' ? '#b45309' : '#05569f',
                          border: `1px solid ${user.role === 'ADMIN' ? alpha('#d97706', 0.2) : alpha('#05569f', 0.2)}`,
                          '.MuiChip-icon': {
                            color:
                              user.role === 'ADMIN' ? '#b45309' : '#05569f',
                          },
                        }}
                      />
                    </TableCell>

                    {/* Merchant */}
                    <TableCell>
                      <Typography fontSize={12} noWrap sx={{ maxWidth: 130 }}>
                        {user.merchant_name || '—'}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        {user.is_active ? (
                          <CheckCircleIcon
                            sx={{ fontSize: 15, color: '#059669' }}
                          />
                        ) : (
                          <CancelIcon sx={{ fontSize: 15, color: '#dc2626' }} />
                        )}
                        <Typography
                          fontSize={11}
                          fontWeight={700}
                          color={user.is_active ? 'success.main' : 'error.main'}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Last Login */}
                    <TableCell>
                      <Typography
                        fontSize={11}
                        color='text.secondary'
                        whiteSpace='nowrap'
                      >
                        {fmtDate(user.last_login)}
                      </Typography>
                    </TableCell>

                    {/* Joined */}
                    <TableCell>
                      <Typography
                        fontSize={11}
                        color='text.secondary'
                        whiteSpace='nowrap'
                      >
                        {fmtDate(user.created_at)}
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
                          <ImSpinner4 className='animate-spin' size={14} />
                          <Typography fontSize={11} color='text.secondary'>
                            Working…
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
                          {/* Enable / Disable toggle */}
                          <Tooltip
                            title={
                              user.is_active
                                ? 'Disable account'
                                : 'Enable account'
                            }
                          >
                            <IconButton
                              size='small'
                              onClick={() => handleToggleActive(user)}
                              color={user.is_active ? 'warning' : 'success'}
                            >
                              {user.is_active ? (
                                <CancelIcon fontSize='small' />
                              ) : (
                                <CheckCircleIcon fontSize='small' />
                              )}
                            </IconButton>
                          </Tooltip>

                          {/* Edit */}
                          <Tooltip title='Edit user'>
                            <IconButton
                              size='small'
                              color='primary'
                              onClick={() => handleEdit(user)}
                            >
                              <EditIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>

                          {/* Reset password */}
                          <Tooltip title='Reset password'>
                            <IconButton
                              size='small'
                              color='secondary'
                              onClick={() => setResetUser(user)}
                              sx={{ color: '#d97706' }}
                            >
                              <LockResetIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>

                          {/* Delete */}
                          <Tooltip title='Deactivate & remove'>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleDelete(user)}
                            >
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Pagination ── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant='caption' color='text.secondary'>
          Showing {users.length} of {total} users
        </Typography>
        <TablePagination
          component='div'
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
          sx={{ '.MuiTablePagination-toolbar': { minHeight: 40 } }}
        />
      </Box>

      {/* ── Dialogs ── */}
      <UserFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditUser(null);
        }}
        onSaved={() => fetchUsers(page, rowsPerPage)}
        editUser={editUser}
        merchants={merchants}
      />

      <ResetPasswordDialog
        open={!!resetUser}
        onClose={() => setResetUser(null)}
        user={resetUser}
      />
    </Box>
  );
}
