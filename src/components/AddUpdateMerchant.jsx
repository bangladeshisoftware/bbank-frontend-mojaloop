/**************************************************************************
 * Copyright © 2026 Bangladeshi Software Ltd. All rights reserved.
 * Distributed under the license terms specified in this repository.
 *
 * ORIGINAL AUTHOR: Muhammad Nasim (Developer)
 **************************************************************************/

import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';

import swal from 'sweetalert';
import { ImSpinner4 } from 'react-icons/im';

function AddUpdateMerchant({
  openAddDialog,
  handleCloseDialog,
  isEdit,
  loadData,
}) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isEdit) {
      console.log('is edit...');
      setNewParty(isEdit);
    } else {
      console.log('ass');
    }
  }, [isEdit]);
  const [newParty, setNewParty] = useState({
    display_name: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    dob: '',
    id_type: '',
    id_value: '',
    email: '',
    password: '',
    // new
    nid: '',
    acc_no: '',
    daily_limit: '',
    single_transaction_limit: '',
  });

  const handleAddParty = async () => {
    if (
      !newParty.display_name ||
      !newParty.first_name ||
      !newParty.last_name ||
      !newParty.dob ||
      !newParty.id_type ||
      !newParty.id_value ||
      !newParty.nid ||
      !newParty.acc_no ||
      !newParty.daily_limit ||
      !newParty.single_transaction_limit
    ) {
      swal('Warning!', 'Please fill in all fields', 'warning');
      return;
    }
    if (Object.keys(isEdit).length < 1) {
      if (!newParty.email || !newParty.password) {
        swal('Warning!', 'Please fill Auth fields', 'warning');
        return;
      }
    }
    try {
      setLoading(true);
      const method = (Object.keys(isEdit).length > 0 && 'PUT') || 'POST';
      console.log(isEdit);
      const response = await fetch(
        `${import.meta.env.VITE_APP_SERVER}/api/parties/add`,
        {
          method: method,
          headers: {
            'FSPIOP-Source': 'BS Bank',
            Authorization: `Bearer asdfjkl;@123456abcdedfghjklmnopqrst`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newParty),
        },
      );

      if (response.ok) {
        swal(
          'Success',
          `Merchant is successfully ${
            (Object.keys(isEdit).length > 0 && 'updated') || 'added'
          }.`,
          'success',
        );
        setNewParty({
          display_name: '',
          first_name: '',
          middle_name: '',
          last_name: '',
          dob: '',
          id_type: '',
          id_value: '',
          email: '',
          password: '',
          nid: '',
          acc_no: '',
          daily_limit: '',
          single_transaction_limit: '',
        });
        handleCloseDialog();
        loadData();
      } else {
        const ress = await response?.json();
        swal('Failed!', ress?.message || 'Failed to create Party!', 'error');
      }
    } catch (error) {
      console.log(error);
      swal('Network Error!', 'Something went wrong! Try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Add Party Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseDialog}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle fontWeight={600}>
          {(Object.keys(isEdit).length > 0 && 'Update') || 'Add New'} Merchant
        </DialogTitle>
        <DialogContent className='max-h-[60vh]'>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label='Business Name'
              variant='outlined'
              value={newParty.display_name}
              onChange={(e) =>
                setNewParty({ ...newParty, display_name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label='First Name'
              variant='outlined'
              value={newParty.first_name}
              onChange={(e) =>
                setNewParty({ ...newParty, first_name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label='Middle Name'
              variant='outlined'
              value={newParty.middle_name}
              onChange={(e) =>
                setNewParty({ ...newParty, middle_name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label='Last Name'
              variant='outlined'
              value={newParty.last_name}
              onChange={(e) =>
                setNewParty({ ...newParty, last_name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label='Date of Birth'
              type='date'
              InputLabelProps={{ shrink: true }}
              variant='outlined'
              value={newParty.dob}
              onChange={(e) =>
                setNewParty({ ...newParty, dob: e.target.value })
              }
              fullWidth
            />
            <TextField
              label='ID Type'
              select
              variant='outlined'
              value={newParty.id_type}
              onChange={(e) =>
                setNewParty({ ...newParty, id_type: e.target.value })
              }
              fullWidth
            >
              <MenuItem value='MSISDN'>MSISDN</MenuItem>
            </TextField>
            <TextField
              label='ID Value'
              variant='outlined'
              value={newParty.id_value}
              onChange={(e) =>
                setNewParty({ ...newParty, id_value: e.target.value })
              }
              type='number'
              fullWidth
            />
            {/* new */}
            <TextField
              label='Daily Limit'
              variant='outlined'
              value={newParty.daily_limit}
              onChange={(e) =>
                setNewParty({ ...newParty, daily_limit: e.target.value })
              }
              type='number'
              fullWidth
            />
            <TextField
              label='Single Transaction Limit.'
              variant='outlined'
              value={newParty.single_transaction_limit}
              onChange={(e) =>
                setNewParty({
                  ...newParty,
                  single_transaction_limit: e.target.value,
                })
              }
              type='number'
              fullWidth
            />
            <TextField
              label='National ID'
              variant='outlined'
              value={newParty.nid}
              onChange={(e) =>
                setNewParty({ ...newParty, nid: e.target.value })
              }
              type='number'
              fullWidth
            />
            <TextField
              label='Account Number'
              variant='outlined'
              value={newParty.acc_no}
              onChange={(e) =>
                setNewParty({ ...newParty, acc_no: e.target.value })
              }
              type='number'
              fullWidth
            />
            {Object.keys(isEdit).length < 1 && (
              <div className='border border-gray-300 p-4 flex flex-col gap-3 rounded-md'>
                <h2>Auth</h2>
                <TextField
                  label='Email'
                  variant='outlined'
                  value={newParty.email}
                  onChange={(e) =>
                    setNewParty({ ...newParty, email: e.target.value })
                  }
                  type='email'
                  fullWidth
                />
                <TextField
                  label='Password'
                  variant='outlined'
                  value={newParty.password}
                  onChange={(e) =>
                    setNewParty({ ...newParty, password: e.target.value })
                  }
                  type='password'
                  fullWidth
                />
              </div>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant='contained'
            onClick={handleAddParty}
            sx={{
              textTransform: 'none',
              bgcolor: theme.palette.primary.main,
              '&:hover': { bgcolor: theme.palette.primary.dark },
            }}
          >
            {loading ? (
              <div className='flex items-center gap-1.5'>
                <ImSpinner4 className='animate-spin' />
                <span>Please waite...</span>
              </div>
            ) : (
              'Submit'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AddUpdateMerchant;
