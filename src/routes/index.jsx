/**************************************************************************
 * Copyright © 2026 Bangladeshi Software Ltd. All rights reserved.
 * Distributed under the license terms specified in this repository.
 *
 * ORIGINAL AUTHOR: Muhammad Nasim (Developer)
 **************************************************************************/

import React from 'react';
import Home from '../pages/Home';
import { Route, Routes } from 'react-router-dom';
import P2P from '../pages/P2P';
import Merchant from '../pages/merchant/Merchant';
import Settings from '../pages/Settings';
import Logs from '../pages/Logs';
import PM2 from '../pages/PM2';
import Login from '../pages/Auth/Login';
import OtpVerify from '../pages/Auth/OTPVerify';
import Transactions from '../pages/Transactions/Transactions';

export function AppRoute() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/p2p' element={<P2P />} />
      <Route path='/transactions' element={<Transactions />} />
      <Route path='/bulk-g2p' element={<PM2 />} />
      <Route path='/logs' element={<Logs />} />
      <Route path='/merchant' element={<Merchant />} />
      <Route path='/settings' element={<Settings />} />
    </Routes>
  );
}

export function StaticRoute() {
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/verify-otp' element={<OtpVerify />} />
      <Route path='*' element={<Login />} />
    </Routes>
  );
}
