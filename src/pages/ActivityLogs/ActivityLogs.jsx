import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Avatar,
  Collapse,
  Divider,
  TablePagination,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import LaptopIcon from '@mui/icons-material/Laptop';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TuneIcon from '@mui/icons-material/Tune';
import { ImFileEmpty } from 'react-icons/im';

// helpers
const API = import.meta.env.VITE_APP_SERVER;
const TOKEN = () => localStorage.getItem('dfsp_v2_token') || '';
const USER = () => {
  try {
    return JSON.parse(localStorage.getItem('dfsp_v2_user') || '{}');
  } catch {
    return {};
  }
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN()}`,
});

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—';

const fmtDateShort = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      })
    : '—';

const AVATAR_COLORS = [
  '#05569f',
  '#7c3aed',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
];
const avatarColor = (str = '') =>
  AVATAR_COLORS[(str.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export default function ActivityLogs() {
  const theme = useTheme();
  const user = USER();
  const isAdmin = user?.role === 'ADMIN';

  // data
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const fetchLogs = useCallback(
    async (pg = 0, rpp = 20) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (roleFilter) params.set('role', roleFilter);
        if (statusFilter) params.set('status', statusFilter);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        params.set('page', pg + 1);
        params.set('per_page', rpp);

        const res = await fetch(`${API}/api/activity-logs?${params}`, {
          headers: authHeaders(),
        });
        const json = await res.json();
        if (res.ok) {
          setLogs(json.data || []);
          setTotal(json.pagination?.total || 0);
        }
      } catch (_) {
      } finally {
        setLoading(false);
      }
    },
    [search, roleFilter, statusFilter, dateFrom, dateTo],
  );

  useEffect(() => {
    fetchLogs(0, rowsPerPage);
  }, []);

  const handleSearch = () => {
    setPage(0);
    fetchLogs(0, rowsPerPage);
  };
  const handleReset = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setTimeout(() => {
      setPage(0);
      fetchLogs(0, rowsPerPage);
    }, 50);
  };

  const hasFilters = search || roleFilter || statusFilter || dateFrom || dateTo;

  const s = stats?.summary || {};

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box>
          <Typography variant='h5' fontWeight={700}>
            <span style={{ color: '#05569f' }}>Activity</span> Logs
          </Typography>
        </Box>
        <Tooltip title='Refresh'>
          <IconButton
            onClick={() => {
              fetchLogs(page, rowsPerPage);
            }}
            sx={{ border: `1px solid ${alpha('#05569f', 0.2)}` }}
          >
            <RefreshIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${alpha('#05569f', 0.12)}`,
          borderRadius: 0,
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
            placeholder='Search username or email…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <SearchIcon color='action' sx={{ mr: 1, fontSize: 18 }} />
              ),
            }}
            sx={{ flex: '1 1 220px', minWidth: 180 }}
          />

          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label='Status'
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value=''>All</MenuItem>
              <MenuItem value='SUCCESS'>Success</MenuItem>
              <MenuItem value='FAILED'>Failed</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant='contained'
            onClick={handleSearch}
            sx={{
              textTransform: 'none',
              bgcolor: '#05569f',
              '&:hover': { bgcolor: '#044a8a' },
            }}
          >
            Search
          </Button>

          {/* Advanced filters toggle */}
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

          {hasFilters && (
            <Button
              variant='text'
              size='small'
              startIcon={<CloseIcon fontSize='small' />}
              onClick={handleReset}
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              Reset
            </Button>
          )}
        </Box>

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
            {isAdmin && (
              <FormControl size='small' sx={{ minWidth: 130 }}>
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
            )}
            <TextField
              size='small'
              label='Date From'
              type='date'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 155 }}
            />
            <TextField
              size='small'
              label='Date To'
              type='date'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 155 }}
            />
          </Box>
        </Collapse>
      </Paper>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: `1px solid ${alpha('#05569f', 0.1)}`,
          borderRadius: 1.5,
          overflowX: 'auto',
        }}
      >
        {loading && <LinearProgress />}

        <Table size='small'>
          <TableHead sx={{ bgcolor: alpha('#05569f', 0.06) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>User</TableCell>
              {isAdmin && (
                <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>
                  Role
                </TableCell>
              )}
              <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>
                IP Address
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>
                Location
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>
                Browser / OS
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>
                Device
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>
                Login Time
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!loading && logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 9 : 8}
                  align='center'
                  sx={{ py: 6 }}
                >
                  <Typography mb={0.5}>
                    <ImFileEmpty className='mx-auto' size={30} />
                  </Typography>
                  <Typography fontWeight={600} color='text.secondary'>
                    No activity logs found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs?.map((log, idx) => (
                <TableRow
                  key={log.id}
                  hover
                  sx={{
                    '&:hover': { bgcolor: alpha('#05569f', 0.025) },
                    transition: 'background .15s',
                  }}
                >
                  <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>
                    {page * rowsPerPage + idx + 1}
                  </TableCell>

                  {/* User */}
                  <TableCell>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}
                    >
                      <Avatar
                        sx={{
                          width: 30,
                          height: 30,
                          fontSize: 12,
                          fontWeight: 700,
                          bgcolor: alpha(avatarColor(log.username), 0.15),
                          color: avatarColor(log.username),
                        }}
                      >
                        {log.username?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography
                          fontSize={13}
                          fontWeight={600}
                        >
                          {log.username}
                        </Typography>
                        <Typography fontSize={10} color='text.secondary'>
                          {log.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Role — ADMIN view only */}
                  {isAdmin && (
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 1,
                          bgcolor:
                            log.role === 'ADMIN'
                              ? alpha('#d97706', 0.1)
                              : alpha('#05569f', 0.08),
                          color: log.role === 'ADMIN' ? '#d97706' : '#05569f',
                        }}
                      >
                        {log.role === 'ADMIN' ? (
                          <AdminPanelSettingsIcon sx={{ fontSize: 11 }} />
                        ) : (
                          <StorefrontIcon sx={{ fontSize: 11 }} />
                        )}
                        <Typography fontSize={10} fontWeight={700}>
                          {log.role}
                        </Typography>
                      </Box>
                      {log.merchant_name && (
                        <Typography
                          fontSize={10}
                          color='text.secondary'
                          mt={0.25}
                        >
                          {log.merchant_name}
                        </Typography>
                      )}
                    </TableCell>
                  )}

                  {/* IP */}
                  <TableCell>
                    <Typography
                      fontSize={11}
                      fontFamily='monospace'
                      color='text.secondary'
                    >
                      {log.ip_address || '—'}
                    </Typography>
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    {log.country || log.city ? (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <LocationOnIcon
                          sx={{ fontSize: 13, color: '#05569f' }}
                        />
                        <Box>
                          <Typography fontSize={11} fontWeight={500}>
                            {log.city || '—'}
                          </Typography>
                          <Typography fontSize={10} color='text.secondary'>
                            {log.country || '—'}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography fontSize={11} color='text.secondary'>
                        —
                      </Typography>
                    )}
                  </TableCell>

                  {/* Browser / OS */}
                  <TableCell>
                    <Typography fontSize={11} fontWeight={500}>
                      {log.browser || '—'}
                    </Typography>
                    <Typography fontSize={10} color='text.secondary'>
                      {log.os || '—'}
                    </Typography>
                  </TableCell>

                  {/* Device */}
                  <TableCell>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      {log.is_mobile ? (
                        <PhoneAndroidIcon
                          sx={{ fontSize: 14, color: '#059669' }}
                        />
                      ) : (
                        <LaptopIcon sx={{ fontSize: 14, color: '#05569f' }} />
                      )}
                      <Typography fontSize={11} color='text.secondary'>
                        {log.device || '—'}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.4,
                        px: 0.85,
                        py: 0.2,
                        borderRadius: 1,
                        bgcolor:
                          log.status === 'SUCCESS' ? '#dcfce7' : '#fee2e2',
                        color: log.status === 'SUCCESS' ? '#166534' : '#991b1b',
                      }}
                    >
                      {log.status === 'SUCCESS' ? (
                        <CheckCircleIcon sx={{ fontSize: 11 }} />
                      ) : (
                        <CancelIcon sx={{ fontSize: 11 }} />
                      )}
                      <Typography fontSize={10} fontWeight={700}>
                        {log.status}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Login time */}
                  <TableCell>
                    <Typography
                      fontSize={11}
                      color='text.secondary'
                      whiteSpace='nowrap'
                    >
                      {fmtDate(log.login_time)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
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
          Showing {logs.length} of {total.toLocaleString()} records
          {hasFilters && ' (filtered)'}
        </Typography>
        <TablePagination
          component='div'
          count={total}
          page={page}
          onPageChange={(_, np) => {
            setPage(np);
            fetchLogs(np, rowsPerPage);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            const rpp = parseInt(e.target.value, 10);
            setRowsPerPage(rpp);
            setPage(0);
            fetchLogs(0, rpp);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          sx={{ '.MuiTablePagination-toolbar': { minHeight: 40 } }}
        />
      </Box>
    </Box>
  );
}
