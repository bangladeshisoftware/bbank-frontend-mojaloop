import React, { useEffect, useState, useCallback } from 'react';
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
  TablePagination,
  useTheme,
  alpha,
  IconButton,
  LinearProgress,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Collapse,
  Divider,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import { ImFileEmpty } from 'react-icons/im';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG = {
  PENDING: { color: 'default', label: 'Pending' },
  QUOTE_REQUESTED: { color: 'info', label: 'Quote Req.' },
  QUOTE_RECEIVED: { color: 'info', label: 'Quote Rcv.' },
  TRANSFER_SENT: { color: 'warning', label: 'Sent' },
  COMMITTED: { color: 'success', label: 'Committed' },
  FAILED: { color: 'error', label: 'Failed' },
  EXPIRED: { color: 'error', label: 'Expired' },
  ABORTED: { color: 'error', label: 'Aborted' },
};

const TYPE_COLORS = {
  P2P: '#05569f',
  INSTANT: '#7c3aed',
  BULK: '#0891b2',
  NPSB: '#059669',
  RTGS: '#d97706',
  BEFTN: '#dc2626',
};

const SUMMARY_ICONS = {
  P2P: '👤',
  INSTANT: '⚡',
  BULK: '📦',
  NPSB: '🏦',
  RTGS: '🏛️',
  BEFTN: '🔄',
};

const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const truncate = (str, n = 14) =>
  str && str.length > n ? str.slice(0, n) + '…' : str || '—';

function SummaryCard({ data, theme }) {
  const color = TYPE_COLORS[data.type] || theme.palette.primary.main;
  return (
    <Card
      elevation={0}
      className='md:min-w-95 w-full'
      sx={{
        borderRadius: 0,
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        width: '100%',
        '&:hover': { boxShadow: `1px 2px 10px 0 ${alpha(color, 0.15)}` },
      }}
    >
      {/* accent bar */}
      <Box sx={{ height: 3, bgcolor: color, width: '100%' }} />
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2, width: '100%' } }}>
        {/* header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                bgcolor: alpha(color, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              {SUMMARY_ICONS[data.type]}
            </Box>
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
                lineHeight={1}
              >
                Transaction Type
              </Typography>
              <Typography fontWeight={700} fontSize={15} color={color}>
                {data.type}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={data.total_count}
            size='small'
            sx={{
              bgcolor: alpha(color, 0.1),
              color,
              fontWeight: 700,
              fontSize: 12,
            }}
          />
        </Box>

        {/* amounts */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant='caption' color='text.secondary'>
            Total Volume
          </Typography>
          <Typography fontWeight={700} fontSize={17} color='text.primary'>
            ৳ {fmt(data.total_amount)}
          </Typography>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* sub stats */}
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Box
              sx={{
                px: 1.75,
                py: 0.55,
                borderRadius: 1,
                bgcolor: alpha('#059669', 0.07),
              }}
            >
              <Typography
                variant='caption'
                color='success.main'
                fontWeight={600}
              >
                Committed
              </Typography>
              <Typography fontSize={12} fontWeight={700} color='success.dark'>
                {data.committed_count} · ৳{fmt(data.committed_amount)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              sx={{
                px: 1.75,
                py: 0.55,
                borderRadius: 1,
                bgcolor: alpha('#dc2626', 0.07),
              }}
            >
              <Typography variant='caption' color='error.main' fontWeight={600}>
                Failed
              </Typography>
              <Typography fontSize={12} fontWeight={700} color='error.dark'>
                {data.failed_count} txn
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              sx={{
                px: 1.75,
                py: 0.55,
                borderRadius: 1,
                bgcolor: alpha('#05569f', 0.07),
              }}
            >
              <Typography
                variant='caption'
                color='primary.main'
                fontWeight={600}
              >
                Send
              </Typography>
              <Typography fontSize={12} fontWeight={700}>
                {data.send?.total_count || 0}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              sx={{
                px: 1.75,
                py: 0.55,
                borderRadius: 1,
                bgcolor: alpha('#7c3aed', 0.07),
              }}
            >
              <Typography
                variant='caption'
                sx={{ color: '#7c3aed' }}
                fontWeight={600}
              >
                Receive
              </Typography>
              <Typography fontSize={12} fontWeight={700}>
                {data.receive?.total_count || 0}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function DetailRow({ trx, colSpan }) {
  const theme = useTheme();
  const fields = [
    ['Transaction ID', trx.transaction_id],
    ['Quote ID', trx.quote_id],
    ['Transfer ID', trx.transfer_id],
    ['Payer FSP', trx.payer_fsp],
    ['Payee FSP', trx.payee_fsp],
    [
      'Payer',
      `${trx.payer_id_type}: ${trx.payer_id_value}${trx.payer_name ? ` (${trx.payer_name})` : ''}`,
    ],
    [
      'Payee',
      `${trx.payee_id_type}: ${trx.payee_id_value}${trx.payee_name ? ` (${trx.payee_name})` : ''}`,
    ],
    ['Fee', `৳ ${fmt(trx.fee)}`],
    ['Receive Amt', `৳ ${fmt(trx.receive_amount)}`],
    ['Expiration', fmtDate(trx.expiration)],
    ['Quote At', fmtDate(trx.quote_at)],
    ['Transfer At', fmtDate(trx.transfer_at)],
    ['Completed At', fmtDate(trx.completed_at)],
    ['Error Code', trx.error_code || '—'],
    ['Error Desc', trx.error_description || '—'],
  ];

  return (
    <TableRow>
      <TableCell colSpan={colSpan} sx={{ p: 0, border: 0 }}>
        <Box
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.025),
            borderLeft: `3px solid ${theme.palette.primary.main}`,
            px: 3,
            py: 2,
          }}
        >
          <Grid container spacing={1.5}>
            {fields.map(([label, val]) => (
              <Grid item xs={12} sm={6} md={4} key={label}>
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

// ─── Main Page ────────────────────────────────────────────────
function Transactions() {
  const theme = useTheme();
  const token = localStorage.getItem('dfsp_v2_token');
  // ── Filter states ─────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState('');
  const [txType, setTxType] = useState('');
  const [status, setStatus] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ── Table states ──────────────────────────────────────────
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 1,
    current_page: 1,
  });
  const [page, setPage] = useState(0); // MUI is 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // ── Summary states ────────────────────────────────────────
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // ── Fetch transactions ────────────────────────────────────
  const fetchTransactions = useCallback(
    async (pageNum = 1, perPage = 10) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (direction) params.set('direction', direction);
        if (search) params.set('search', search);
        if (txType) params.set('type', txType);
        if (status) params.set('status', status);
        if (merchantId) params.set('merchant_id', merchantId);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        params.set('page', pageNum);
        params.set('per_page', perPage);

        const res = await fetch(
          `${import.meta.env.VITE_APP_SERVER}/api/transactions?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();

        if (res.ok) {
          setRows(data.data || []);
          setPagination(data.pagination || {});
        }
      } catch (err) {
        null;
      } finally {
        setLoading(false);
      }
    },
    [direction, search, txType, status, merchantId, dateFrom, dateTo],
  );

  // ── Fetch summary ─────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      if (direction) params.set('direction', direction);

      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER}/api/transactions/summary?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      if (res.ok) setSummary(data.summary);
    } catch (err) {
      null;
    } finally {
      setSummaryLoading(false);
    }
  }, [dateFrom, dateTo, direction]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    setPage(0);
    fetchTransactions(1, rowsPerPage);
  }, [fetchTransactions]);

  // ── Pagination handlers ───────────────────────────────────
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
    fetchTransactions(newPage + 1, rowsPerPage);
  };

  const handleChangeRowsPerPage = (e) => {
    const rpp = parseInt(e.target.value, 10);
    setRowsPerPage(rpp);
    setPage(0);
    fetchTransactions(1, rpp);
  };

  // ── Search submit ─────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchTransactions(1, rowsPerPage);
    fetchSummary();
  };

  const handleReset = () => {
    setSearch('');
    setDirection('');
    setTxType('');
    setStatus('');
    setMerchantId('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters =
    direction || txType || status || merchantId || dateFrom || dateTo;

  // ── Summary cards to show (P2P, NPSB, RTGS, BEFTN) ───────
  const CARD_TYPES = ['P2P', 'INSTANT', 'NPSB', 'RTGS', 'BEFTN',];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* ── Summary Cards ── */}
      <Box sx={{ mb: 3 }}>
        {summaryLoading ? (
          <LinearProgress sx={{ borderRadius: 1, mb: 1 }} />
        ) : (
          <Grid container spacing={2}>
            {CARD_TYPES.map((type) => {
              const cardData = summary?.cards?.[type];
              if (!cardData)
                return (
                  <Grid item xs={12} sm={6} lg={3} key={type}>
                    <Card
                      className='w-full shadow-2xl hover:shadow-2xl'
                      elevation={0}
                      sx={{
                        background: '#fff',
                        border: `1px solid ${alpha(TYPE_COLORS[type], 0.15)}`,
                        borderRadius: 2,
                      }}
                    >
                      {/* <Box sx={{ height: 3, bgcolor: TYPE_COLORS[type] }} /> */}
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography fontWeight={700} color={TYPE_COLORS[type]}>
                          {type}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          No data
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              return (
                <Grid item xs={12} sm={6} lg={3} key={type}>
                  <SummaryCard data={cardData} theme={theme} />
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* ── Page Header ── */}
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
        <Typography variant='h5' fontWeight={600}>
          <span className='text-[#05569f]'>Transaction</span> List
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Direction quick toggle */}
          <Box
            sx={{
              display: 'flex',
              border: `1px solid ${alpha('#05569f', 0.25)}`,
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            {[
              {
                val: '',
                label: 'All',
                icon: <SwapHorizIcon fontSize='small' />,
              },
              {
                val: 'send',
                label: 'Send',
                icon: <ArrowUpwardIcon fontSize='small' />,
              },
              {
                val: 'receive',
                label: 'Receive',
                icon: <ArrowDownwardIcon fontSize='small' />,
              },
            ].map(({ val, label, icon }) => (
              <Button
                key={val}
                size='small'
                startIcon={icon}
                onClick={() => setDirection(val)}
                sx={{
                  textTransform: 'none',
                  borderRadius: 0,
                  px: 1.5,
                  fontSize: 12,
                  fontWeight: 600,
                  bgcolor: direction === val ? '#05569f' : 'transparent',
                  color: direction === val ? '#fff' : 'text.secondary',
                  '&:hover': {
                    bgcolor:
                      direction === val ? '#05569f' : alpha('#05569f', 0.07),
                  },
                  minWidth: 70,
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          <Tooltip title={showFilters ? 'Hide filters' : 'More filters'}>
            <IconButton
              onClick={() => setShowFilters((p) => !p)}
              sx={{
                border: `1px solid ${alpha(theme.palette.primary.main, hasActiveFilters ? 1 : 0.2)}`,
                bgcolor: hasActiveFilters
                  ? alpha('#05569f', 0.08)
                  : 'transparent',
                color: hasActiveFilters ? '#05569f' : 'inherit',
              }}
            >
              <TuneIcon fontSize='small' />
              {hasActiveFilters && (
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

          <Tooltip title='Refresh'>
            <IconButton
              onClick={() => {
                fetchTransactions(page + 1, rowsPerPage);
                fetchSummary();
              }}
              sx={{
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <RefreshIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Search + Filter Bar ── */}
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
        {/* Always visible: search + status + type */}
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
            placeholder='Search by Transfer ID / Quote ID / Transaction ID / Amount…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon color='action' sx={{ mr: 1, fontSize: 18 }} />
              ),
            }}
            sx={{ flex: '1 1 260px', minWidth: 200 }}
          />

          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={txType}
              label='Type'
              onChange={(e) => setTxType(e.target.value)}
            >
              <MenuItem value=''>All Types</MenuItem>
              {['P2P', 'INSTANT', 'BULK', 'NPSB', 'RTGS', 'BEFTN'].map((t) => (
                <MenuItem key={t} value={t}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: TYPE_COLORS[t] || '#999',
                      }}
                    />
                    {t}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label='Status'
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value=''>All Statuses</MenuItem>
              {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                <MenuItem key={val} value={val}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            type='submit'
            variant='contained'
            sx={{
              textTransform: 'none',
              bgcolor: '#05569f',
              '&:hover': { bgcolor: '#044a8a' },
              px: 3,
            }}
          >
            Search
          </Button>

          {hasActiveFilters && (
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

        {/* Collapsible: advanced filters */}
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
            <TextField
              size='small'
              label='Merchant ID'
              placeholder='UUID…'
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              sx={{ minWidth: 200 }}
            />
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

      {/* ── Transactions Table ── */}
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
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                Direction
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                Transfer ID
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                Payer
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                Payee
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align='right'>
                Amount
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align='center'>
                Detail
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!loading && rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  align='center'
                  sx={{ py: 6, color: 'text.secondary' }}
                >
                  <Box>
                    <Typography fontSize={32} align='center' mb={0.5}>
                      <ImFileEmpty className='mx-auto' />
                    </Typography>
                    <Typography fontWeight={600}>
                      No transactions found
                    </Typography>
                    <Typography variant='caption'>
                      Try adjusting your filters
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((trx, idx) => {
                const isExpanded = expandedId === trx.id;
                const sc = STATUS_CONFIG[trx.status] || {
                  color: 'default',
                  label: trx.status,
                };
                const typeColor = TYPE_COLORS[trx.type] || '#888';
                const isOutgoing = trx.direction === 'OUTGOING';

                return (
                  <React.Fragment key={trx.id}>
                    <TableRow
                      hover
                      selected={isExpanded}
                      sx={{
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        '&.Mui-selected': { bgcolor: alpha('#05569f', 0.04) },
                        '&:hover': { bgcolor: alpha('#05569f', 0.03) },
                        ...(isExpanded && { borderBottom: 0 }),
                      }}
                    >
                      <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>

                      {/* Type badge */}
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: alpha(typeColor, 0.1),
                            border: `1px solid ${alpha(typeColor, 0.2)}`,
                          }}
                        >
                          <Typography
                            fontSize={11}
                            fontWeight={700}
                            color={typeColor}
                          >
                            {trx.type}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Direction */}
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          {isOutgoing ? (
                            <ArrowUpwardIcon
                              sx={{ fontSize: 14, color: '#dc2626' }}
                            />
                          ) : (
                            <ArrowDownwardIcon
                              sx={{ fontSize: 14, color: '#059669' }}
                            />
                          )}
                          <Typography
                            fontSize={11}
                            fontWeight={600}
                            color={isOutgoing ? 'error.main' : 'success.main'}
                          >
                            {isOutgoing ? 'Send' : 'Receive'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Transfer ID */}
                      <TableCell>
                        <Tooltip title={trx.transfer_id || '—'} arrow>
                          <Typography
                            fontSize={11}
                            fontFamily='monospace'
                            sx={{
                              color: '#05569f',
                              cursor: 'pointer',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {truncate(trx.transfer_id, 12)}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      {/* Payer */}
                      <TableCell>
                        <Typography fontSize={12} fontWeight={500}>
                          {truncate(trx.payer_name || trx.payer_id_value, 14)}
                        </Typography>
                        <Typography fontSize={10} color='text.secondary'>
                          {trx.payer_fsp}
                        </Typography>
                      </TableCell>

                      {/* Payee */}
                      <TableCell>
                        <Typography fontSize={12} fontWeight={500}>
                          {truncate(trx.payee_name || trx.payee_id_value, 14)}
                        </Typography>
                        <Typography fontSize={10} color='text.secondary'>
                          {trx.payee_fsp}
                        </Typography>
                      </TableCell>

                      {/* Amount */}
                      <TableCell align='right'>
                        <Typography fontSize={13} fontWeight={700}>
                          ৳ {fmt(trx.amount)}
                        </Typography>
                        {trx.fee > 0 && (
                          <Typography fontSize={10} color='text.secondary'>
                            Fee: ৳{fmt(trx.fee)}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={sc.label}
                          color={sc.color}
                          size='small'
                          sx={{ fontSize: 10, fontWeight: 700, height: 20 }}
                        />
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <Typography
                          fontSize={11}
                          color='text.secondary'
                          whiteSpace='nowrap'
                        >
                          {fmtDate(trx.created_at)}
                        </Typography>
                      </TableCell>

                      {/* Expand */}
                      <TableCell align='center'>
                        <IconButton
                          size='small'
                          onClick={() =>
                            setExpandedId(isExpanded ? null : trx.id)
                          }
                          sx={{
                            color: isExpanded ? '#05569f' : 'text.secondary',
                            bgcolor: isExpanded
                              ? alpha('#05569f', 0.1)
                              : 'transparent',
                          }}
                        >
                          <VisibilityIcon fontSize='small' />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    {/* Expanded detail row */}
                    {isExpanded && <DetailRow trx={trx} colSpan={10} />}
                  </React.Fragment>
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
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 1.5,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant='caption' color='text.secondary'>
          Showing {rows.length} of {pagination.total || 0} transactions
          {hasActiveFilters && ' (filtered)'}
        </Typography>
        <TablePagination
          component='div'
          count={pagination.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{ '.MuiTablePagination-toolbar': { minHeight: 40 } }}
        />
      </Box>
    </Box>
  );
}

export default Transactions;
