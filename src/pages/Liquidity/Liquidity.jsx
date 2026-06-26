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
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  useTheme,
  alpha,
  Skeleton,
  Tooltip,
  IconButton,
  Alert,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RefreshIcon from '@mui/icons-material/Refresh';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { SiParamountplus } from 'react-icons/si';

const API = import.meta.env.VITE_APP_SERVER;
const TOKEN = () => localStorage.getItem('dfsp_v2_token') || '';

const TYPE_COLOR = {
  P2P: '#05569f',
  INSTANT: '#7c3aed',
  BULK: '#0891b2',
  NPSB: '#059669',
  RTGS: '#d97706',
  BEFTN: '#dc2626',
};

const STATUS_CFG = {
  COMMITTED: { label: 'Committed', bg: '#dcfce7', color: '#166534' },
  FAILED: { label: 'Failed', bg: '#fee2e2', color: '#991b1b' },
  ABORTED: { label: 'Aborted', bg: '#fee2e2', color: '#991b1b' },
  EXPIRED: { label: 'Expired', bg: '#fef3c7', color: '#92400e' },
  TRANSFER_SENT: { label: 'Processing', bg: '#dbeafe', color: '#1e40af' },
  QUOTE_RECEIVED: { label: 'Quoted', bg: '#ede9fe', color: '#5b21b6' },
  QUOTE_REQUESTED: { label: 'Pending', bg: '#f3f4f6', color: '#374151' },
  PENDING: { label: 'Pending', bg: '#f3f4f6', color: '#374151' },
};

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
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const trunc = (s, n = 16) =>
  s && s.length > n ? s.slice(0, n) + '…' : s || '—';

// Status badge
function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || {
    label: status,
    bg: '#f3f4f6',
    color: '#374151',
  };
  return (
    <Box
      component='span'
      sx={{
        display: 'inline-block',
        px: 0.9,
        py: 0.2,
        borderRadius: 1,
        bgcolor: c.bg,
        color: c.color,
        fontSize: 10,
        fontWeight: 700,
        lineHeight: 1.7,
      }}
    >
      {c.label}
    </Box>
  );
}

function LimitBar({ label, used, total, pct, color }) {
  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography fontSize={12} fontWeight={600}>
          {label}
        </Typography>
        <Typography fontSize={11} fontWeight={700} color={color}>
          {pct.toFixed(1)}%
        </Typography>
      </Box>
      <div
        className='w-full'
        sx={{
          height: 9,
          borderRadius: 5,
          bgcolor: alpha(color, 0.12),
          overflow: 'hidden',
          mb: 0.6,
        }}
      >
        <div
          sx={{
            height: '100%',
            width: `${Math.min(pct, 100)}%`,
            bgcolor: color,
            borderRadius: 5,
            transition: 'width .7s ease',
          }}
        />
      </div>
      <div className='w-full'>
        <Typography fontSize={12} color='text.secondary'>
          <b> Used:</b> <b className='text-orange-500'>৳{fmtN(used)}</b>
        </Typography>
        <Typography fontSize={12} color='text.secondary'>
          <b>Limit:</b> <b style={{ color }}>৳{fmtN(total)}</b>
        </Typography>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, accent, loading }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(accent, 0.2)}`,
        borderRadius: 1,
        transition: 'box-shadow .2s',
        '&:hover': { boxShadow: `2px 1px 18px 0 rgba(0,0,0,.1)` },
      }}
    >
      <Box sx={{ height: 3, bgcolor: accent, borderRadius: '8px 8px 0 0' }} />
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            mb: 1.5,
            bgcolor: alpha(accent, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
          }}
        >
          {icon}
        </Box>
        {loading ? (
          <>
            <Skeleton width={90} height={28} />
            <Skeleton width={60} height={16} />
          </>
        ) : (
          <>
            <Typography
              fontWeight={800}
              fontSize={22}
              color={accent}
              lineHeight={1}
            >
              {value}
            </Typography>
            <Typography fontSize={11} color='text.secondary' mt={0.3}>
              {sub}
            </Typography>
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

export default function Liquidity() {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API}/api/transactions/today/merchant/dashboard`,
        {
          headers: { Authorization: `Bearer ${TOKEN()}` },
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const m = data?.merchant || {};
  const lm = data?.limits || {};
  const td = data?.today || {};
  const tb = data?.type_breakdown || {};

  const activeTypes = Object.entries(tb).filter(
    ([, v]) => v.send.total > 0 || v.receive.total > 0,
  );

  const limitColor =
    lm.usage_pct >= 90 ? '#dc2626' : lm.usage_pct >= 70 ? '#d97706' : '#059669';

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {loading ? (
            <Skeleton variant='circular' width={52} height={52} />
          ) : (
            <Avatar
              sx={{
                width: 52,
                height: 52,
                fontSize: 22,
                fontWeight: 800,
                bgcolor: alpha('#05569f', 0.12),
                color: '#05569f',
              }}
            >
              {m.display_name?.charAt(0) || '?'}
            </Avatar>
          )}
          <Box>
            <Typography variant='h5' fontWeight={700} lineHeight={1.2}>
              {loading ? (
                <Skeleton width={200} />
              ) : (
                <span style={{ color: '#05569f' }}>{m.display_name}</span>
              )}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {loading ? (
                <Skeleton width={160} />
              ) : (
                `${m.id_type}: ${m.id_value}${m.acc_no ? ` · ${m.acc_no}` : ''}`
              )}
            </Typography>
          </Box>
          {!loading && (
            <Chip
              label={m.status === '1' ? 'Active' : 'Inactive'}
              size='small'
              sx={{
                fontWeight: 700,
                fontSize: 11,
                bgcolor:
                  m.status === '1'
                    ? alpha('#059669', 0.1)
                    : alpha('#dc2626', 0.1),
                color: m.status === '1' ? '#059669' : '#dc2626',
              }}
            />
          )}
        </Box>
        <Tooltip title='Refresh'>
          <IconButton
            onClick={load}
            sx={{ border: `1px solid ${alpha('#05569f', 0.2)}` }}
          >
            <RefreshIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Limits */}
      {!loading && (lm.daily_limit_set || lm.single_limit_set) && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 0,
            mb: 2.5,
          }}
        >
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography fontWeight={700} fontSize={14} mb={2.5}>
              Transaction Limits — Today
            </Typography>
            <Grid container spacing={3} alignItems='center'>
              {lm.single_limit_set && (
                <Grid item xs={12} sm={lm.daily_limit_set ? 5 : 12}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 0,
                      bgcolor: alpha('#05569f', 0.03),
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SiParamountplus color='#05569f' />
                    </Box>
                    <Box>
                      <Typography
                        fontSize={11}
                        color='text.secondary'
                        fontWeight={600}
                      >
                        Single Txn Limit
                      </Typography>
                      <Typography
                        fontSize={20}
                        fontWeight={800}
                        color='#05569f'
                      >
                        ৳{fmtN(lm.single_transaction_limit)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              {lm.daily_limit_set && (
                <Grid item xs={12} sm={lm.single_limit_set ? 7 : 12}>
                  <LimitBar
                    label='Daily Limit'
                    used={lm.used_today}
                    total={lm.daily_limit}
                    pct={lm.usage_pct}
                    color={limitColor}
                  />
                </Grid>
              )}
            </Grid>
            {lm.daily_limit_set && lm.usage_pct >= 70 && (
              <Alert
                severity={lm.usage_pct >= 100 ? 'error' : 'warning'}
                icon={<WarningAmberIcon />}
                sx={{ mt: 2, fontSize: 12 }}
              >
                {lm.usage_pct >= 100
                  ? 'Daily limit reached — no more outgoing transactions today.'
                  : `Remaining today: ৳${fmtN(lm.remaining_today)}`}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* KPI cards */}
      <div className='space-y-3.5 md:flex block md:gap-3'>
        <div className='w-full'>
          <KpiCard
            icon={<SwapHorizIcon fontSize='small' />}
            label="Today's Total"
            value={td.total || 0}
            sub={`${td.committed || 0} committed · ${td.pending || 0} pending`}
            accent='#05569f'
            loading={loading}
          />
        </div>
        <div className='w-full'>
          <KpiCard
            icon={<ArrowUpwardIcon fontSize='small' />}
            label='Send Today'
            value={fmtShort(td.send?.committed_amount)}
            sub={`${td.send?.committed_count || 0} txn · ${td.send?.count || 0} total`}
            accent='#dc2626'
            loading={loading}
          />
        </div>
        <div className='w-full'>
          <KpiCard
            icon={<ArrowDownwardIcon fontSize='small' />}
            label='Receive Today'
            value={fmtShort(td.receive?.committed_amount)}
            sub={`${td.receive?.committed_count || 0} txn · ${td.receive?.count || 0} total`}
            accent='#059669'
            loading={loading}
          />
        </div>
        <div className='w-full'>
          <KpiCard
            icon={<AccountBalanceWalletIcon fontSize='small' />}
            label='Fee Today'
            value={fmtShort(td.total_fee)}
            sub={
              lm.daily_limit_set
                ? `৳${fmtN(lm.remaining_today)} remaining`
                : `${td.committed || 0} committed txn`
            }
            accent='#d97706'
            loading={loading}
          />
        </div>
      </div>
    </Box>
  );
}
