import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormHelperText,
} from '@mui/material';

function SelectUserOption({
  label = 'Select Merchant',
  onSelect,
  required = true,
}) {
  const [loading, setLoading] = useState(false);
  const [merchant, setMerchant] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState(false);
  const token = localStorage.getItem('dfsp_v2_token');

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_SERVER}/api/parties/active/merchant`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const ress = await response.json();
      if (response.ok) {
        setMerchant(ress?.data || []);
      } else {
        console.error('Failed to fetch parties:', ress);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedId(selectedValue);
    setError(false);
    if (onSelect) {
      const f = merchant?.find((v) => v?.id === selectedId);
      onSelect(selectedValue, f?.single_transaction_limit);
    }
  };

  const handleBlur = () => {
    // trigger validation on blur if required
    if (required && !selectedId) {
      setError(true);
    }
  };

  return (
    <Box sx={{ minWidth: 240 }}>
      <FormControl fullWidth error={error}>
        <InputLabel>{label}</InputLabel>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Select
            value={selectedId}
            label={label}
            onChange={handleSelectChange}
            onBlur={handleBlur}
          >
            <MenuItem value=''>
              <em>None</em>
            </MenuItem>
            {merchant.length > 0 ? (
              merchant.map((m) => (
                <MenuItem key={m.id} value={m?.id}>
                  {m.display_name || `${m.first_name} ${m.last_name}`}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No merchants found</MenuItem>
            )}
          </Select>
        )}
        {error && <FormHelperText>Please select a merchant</FormHelperText>}
      </FormControl>
    </Box>
  );
}

export default SelectUserOption;
