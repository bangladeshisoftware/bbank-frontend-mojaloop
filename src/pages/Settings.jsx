import { Box, Button, TextField, Typography, Divider, Avatar, Chip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ImSpinner4 } from 'react-icons/im';
import swal from 'sweetalert';
import { useAuth } from '../context/AuthContext'; // adjust path

const API   = import.meta.env.VITE_APP_SERVER;
const TOKEN = () => localStorage.getItem('dfsp_v2_token') || '';
const h     = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` });

function Settings() {
  const { profile } = useAuth();

  const [quoteFee,    setQuoteFee]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [getLoading,  setGetLoading]  = useState(false);

  const [currentPw,   setCurrentPw]   = useState('');
  const [newPw,       setNewPw]       = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [pwLoading,   setPwLoading]   = useState(false);

  useEffect(() => { getData(); }, []);

  const getData = async () => {
    try {
      setGetLoading(true);
      const res  = await fetch(`${API}/api/settings`, { method: 'GET', headers: h() });
      const ress = await res.json();
      if (res.ok) setQuoteFee(ress?.data?.quote_fee || 0);
    } catch (err) {
      console.log(err);
    } finally {
      setGetLoading(false);
    }
  };

  const updateSetting = async () => {
    if (!quoteFee)
      return swal('Warning!', 'Quote fee cannot be empty!', 'warning');
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/settings`, {
        method: 'POST',
        headers: h(),
        body: JSON.stringify({ quote_fee: quoteFee }),
      });
      res.ok
        ? swal('Updated', 'Setting updated successfully.', 'success')
        : swal('Failed!', 'Something went wrong! Try again.', 'error');
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!currentPw || !newPw || !confirmPw)
      return swal('Warning!', 'All password fields are required!', 'warning');
    if (newPw !== confirmPw)
      return swal('Warning!', 'New password and confirm password do not match!', 'warning');

    try {
      setPwLoading(true);
      const res  = await fetch(`${API}/api/auth/change-password`, {
        method: 'PUT',
        headers: h(),
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        swal('Success', 'Password changed successfully!', 'success');
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      } else {
        swal('Failed!', data?.message || 'Something went wrong!', 'error');
      }
    } catch (err) {
      console.log(err);
    } finally {
      setPwLoading(false);
    }
  };

  const avatarColor = '#05569f';
  const initials    = profile?.full_name
    ?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className='py-3 px-5 mt-3 ml-4'>
      <h2>Settings</h2>

      <div className='max-w-xl mx-auto md:bg-[#fefefe] md:p-4 rounded-md flex flex-col gap-8 mt-4'>

        <Box>
          <Typography fontWeight={700} fontSize={14} mb={2}
            sx={{ textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary' }}>
            Profile
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{
              width: 52, height: 52, fontSize: 18, fontWeight: 800,
              bgcolor: avatarColor,
            }}>
              {initials}
            </Avatar>
            <Box>
              <Typography fontWeight={700} fontSize={16}>
                {profile?.full_name || profile?.username || '—'}
              </Typography>
              <Typography fontSize={12} color='text.secondary'>{profile?.email}</Typography>
            </Box>
            <Chip
              label={profile?.role || 'USER'}
              size='small'
              sx={{
                ml: 'auto', fontWeight: 700, fontSize: 11,
                bgcolor: profile?.role === 'ADMIN' ? '#fef3c7' : '#dbeafe',
                color:   profile?.role === 'ADMIN' ? '#92400e' : '#1e40af',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField label='Username'  value={profile?.username  || ''} size='small' fullWidth disabled />
            <TextField label='Email'     value={profile?.email     || ''} size='small' fullWidth disabled />
            <TextField label='Full Name' value={profile?.full_name || ''} size='small' fullWidth disabled />
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography fontWeight={700} fontSize={14} mb={2}
            sx={{ textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary' }}>
            Change Password
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label='Current Password' type='password' size='small' fullWidth
              value={currentPw} onChange={e => setCurrentPw(e.target.value)}
            />
            <TextField
              label='New Password' type='password' size='small' fullWidth
              value={newPw} onChange={e => setNewPw(e.target.value)}
            />
            <TextField
              label='Confirm New Password' type='password' size='small' fullWidth
              value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              error={!!confirmPw && confirmPw !== newPw}
              helperText={!!confirmPw && confirmPw !== newPw ? 'Passwords do not match' : ''}
            />
            <Button
              variant='contained' disabled={pwLoading}
              onClick={changePassword}
              sx={{ textTransform: 'none', bgcolor: '#05569f', '&:hover': { bgcolor: '#044a8a' } }}
            >
              {pwLoading ? (
                <div className='flex items-center gap-1.5'>
                  <ImSpinner4 className='animate-spin' /><span>Changing...</span>
                </div>
              ) : 'Change Password'}
            </Button>
          </Box>
        </Box>

        <Divider />

        {/* ── Quote Fee (existing) ── */}
        <Box>
          <Typography fontWeight={700} fontSize={14} mb={2}
            sx={{ textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary' }}>
            Quote Settings
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label='Set Quote Fee' variant='outlined' size='small' fullWidth
              value={quoteFee} onChange={e => setQuoteFee(e.target.value)}
              disabled={getLoading}
            />
            <Button
              variant='contained' disabled={loading}
              onClick={updateSetting}
              sx={{ textTransform: 'none', bgcolor: '#05569f', '&:hover': { bgcolor: '#044a8a' } }}
            >
              {loading ? (
                <div className='flex items-center gap-1.5'>
                  <ImSpinner4 className='animate-spin' /><span>Please wait...</span>
                </div>
              ) : 'Update'}
            </Button>
          </Box>
        </Box>

      </div>
    </div>
  );
}

export default Settings;
