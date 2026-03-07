import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Divider,
  useTheme,
  alpha,
  Skeleton,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useAuth } from '../context/AuthContext';

// ── helpers ──────────────────────────────────────────────────
const fmt = (n, d = 2) =>
  Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

const fmtShort = (n) => {
  n = Number(n || 0);
  if (n >= 1_000_000) return `৳${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `৳${(n / 1_000).toFixed(1)}K`;
  return `৳${fmt(n)}`;
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const truncate = (s, n = 16) =>
  s && s.length > n ? s.slice(0, n) + '…' : s || '—';

const STATUS_COLOR = {
  COMMITTED: { bg: '#dcfce7', color: '#166534', label: 'Committed' },
  FAILED: { bg: '#fee2e2', color: '#991b1b', label: 'Failed' },
  ABORTED: { bg: '#fee2e2', color: '#991b1b', label: 'Aborted' },
  EXPIRED: { bg: '#fef3c7', color: '#92400e', label: 'Expired' },
  TRANSFER_SENT: { bg: '#dbeafe', color: '#1e40af', label: 'Sent' },
  QUOTE_RECEIVED: { bg: '#ede9fe', color: '#5b21b6', label: 'Quoted' },
  QUOTE_REQUESTED: { bg: '#f3f4f6', color: '#374151', label: 'Quoting' },
  PENDING: { bg: '#f3f4f6', color: '#374151', label: 'Pending' },
};

const TYPE_COLOR = {
  P2P: '#05569f',
  INSTANT: '#7c3aed',
  BULK: '#0891b2',
  NBPS: '#059669',
  RTGS: '#d97706',
  BEFTN: '#dc2626',
};

// ── StatusChip ────────────────────────────────────────────────
function StatusChip({ status }) {
  const cfg = STATUS_COLOR[status] || {
    bg: '#f3f4f6',
    color: '#374151',
    label: status,
  };
  return (
    <Box
      component='span'
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 1,
        bgcolor: cfg.bg,
        color: cfg.color,
        fontSize: 10,
        fontWeight: 700,
        display: 'inline-block',
      }}
    >
      {cfg.label}
    </Box>
  );
}

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, accent, change, loading }) {
  const theme = useTheme();
  const isUp =
    change !== null && change !== undefined && parseFloat(change) >= 0;

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(accent || theme.palette.primary.main, 0.18)}`,
        borderRadius: 0,
        transition: '0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-3px)',
        },
      }}
    >
      <Box sx={{ height: 2, bgcolor: accent || theme.palette.primary.main }} />
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: alpha(accent || theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accent || theme.palette.primary.main,
            }}
          >
            {icon}
          </Box>
          {change !== null && change !== undefined && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                color: isUp ? '#059669' : '#dc2626',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {isUp ? (
                <TrendingUpIcon sx={{ fontSize: 14 }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 14 }} />
              )}
              {Math.abs(parseFloat(change)).toFixed(1)}%
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 1.5 }}>
          {loading ? (
            <Skeleton width={80} height={28} />
          ) : (
            <Typography fontWeight={800} fontSize={22} lineHeight={1}>
              {value}
            </Typography>
          )}
          <Typography
            variant='caption'
            color='text.secondary'
            fontWeight={600}
            display='block'
            mt={0.25}
          >
            {label}
          </Typography>
          {sub && (
            <Typography variant='caption' color='text.secondary' fontSize={10}>
              {sub}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
export default function Dashboard() {
  const theme = useTheme();
  const { isAdmin, isMerchant } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('dfsp_v2_token');
      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER}/api/dashboard/summary`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      console.error('Dashboard fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const t = data?.today || {};
  const m = data?.this_month || {};
  const cmp = data?.comparison || {};

  // ── fill empty hours 0–23 ─────────────────────────────────
  const hourlyFull = Array.from({ length: 24 }, (_, h) => {
    const found = (data?.hourly || []).find((r) => parseInt(r.hour) === h);
    return found
      ? {
          ...found,
          hour: h,
          total: parseInt(found.total || 0),
          committed: parseInt(found.committed || 0),
          sent_amount: parseFloat(found.sent_amount || 0),
          received_amount: parseFloat(found.received_amount || 0),
        }
      : { hour: h, total: 0, committed: 0, sent_amount: 0, received_amount: 0 };
  });

  const last7 = (data?.last7days || []).map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
    }),
    sent_amount: parseFloat(d.sent_amount || 0),
    received_amount: parseFloat(d.received_amount || 0),
    volume: parseFloat(d.volume || 0),
    total: parseInt(d.total || 0),
    committed: parseInt(d.committed || 0),
    failed: parseInt(d.failed || 0),
  }));

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          {
            icon: <SwapHorizIcon fontSize='small' />,
            label: "Today's Transactions",
            value: loading ? '—' : t.total,
            sub: `${t.committed || 0} committed · ${t.pending || 0} pending`,
            accent: '#05569f',
            change: cmp.count_change_pct,
          },
          {
            icon: <ArrowUpwardIcon fontSize='small' />,
            label: 'Sent Today',
            value: loading ? '—' : fmtShort(t.sent_amount),
            sub: `${t.sent_count || 0} transactions`,
            accent: '#dc2626',
            change: null,
          },
          {
            icon: <ArrowDownwardIcon fontSize='small' />,
            label: 'Received Today',
            value: loading ? '—' : fmtShort(t.received_amount),
            sub: `${t.received_count || 0} transactions`,
            accent: '#059669',
            change: null,
          },
          {
            icon: <AccountBalanceIcon fontSize='small' />,
            label: 'Volume Today',
            value: loading ? '—' : fmtShort(t.committed_volume),
            sub: `Fee: ৳${fmt(t.total_fee)}`,
            accent: '#7c3aed',
            change: cmp.vol_change_pct,
          },
          {
            icon: <TrendingDownIcon fontSize='small' />,
            label: 'Failed Today',
            value: loading
              ? '—'
              : (t.failed || 0) + (t.aborted || 0) + (t.expired || 0),
            sub: `${t.failed || 0} failed · ${t.aborted || 0} aborted · ${t.expired || 0} expired`,
            accent: '#f59e0b',
            change: null,
          },
          {
            icon: <StoreIcon fontSize='small' />,
            label: 'Merchants',
            value: loading ? '—' : data?.merchants?.total || 0,
            sub: `${data?.merchants?.active || 0} active`,
            accent: '#0891b2',
            change: null,
            access: 'admin',
          },
        ]
          .filter((v) => {
            if (v?.access == 'admin' && isMerchant) {
              return false;
            }
            return true;
          })
          .map((kpi, i) => (
            <Grid minWidth={250} item xs={12} sm={6} md={4} lg={2} key={i}>
              <KpiCard {...kpi} loading={loading} />
            </Grid>
          ))}
      </Grid>

      {/* ── KPI Row 2: Month summary ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            icon: <SwapHorizIcon fontSize='small' />,
            label: 'This Month — Total',
            value: loading ? '—' : m.total,
            sub: `${m.committed || 0} committed · ${m.failed || 0} failed`,
            accent: '#05569f',
          },
          {
            icon: <AccountBalanceIcon fontSize='small' />,
            label: 'Monthly Volume',
            value: loading ? '—' : fmtShort(m.volume),
            sub: `Fee: ৳${fmt(m.total_fee)}`,
            accent: '#7c3aed',
          },
          {
            icon: <ArrowUpwardIcon fontSize='small' />,
            label: 'Monthly Sent',
            value: loading ? '—' : fmtShort(m.sent_amount),
            sub: 'Committed OUTGOING',
            accent: '#dc2626',
          },
          {
            icon: <ArrowDownwardIcon fontSize='small' />,
            label: 'Monthly Received',
            value: loading ? '—' : fmtShort(m.received_amount),
            sub: 'Committed INCOMING',
            accent: '#059669',
          },
          {
            icon: <PeopleIcon fontSize='small' />,
            label: 'Total Users',
            value: loading ? '—' : data?.users?.total || 0,
            sub: `${data?.users?.admins || 0} admin · ${data?.users?.merchants || 0} merchant`,
            accent: '#0891b2',
            access: 'admin',
          },
        ]
          .filter((v) => {
            if (v?.access == 'admin' && isMerchant) {
              return false;
            }
            return true;
          })
          .map((kpi, i) => (
            <Grid
              minWidth={250}
              item
              xs={12}
              sm={6}
              md={4}
              lg={i < 4 ? 3 : 12 / 5}
              key={i}
            >
              <KpiCard {...kpi} loading={loading} />
            </Grid>
          ))}
      </Grid>

      {/* ── Charts Row ── */}
      <div className='mb-3 md:flex gap-4'>
        {/* Hourly bar */}
        <Grid className='w-full' item xs={3} lg={3}>
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${alpha('#05569f', 0.12)}`,
              borderRadius: 2,
            }}
            className='md:min-w-[400px]'
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography fontWeight={700} fontSize={14} mb={2}>
                Hourly Activity — Last 24 Hours
              </Typography>
              {loading ? (
                <Skeleton
                  variant='rectangular'
                  height={180}
                  sx={{ borderRadius: 1 }}
                />
              ) : (
                <ResponsiveContainer width='100%' height={180}>
                  <BarChart data={hourlyFull} barSize={12} barGap={2}>
                    <XAxis
                      dataKey='hour'
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      tickFormatter={(h) => `${h}h`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={false}
                      width={28}
                    />
                    <RTooltip
                      contentStyle={{
                        background: '#fff',
                        border: `1px solid #e5e7eb`,
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                      labelFormatter={(h) => `${h}:00`}
                    />
                    <Bar
                      dataKey='committed'
                      fill='#05569f'
                      name='Committed'
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey='total'
                      fill={alpha('#05569f', 0.18)}
                      name='Total'
                      radius={[3, 3, 0, 0]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Status distribution */}
        <Grid className='w-full' item xs={12} lg={4}>
          <Card
            className='md:min-w-[400px]'
            elevation={0}
            sx={{
              border: `1px solid ${alpha('#05569f', 0.12)}`,
              borderRadius: 2,
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography fontWeight={700} fontSize={14} mb={2}>
                Today's Status Breakdown
              </Typography>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={32} sx={{ mb: 0.5 }} />
                ))
              ) : (data?.status_dist || []).length === 0 ? (
                <Typography variant='caption' color='text.secondary'>
                  No transactions today
                </Typography>
              ) : (
                (data?.status_dist || []).map((s) => {
                  const cfg = STATUS_COLOR[s.status] || {
                    bg: '#f3f4f6',
                    color: '#374151',
                    label: s.status,
                  };
                  const maxCount = Math.max(
                    ...(data?.status_dist || []).map((x) =>
                      parseInt(x.count || 0),
                    ),
                  );
                  const pct =
                    maxCount > 0
                      ? (parseInt(s.count || 0) / maxCount) * 100
                      : 0;
                  return (
                    <Box key={s.status} sx={{ mb: 1.25 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 0.4,
                        }}
                      >
                        <Typography
                          fontSize={11}
                          fontWeight={600}
                          color={cfg.color}
                        >
                          {cfg.label}
                        </Typography>
                        <Box
                          sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                        >
                          <Typography fontSize={11} color='text.secondary'>
                            ৳{fmt(s.amount)}
                          </Typography>
                          <Chip
                            label={s.count}
                            size='small'
                            sx={{
                              height: 18,
                              fontSize: 10,
                              fontWeight: 700,
                              bgcolor: cfg.bg,
                              color: cfg.color,
                              '.MuiChip-label': { px: 0.75 },
                            }}
                          />
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: alpha(cfg.color, 0.12),
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${pct}%`,
                            bgcolor: cfg.color,
                            borderRadius: 2,
                            transition: 'width 0.4s',
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Grid>
      </div>

      {/* ── 7-Day Trend ── */}
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${alpha('#05569f', 0.12)}`,
          borderRadius: 2,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Typography fontWeight={700} fontSize={14} mb={2}>
            📈 Last 7 Days — Send vs Receive Volume (৳)
          </Typography>
          {loading ? (
            <Skeleton
              variant='rectangular'
              height={160}
              sx={{ borderRadius: 1 }}
            />
          ) : last7.length === 0 ? (
            <Typography variant='caption' color='text.secondary'>
              No data
            </Typography>
          ) : (
            <ResponsiveContainer width='100%' height={160}>
              <LineChart data={last7}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke={alpha('#05569f', 0.08)}
                />
                <XAxis
                  dataKey='date'
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v
                  }
                />
                <RTooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  formatter={(v, n) => [`৳${fmt(v)}`, n]}
                />
                <Line
                  type='monotone'
                  dataKey='sent_amount'
                  name='Sent'
                  stroke='#dc2626'
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type='monotone'
                  dataKey='received_amount'
                  name='Received'
                  stroke='#059669'
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
