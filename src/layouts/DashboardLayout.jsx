import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  useTheme,
  useMediaQuery,
  CssBaseline,
  alpha,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import {
  MdBalance,
  MdDashboard,
  MdLogout,
  MdOutlineSendToMobile,
  MdWorkHistory,
} from 'react-icons/md';
import { SiCommerzbank, SiSimplelogin } from 'react-icons/si';
import { IoSettingsSharp } from 'react-icons/io5';
import { Link, useLocation } from 'react-router-dom';
import { GoHistory } from 'react-icons/go';
import { useAuth } from '../context/AuthContext';
import { FaUsersGear } from 'react-icons/fa6';
import { PiChartLineUpThin, PiFolderUserLight } from 'react-icons/pi';
import { LiaUserCheckSolid } from 'react-icons/lia';
import logo from '../assets/logo.png';
const drawerWidth = 260;

function DashboardLayout({ children }) {
  const { profile, isAdmin, isMerchant, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation(); // Get the current path

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    {
      text: 'Dashboard',
      access: true,
      icon: <MdDashboard />,
      path: '/',
    },
    {
      text: 'Transfers',
      access: true,
      icon: <MdOutlineSendToMobile />,
      path: '/transfer',
    },
    { text: 'Live Logs', access: true, icon: <MdWorkHistory />, path: '/logs' },
    {
      text: 'Transactions',
      access: true,
      icon: <GoHistory />,
      path: '/transactions',
    },
    {
      text: 'Merchants',
      access: isAdmin ? true : false,
      icon: <LiaUserCheckSolid />,
      path: '/merchant',
    },
    {
      text: 'Accounts',
      access: true,
      icon: <MdBalance />,
      path: '/balance-inquiry',
    },
    {
      text: 'Liquidity',
      access: isMerchant ? true : false,
      icon: <PiChartLineUpThin />,
      path: '/liquidity',
    },
    {
      text: 'Users',
      access: isAdmin ? true : false,
      icon: <FaUsersGear />,
      path: '/users',
    },
    {
      text: 'Activity Logs',
      icon: <SiSimplelogin />,
      access: true,
      path: '/activity-logs',
    },
    {
      text: 'Settings',
      access: isAdmin ? true : false,
      icon: <IoSettingsSharp />,
      path: '/settings',
    },
  ];

  const getActiveColor = (index) => {
    const colors = [
      '#3B82F6',
      '#10B981',
      '#8B5CF6',
      '#6278df',
      '#F59E0B',
      '#6278DF',
      '#F59E0B',
      '#6378df',
      '#ed7a00',
    ];
    return colors[index];
  };

  const drawer = (
    <Box
      sx={{
        bgcolor: 'white',
        color: 'text.primary',
        height: '100%',
        boxShadow: 3,
        position: 'relative',
      }}
    >
      {/* Sidebar Header */}
      <Toolbar
        sx={{
          justifyContent: isMobile ? 'space-between' : 'flex-start',
          px: 1,
          py: 1.36,
          borderBottom: `1px solid ${alpha(theme.palette.grey[400], 0.3)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={logo} width={185} height={70} />
        </Box>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* Sidebar Menu */}
      <List sx={{ mt: 1 }}>
        {menuItems
          ?.filter((v) => v?.access == true)
          ?.map((item, index) => {
            const isActive = location?.pathname === item?.path;

            return (
              <Link to={item.path} key={item.text}>
                <ListItem
                  button
                  sx={{
                    mb: 1,
                    py: 1.5,
                    px: 3,
                    cursor: 'pointer',
                    bgcolor: isActive
                      ? alpha(getActiveColor(index), 0.1)
                      : 'transparent',
                    borderLeft: isActive
                      ? `4px solid ${getActiveColor(index)}`
                      : '4px solid transparent',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      transform: 'translateX(4px)',
                      transition: 'all 0.2s ease',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 30,
                      color: isActive
                        ? getActiveColor(index)
                        : alpha(theme.palette.text.primary, 0.7),
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '14px',
                      color: isActive
                        ? 'text.primary'
                        : alpha(theme.palette.text.primary, 0.8),
                    }}
                  />
                </ListItem>
              </Link>
            );
          })}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 1 }} />
        <ListItem
          button
          onClick={logout}
          sx={{
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <ListItemIcon sx={{ color: theme.palette.error.main }}>
            <MdLogout />
          </ListItemIcon>
          <ListItemText
            primary='Logout'
            primaryTypographyProps={{
              fontWeight: 500,
              color: theme.palette.error.main,
            }}
          />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <CssBaseline />
      {/* App Bar */}
      <AppBar
        position='fixed'
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'black',
          boxShadow: '0 1px 0px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color='inherit'
            aria-label='open drawer'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            sx={{ flexGrow: 1, fontWeight: 500 }}
            className='text-gray-500 text-xl'
          >
            {menuItems.find((item) => item.path === location.pathname)?.text ||
              'Dashboard'}
          </Typography>

          <Box>
            <Typography
              variant='caption'
              sx={{ color: '#64748B', fontWeight: 500, fontSize: 11 }}
            >
              Available Balance
            </Typography>
            <Typography
              variant='body1'
              sx={{ fontWeight: 700, color: '#0F172A' }}
            >
              ৳ {isAdmin ? profile?.total_balance || 0 : profile?.balance}{' '}
              {profile?.currency}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component='nav'
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant='permanent'
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component='main'
        sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Box sx={{ py: 0, minHeight: 'calc(100vh - 120px)' }}>
          {children || (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <Typography variant='h5' gutterBottom>
                Welcome to{' '}
                {
                  menuItems.find((item) => item.path === location.pathname)
                    ?.text
                }
              </Typography>
              <Typography variant='body1'>
                Select a section from the sidebar to get started
              </Typography>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box
          component='footer'
          sx={{ py: 2, textAlign: 'center', borderTop: '1px solid #e5e7eb' }}
          className='flex items-center justify-between mx-5'
        >
          <Typography variant='body2' color='text.secondary'>
            © {new Date().getFullYear()} All rights reserved.
          </Typography>
          <Typography variant='body2' color='text.primary'>
            Developed by:{' '}
            <a
              className='text-blue-500 underline'
              href='https://www.bangladeshisoftware.com'
              target='_blank'
            >
              Bangladeshi Software LTD.
            </a>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
