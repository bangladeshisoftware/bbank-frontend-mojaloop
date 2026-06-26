/**************************************************************************
 * Copyright © 2026 Bangladeshi Software Ltd. All rights reserved.
 * Distributed under the license terms specified in this repository.
 *
 * ORIGINAL AUTHOR: Muhammad Nasim (Developer)
 **************************************************************************/

import React from 'react';
import { Typography, Box, Stack, Link } from '@mui/material';
import { VscDebugBreakpointData } from 'react-icons/vsc';

function OldHome() {
  const features = [
    'DFSP Parties configuration.',
    'Possible P2P transfers between 2 DFSPs.',
    'Live logs with DFSP Configuration settings.',
  ];

  return (
    <Box className='p-6 '>
      <div className=''>
        <div>
          <Typography variant='h4' mb={2} fontWeight={600}>
            Welcome to B Bank Payments Portal.
            <Typography>
              Here connected to Mojaloop Hub for Live payments transfers system
              1 DFSP to another DFSP.{' '}
            </Typography>
          </Typography>

          <Box mb={3}>
            <Typography variant='h6' mb={1} fontWeight={500}>
              Features
            </Typography>
            <Stack spacing={1}>
              {features.map((feature, idx) => (
                <Box
                  key={idx}
                  display='flex'
                  alignItems='center'
                  color='text.secondary'
                >
                  <VscDebugBreakpointData
                    style={{ marginRight: 8, color: '#3B82F6' }}
                  />
                  <Typography variant='body2'>{feature}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Note: We created a custom TTK Mobile Simulator Demo, similar to Mojaloop, using Mojaloop core services for better understand which process is this DFSP payments working.<br/>
          Is this very basic overflow that we build.
        </Typography>
      </Box> */}
        </div>
        <div className='cursor-alias mb-4 py-6 px-8 border shadow-md bg-gray-50 w-fit border-blue-50 rounded hover:bg-blue-400'>
          <h3 className='text-blue-600 bg-white py-2 px-3 text-xl font-semibold'>
            Real Payments in{' '}
            <span className='bg-white py-2 px-3 rounded-md text-orange-600'>
              Mojaloop
            </span>
            .{' '}
          </h3>
        </div>
      </div>
    </Box>
  );
}

export default OldHome;
