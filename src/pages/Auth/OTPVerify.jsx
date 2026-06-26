/**************************************************************************
 * Copyright © 2026 Bangladeshi Software Ltd. All rights reserved.
 * Distributed under the license terms specified in this repository.
 *
 * ORIGINAL AUTHOR: Muhammad Nasim (Developer)
 **************************************************************************/

import React, { useState, useEffect, useRef } from 'react';
import { Paper, Typography, Button, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
function OtpVerify() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { username } = useParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputsRef = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');

    if (code.length !== 6) return;

    setLoading(true);

    // TODO: connect verify API
    try {
      const res = await api.post('/auth/verify-otp', {
        username: username,
        otp: code,
      });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(60);
    // TODO: call resend OTP API
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 p-6'>
      <Paper elevation={3} className='w-full max-w-md p-8 rounded-xl'>
        <div className='text-center mb-6'>
          <Typography variant='h6' fontWeight={600}>
            OTP Verification
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Enter the 6-digit code sent to your registered device
          </Typography>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='flex justify-between gap-3 mb-6'>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type='text'
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className='w-12 h-12 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900'
              />
            ))}
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
              'Verify Code'
            )}
          </Button>
        </form>

        <div className='text-center mt-6'>
          {timer > 0 ? (
            <Typography variant='caption' color='text.secondary'>
              Resend code in {timer}s
            </Typography>
          ) : (
            <button
              onClick={handleResend}
              className='text-sm text-blue-700 hover:underline'
            >
              Resend Code
            </button>
          )}
        </div>

        <Typography
          variant='caption'
          color='text.secondary'
          className='block text-center mt-6'
        >
          For security reasons, do not share your OTP with anyone.
        </Typography>
      </Paper>
    </div>
  );
}

export default OtpVerify;
