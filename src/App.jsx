import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { useAuth } from './context/AuthContext';
import Login from './pages/Auth/Login';
import OtpVerify from './pages/Auth/OTPVerify';
import Home from './pages/Home';
import Transfer from './pages/Transfer';
import Transactions from './pages/Transactions/Transactions';
import PM2 from './pages/PM2';
import Logs from './pages/Logs';
import Merchant from './pages/merchant/Merchant';
import Settings from './pages/Settings';
import Users from './pages/Users/Users';
import Liquidity from './pages/Liquidity/Liquidity';
import ActivityLogs from './pages/ActivityLogs/ActivityLogs';
import BalancePage from './pages/Balance/BalancePage';

function Protected({ children, adminOnly = false, merchantOnly = false }) {
  const { user, isAdmin, isMerchant } = useAuth();
  if (!user) return <Navigate to='/login' replace />;
  if (adminOnly && !isAdmin) {
    return <Navigate to='/' replace />;
  } else if (merchantOnly && !isMerchant) {
    return <Navigate to='/' replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route
        path='/login'
        element={user ? <Navigate to='/' replace /> : <Login />}
      />
      <Route
        path='/verify-otp/:username'
        element={user ? <Navigate to='/' replace /> : <OtpVerify />}
      />

      <Route
        path='/*'
        element={
          <Protected>
            <DashboardLayout>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/transfer' element={<Transfer />} />
                <Route path='/transactions' element={<Transactions />} />
                <Route path='/bulk-g2p' element={<PM2 />} />
                <Route path='/logs' element={<Logs />} />
                <Route
                  path='/merchant'
                  element={
                    <Protected adminOnly>
                      <Merchant />
                    </Protected>
                  }
                />
                <Route path='/balance-inquiry' element={<BalancePage />} />
                <Route
                  path='/liquidity'
                  element={
                    <Protected merchantOnly>
                      <Liquidity />
                    </Protected>
                  }
                />
                <Route path='/activity-logs' element={<ActivityLogs />} />
                <Route
                  path='/settings'
                  element={
                    <Protected adminOnly>
                      <Settings />
                    </Protected>
                  }
                />
                <Route
                  path='/users'
                  element={
                    <Protected adminOnly>
                      <Users />
                    </Protected>
                  }
                />
                {/* new */}
                <Route path='*' element={<Navigate to='/' replace />} />
              </Routes>
            </DashboardLayout>
          </Protected>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename='/'>
      <AppRoutes />
    </BrowserRouter>
  );
}
