/**************************************************************************
 * Copyright © 2026 Bangladeshi Software Ltd. All rights reserved.
 * Distributed under the license terms specified in this repository.
 *
 * ORIGINAL AUTHOR: Muhammad Nasim (Developer)
 **************************************************************************/

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Grid,
  Chip,
  Avatar,
  Container,
  Breadcrumbs,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import {
  NavigateNext,
  AccountBalance,
  Payment,
  TrendingUp,
  Add,
} from '@mui/icons-material';

function DFSP() {
  const theme = useTheme();

  const dfspData = [
    {
      id: 'payeefsp',
      name: 'BS Bank',
      type: 'Payee DFSP',
      status: 'active',
      transactions: '1.2M',
      volume: '$4.5B',
      avatarColor: '#1976d2',
      description: 'National central banking authority',
    },
    {
      id: 'payerfsp',
      name: 'Karent Pay',
      type: 'Payer DFSP',
      status: 'active',
      transactions: '850K',
      volume: '$2.1B',
      avatarColor: '#2e7d32',
      description: 'Digital payment solutions provider',
    },
  ];

  const getStatusChip = (status) => {
    const statusConfig = {
      active: { color: 'success', label: 'Active' },
      inactive: { color: 'default', label: 'Inactive' },
      pending: { color: 'warning', label: 'Pending' },
    };

    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <Chip
        label={config.label}
        color={config.color}
        size='small'
        variant='outlined'
      />
    );
  };

  return (
    <div className='py-4 px-8'>
      {/* DFSP List */}
      <Typography variant='h6' fontWeight={600} sx={{ mb: 3 }}>
        Connected Providers
      </Typography>

      <Grid container spacing={3}>
        {dfspData.map((dfsp) => (
          <Grid item xs={12} md={6} key={dfsp.id}>
            <div className='bg-gray-100 hover:shadow-md hover:bg-white'>
              <Card component={Link} to={`/dfsp/${dfsp.id}`}>
                <Box sx={{ p: 3 }}>
                  {/* Header */}
                  <Box
                    sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: dfsp.avatarColor,
                        width: 56,
                        height: 56,
                        mr: 2,
                        fontWeight: 600,
                        fontSize: '1.25rem',
                      }}
                    >
                      {dfsp.name
                        .split(' ')
                        .map((word) => word[0])
                        .join('')}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <Typography
                          variant='h6'
                          fontWeight={700}
                          sx={{ mr: 2 }}
                        >
                          {dfsp.name}
                        </Typography>
                        {getStatusChip(dfsp.status)}
                      </Box>

                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mb: 1 }}
                      >
                        {dfsp.type}
                      </Typography>

                      <Typography variant='body2'>
                        {dfsp.description}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      pt: 2,
                      borderTop: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography
                      variant='button'
                      color='primary'
                      fontWeight={600}
                    >
                      View Details
                    </Typography>

                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.palette.primary.main,
                      }}
                    >
                      <NavigateNext />
                    </Box>
                  </Box>
                </Box>
              </Card>
            </div>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default DFSP;
