import React, { useState } from 'react';
import {
  TextField,
  Button,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  AccountCircle,
} from '@mui/icons-material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    username: '',
    password: '',
    remember: false,
  });
  const [hint, setHint] = useState({ email: '', role: '' });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        username: form.username,
        password: form.password,
      });
      setHint({ email: res?.data?.username, role: res.data.role });
      navigate(`/verify-otp/${form?.username}`);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex flex-col bg-gray-100'>
      <div className='hidden bg-blue-900 text-white items-center justify-center p-12'>
        <div>
          <h1 className='text-3xl font-semibold mb-4 tracking-wide'>
            Financial Management Portal
          </h1>
          <p className='text-blue-200 max-w-md leading-relaxed'>
            Secure access to transaction monitoring, reporting, audit logs, and
            institutional account management.
          </p>
        </div>
      </div>

      {/* Right Login Section */}

      <div className='flex flex-1 items-center justify-center p-6'>
        <Paper elevation={3} className='w-full max-w-md p-8 rounded-xl'>
          <div className='mb-6 text-center'>
            <Typography variant='h5' fontWeight='600'>
              Sign In - <span className='text-blue-600'>DFSP</span> or{' '}
              <span className='text-orange-600'> Marchant</span>
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Enter your credentials to continue
            </Typography>
          </div>
          {error && (
            <div className='p-3 mb-7 bg-orange-100 text-orange-600'>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className='space-y-5'>
            <TextField
              fullWidth
              label='Username'
              name='username'
              value={form.username}
              onChange={handleChange}
              variant='outlined'
              size='medium'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <AccountCircle fontSize='small' />
                  </InputAdornment>
                ),
              }}
            />
            <div className='my-6'></div>
            <TextField
              fullWidth
              label='Password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              variant='outlined'
              size='medium'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Lock fontSize='small' />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge='end'
                      size='small'
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <div className='flex items-center justify-between'>
              <FormControlLabel
                control={
                  <Checkbox
                    name='remember'
                    checked={form.remember}
                    onChange={handleChange}
                    size='small'
                  />
                }
                label='Remember me'
              />
              <button
                type='button'
                className='text-sm text-blue-700 hover:underline'
              >
                Forgot password?
              </button>
            </div>

            <Button
              type='submit'
              fullWidth
              variant='contained'
              size='large'
              disabled={loading}
              sx={{
                backgroundColor: '#1e3a8a',
                '&:hover': { backgroundColor: '#1e40af' },
              }}
            >
              {loading ? (
                <CircularProgress size={22} color='inherit' />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <Divider className='my-6' />
          <div className='mt-3'></div>
          <Typography
            variant='caption'
            color='text.secondary'
            className='block text-center'
          >
            &copy; {new Date().getFullYear()} B Bank Portal. All rights
            reserved.
          </Typography>
        </Paper>
      </div>
    </div>
  );
}

export default Login;
