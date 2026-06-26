/**************************************************************************
 * Copyright © 2026 Bangladeshi Software Ltd. All rights reserved.
 * Distributed under the license terms specified in this repository.
 *
 * ORIGINAL AUTHOR: Muhammad Nasim (Developer)
 **************************************************************************/

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  alpha,
  Skeleton,
  Tooltip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Avatar,
  Tab,
  Tabs,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SearchIcon from '@mui/icons-material/Search';
import { ImFileEmpty } from 'react-icons/im';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_APP_SERVER;
const TOKEN = () => localStorage.getItem('dfsp_v2_token') || '';
const USER = () => {
  try {
    return JSON.parse(localStorage.getItem('dfsp_v2_user') || '{}');
  } catch {
    return {};
  }
};

const h = () => ({
  Authorization: `Bearer ${TOKEN()}`,
  'Content-Type': 'application/json',
});

const fmtN = (v, d = 2) =>
  Number(v || 0).toLocaleString('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

const fmtShort = (v) => {
  v = Number(v || 0);
  if (v >= 1_000_000) return `৳${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `৳${(v / 1_000).toFixed(1)}K`;
  return `৳${fmtN(v)}`;
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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
const aC = (s = '') =>
  AVATAR_COLORS[(s.charCodeAt(0) || 0) % AVATAR_COLORS.length];

function WalletCard({ label, value, color, icon, sub, loading }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(color, 0.2)}`,
        borderRadius: 1,
        transition: '0.3s ease-in-out',
        '&:hover': { transform: 'translateY(-3px)' },
      }}
    >
      <Box sx={{ height: 3, bgcolor: color, borderRadius: '8px 8px 0 0' }} />
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            mb: 1.2,
            bgcolor: alpha(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
          }}
        >
          {icon}
        </Box>
        {loading ? (
          <>
            <Skeleton width={100} height={28} />
            <Skeleton width={60} height={16} />
          </>
        ) : (
          <>
            <Typography
              fontWeight={800}
              fontSize={22}
              color={color}
              lineHeight={1}
            >
              {value}
            </Typography>
            {sub && (
              <Typography fontSize={11} color='text.secondary' mt={0.3}>
                {sub}
              </Typography>
            )}
          </>
        )}
        <Typography
          variant='caption'
          color='text.secondary'
          fontWeight={600}
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}
          display='block'
          mt={0.5}
        >
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

function TypeBadge({ type }) {
  const isCredit = type === 'CREDIT';
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.4,
        px: 0.85,
        py: 0.2,
        borderRadius: 1,
        bgcolor: isCredit ? '#dcfce7' : '#fee2e2',
        color: isCredit ? '#166534' : '#991b1b',
      }}
    >
      {isCredit ? (
        <ArrowDownwardIcon sx={{ fontSize: 11 }} />
      ) : (
        <ArrowUpwardIcon sx={{ fontSize: 11 }} />
      )}
      <Typography fontSize={10} fontWeight={700}>
        {type}
      </Typography>
    </Box>
  );
}

function WalletTab({ merchantId }) {
  const [wallet, setWallet] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ledgerLoading, setLedgerLoading] = useState(true);
  const { isAdmin } = useAuth();
  // filters
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(20);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const q = merchantId ? `?merchant_id=${merchantId}` : '';
      const res = await fetch(`${API}/api/balance${q}`, { headers: h() });
      const j = await res.json();
      if (res.ok) setWallet(j);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  const fetchLedger = useCallback(
    async (pg = 0, r = 20) => {
      setLedgerLoading(true);
      try {
        const params = new URLSearchParams({ page: pg + 1, per_page: r });
        if (merchantId) params.set('merchant_id', merchantId);
        if (typeFilter) params.set('type', typeFilter);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);

        const res = await fetch(`${API}/api/balance/ledger?${params}`, {
          headers: h(),
        });
        const j = await res.json();
        if (res.ok) {
          setLedger(j.data || []);
          setTotal(j.pagination?.total || 0);
        }
      } catch (_) {
      } finally {
        setLedgerLoading(false);
      }
    },
    [merchantId, typeFilter, dateFrom, dateTo],
  );

  useEffect(() => {
    fetchWallet();
    fetchLedger(0, rpp);
  }, []);

  const refresh = () => {
    fetchWallet();
    fetchLedger(page, rpp);
  };

  const w = wallet || {};

  return (
    <Box>
      <div className={`md:flex md:gap-3 mb-2 ${!isAdmin ? 'mt-5' : ''}`}>
        <div className='w-full md:mb-0 mb-3'>
          <WalletCard
            label='Current Balance'
            icon={<AccountBalanceWalletIcon fontSize='small' />}
            value={`৳${fmtN(w.balance)}`}
            color='#05569f'
            sub={`Updated ${w.last_updated ? new Date(w.last_updated).toLocaleDateString() : '—'}`}
            loading={loading}
          />
        </div>
        <div className='w-full md:mb-0 mb-3'>
          <WalletCard
            label='Total Credit'
            icon={<TrendingUpIcon fontSize='small' />}
            value={fmtShort(w.total_credit)}
            color='#059669'
            sub='All time received'
            loading={loading}
          />
        </div>
        <div className='w-full md:mb-0 mb-3'>
          <WalletCard
            label='Total Debit'
            icon={<TrendingDownIcon fontSize='small' />}
            value={fmtShort(w.total_debit)}
            color='#dc2626'
            sub='All time sent'
            loading={loading}
          />
        </div>
        <div className='w-full md:mb-0 mb-3'>
          <WalletCard
            label='Total Fee Paid'
            icon={<ReceiptLongIcon fontSize='small' />}
            value={fmtShort(w.total_fee)}
            color='#d97706'
            sub='All time fee'
            loading={loading}
          />
        </div>
      </div>

      {/* Today strip */}
      {!loading && w.today && (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${alpha('#05569f', 0.12)}`,
            borderRadius: 2,
            mb: 2.5,
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Typography fontSize={13} fontWeight={700} mr={1}>
                Today
              </Typography>
              <Chip
                icon={<ArrowDownwardIcon sx={{ fontSize: 13 }} />}
                label={`Credit ৳${fmtN(w.today.credit)}`}
                size='small'
                sx={{
                  bgcolor: '#dcfce7',
                  color: '#166534',
                  fontWeight: 700,
                  fontSize: 11,
                  '.MuiChip-icon': { color: '#166534' },
                }}
              />
              <Chip
                icon={<ArrowUpwardIcon sx={{ fontSize: 13 }} />}
                label={`Debit ৳${fmtN(w.today.debit)}`}
                size='small'
                sx={{
                  bgcolor: '#fee2e2',
                  color: '#991b1b',
                  fontWeight: 700,
                  fontSize: 11,
                  '.MuiChip-icon': { color: '#991b1b' },
                }}
              />
              <Chip
                label={`${w.today.txn} transactions`}
                size='small'
                sx={{
                  bgcolor: alpha('#05569f', 0.08),
                  color: '#05569f',
                  fontWeight: 700,
                  fontSize: 11,
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Ledger filters */}
      <Paper
        elevation={0}
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
          <FormControl size='small' sx={{ minWidth: 130 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label='Type'
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value=''>All</MenuItem>
              <MenuItem value='CREDIT'>Credit</MenuItem>
              <MenuItem value='DEBIT'>Debit</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size='small'
            label='From'
            type='date'
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            size='small'
            label='To'
            type='date'
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Tooltip title='Refresh'>
              <IconButton
                onClick={refresh}
                sx={{ border: `1px solid ${alpha('#05569f', 0.2)}` }}
              >
                <RefreshIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Ledger table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: `1px solid ${alpha('#05569f', 0.1)}`,
          borderRadius: 2,
        }}
      >
        {ledgerLoading && <LinearProgress />}
        <Table size='small'>
          <TableHead sx={{ bgcolor: alpha('#05569f', 0.05) }}>
            <TableRow>
              {[
                '#',
                'Type',
                'Amount',
                'Fee',
                'Balance Before',
                'Balance After',
                'Note',
                'Counterpart',
                'Date',
              ].map((col) => (
                <TableCell
                  key={col}
                  sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!ledgerLoading && ledger.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align='center' sx={{ py: 6 }}>
                  <Typography fontSize={28}>
                    <ImFileEmpty className='mx-auto mb-2' />
                  </Typography>
                  <Typography color='text.secondary' fontSize={13}>
                    No ledger entries yet
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              ledger.map((row, i) => {
                const isCredit = row.type === 'CREDIT';
                const counterpart = isCredit
                  ? row.payer_name || row.payer_id_value
                  : row.payee_name || row.payee_id_value;

                return (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ '&:hover': { bgcolor: alpha('#05569f', 0.025) } }}
                  >
                    <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>
                      {page * rpp + i + 1}
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={row.type} />
                    </TableCell>
                    <TableCell>
                      <Typography
                        fontSize={13}
                        fontWeight={700}
                        color={isCredit ? '#059669' : '#dc2626'}
                      >
                        {isCredit ? '+' : '−'}৳{fmtN(row.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={11} color='text.secondary'>
                        {row.fee > 0 ? `৳${fmtN(row.fee)}` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={11} fontFamily='monospace'>
                        ৳{fmtN(row.balance_before)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        fontSize={11}
                        fontFamily='monospace'
                        fontWeight={700}
                        color={isCredit ? '#059669' : '#dc2626'}
                      >
                        ৳{fmtN(row.balance_after)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={row.note || '—'} arrow>
                        <Typography
                          fontSize={11}
                          color='text.secondary'
                          sx={{
                            maxWidth: 140,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.note || '—'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={11}>
                        {counterpart || '—'}
                      </Typography>
                      <Typography fontSize={10} color='text.secondary'>
                        {isCredit ? row.payer_fsp : row.payee_fsp}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        fontSize={10}
                        color='text.secondary'
                        whiteSpace='nowrap'
                      >
                        {fmtDate(row.created_at)}
                      </Typography>
                    </TableCell>
                  </TableRow>
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
        }}
      >
        <Typography variant='caption' color='text.secondary'>
          {total.toLocaleString()} total entries
        </Typography>
        <TablePagination
          component='div'
          count={total}
          page={page}
          rowsPerPage={rpp}
          onPageChange={(_, np) => {
            setPage(np);
            fetchLedger(np, rpp);
          }}
          onRowsPerPageChange={(e) => {
            const r = parseInt(e.target.value, 10);
            setRpp(r);
            setPage(0);
            fetchLedger(0, r);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          sx={{ '.MuiTablePagination-toolbar': { minHeight: 40 } }}
        />
      </Box>
    </Box>
  );
}

function SummaryTab() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(20);

  const fetchSummary = useCallback(
    async (pg = 0, r = 20) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: pg + 1, per_page: r });
        if (search.trim()) params.set('search', search.trim());
        const res = await fetch(`${API}/api/balance/summary?${params}`, {
          headers: h(),
        });
        const j = await res.json();
        if (res.ok) {
          setData(j.data || []);
          setTotal(j.pagination?.total || 0);
        }
      } catch (_) {
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  useEffect(() => {
    fetchSummary(0, rpp);
  }, []);

  // total across all merchants
  const grandTotal = data.reduce((s, r) => s + parseFloat(r.balance || 0), 0);
  const grandCredit = data.reduce(
    (s, r) => s + parseFloat(r.total_credit || 0),
    0,
  );
  const grandDebit = data.reduce(
    (s, r) => s + parseFloat(r.total_debit || 0),
    0,
  );

  return (
    <Box>
      {/* Grand totals */}
      <div className='md:flex md:gap-3 w-full'>
        <div className='w-full mb-3'>
          <WalletCard
            label='Total Balance (All Merchants)'
            icon={<AccountBalanceWalletIcon fontSize='small' />}
            value={`৳${fmtN(grandTotal)}`}
            color='#05569f'
            sub={`${total} merchants`}
            loading={loading}
          />
        </div>
        <div className='w-full mb-3'>
          <WalletCard
            label='Total Credit (All)'
            icon={<TrendingUpIcon fontSize='small' />}
            value={fmtShort(grandCredit)}
            color='#059669'
            sub='Combined received'
            loading={loading}
          />
        </div>
        <div className='w-full mb-3'>
          <WalletCard
            label='Total Debit (All)'
            icon={<TrendingDownIcon fontSize='small' />}
            value={fmtShort(grandDebit)}
            color='#dc2626'
            sub='Combined sent'
            loading={loading}
          />
        </div>
      </div>

      {/* Search + refresh */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${alpha('#05569f', 0.12)}`,
          borderRadius: 2,
          p: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            size='small'
            placeholder='Search merchant name or ID…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchSummary(0, rpp)}
            InputProps={{
              startAdornment: (
                <SearchIcon color='action' sx={{ mr: 1, fontSize: 18 }} />
              ),
            }}
            sx={{ flex: 1 }}
          />
          <Tooltip title='Refresh'>
            <IconButton
              onClick={() => {
                setPage(0);
                fetchSummary(0, rpp);
              }}
              sx={{ border: `1px solid ${alpha('#05569f', 0.2)}` }}
            >
              <RefreshIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Summary table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: `1px solid ${alpha('#05569f', 0.1)}`,
          borderRadius: 2,
        }}
      >
        {loading && <LinearProgress />}
        <Table size='small'>
          <TableHead sx={{ bgcolor: alpha('#05569f', 0.05) }}>
            <TableRow>
              {[
                '#',
                'Merchant',
                'ID',
                'Balance',
                'Total Credit',
                'Total Debit',
                'Fee Paid',
                'Status',
                'Last Updated',
              ].map((col) => (
                <TableCell
                  key={col}
                  sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align='center' sx={{ py: 6 }}>
                  <Typography fontSize={28}>🏪</Typography>
                  <Typography color='text.secondary' fontSize={13}>
                    No merchants found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow
                  key={row.merchant_id}
                  hover
                  sx={{
                    '&:hover': { bgcolor: alpha('#05569f', 0.025) },
                    opacity: row.status === '0' ? 0.6 : 1,
                  }}
                >
                  <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>
                    {page * rpp + i + 1}
                  </TableCell>

                  {/* Merchant */}
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
                          bgcolor: alpha(aC(row.display_name), 0.15),
                          color: aC(row.display_name),
                        }}
                      >
                        {row.display_name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography fontSize={12} fontWeight={600}>
                          {row.display_name}
                        </Typography>
                        <Typography fontSize={10} color='text.secondary'>
                          {row.id_type}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* ID */}
                  <TableCell>
                    <Typography fontSize={11} fontFamily='monospace'>
                      {row.id_value}
                    </Typography>
                  </TableCell>

                  {/* Balance */}
                  <TableCell>
                    <Typography fontSize={14} fontWeight={800} color='#05569f'>
                      ৳{fmtN(row.balance)}
                    </Typography>
                  </TableCell>

                  {/* Credit */}
                  <TableCell>
                    <Typography fontSize={12} fontWeight={600} color='#059669'>
                      +৳{fmtN(row.total_credit)}
                    </Typography>
                  </TableCell>

                  {/* Debit */}
                  <TableCell>
                    <Typography fontSize={12} fontWeight={600} color='#dc2626'>
                      −৳{fmtN(row.total_debit)}
                    </Typography>
                  </TableCell>

                  {/* Fee */}
                  <TableCell>
                    <Typography fontSize={11} color='text.secondary'>
                      ৳{fmtN(row.total_fee)}
                    </Typography>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 0.85,
                        py: 0.2,
                        borderRadius: 1,
                        bgcolor: row.status === '1' ? '#dcfce7' : '#fee2e2',
                        color: row.status === '1' ? '#166534' : '#991b1b',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {row.status === '1' ? 'Active' : 'Inactive'}
                    </Box>
                  </TableCell>

                  {/* Updated */}
                  <TableCell>
                    <Typography
                      fontSize={10}
                      color='text.secondary'
                      whiteSpace='nowrap'
                    >
                      {fmtDate(row.updated_at)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
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
        }}
      >
        <Typography variant='caption' color='text.secondary'>
          {total.toLocaleString()} merchants
        </Typography>
        <TablePagination
          component='div'
          count={total}
          page={page}
          rowsPerPage={rpp}
          onPageChange={(_, np) => {
            setPage(np);
            fetchSummary(np, rpp);
          }}
          onRowsPerPageChange={(e) => {
            const r = parseInt(e.target.value, 10);
            setRpp(r);
            setPage(0);
            fetchSummary(0, r);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          sx={{ '.MuiTablePagination-toolbar': { minHeight: 40 } }}
        />
      </Box>
    </Box>
  );
}

export default function BalancePage() {
  const user = USER();
  const isAdmin = user?.role === 'ADMIN';
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 0,
        }}
      >
        <Box>
          <Typography variant='h5' fontWeight={700}>
            <span style={{ color: '#ed7a00' }}>Wallet</span> & Balance
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            border: `1px solid ${alpha('#05569f', 0.15)}`,
            bgcolor: alpha('#05569f', 0.04),
          }}
        >
          <AccountBalanceWalletIcon sx={{ fontSize: 16, color: '#05569f' }} />
          <Typography fontSize={12} fontWeight={700} color='#05569f'>
            BDT
          </Typography>
        </Box>
      </Box>

      {isAdmin && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 13,
              },
            }}
          >
            <Tab
              icon={<AccountBalanceWalletIcon fontSize='small' />}
              iconPosition='start'
              label='My Wallet'
            />
            <Tab
              icon={<StorefrontIcon fontSize='small' />}
              iconPosition='start'
              label='All Merchants'
            />
          </Tabs>
        </Box>
      )}

      {(!isAdmin || tab === 0) && <WalletTab merchantId={null} />}
      {isAdmin && tab === 1 && <SummaryTab />}
    </Box>
  );
}
