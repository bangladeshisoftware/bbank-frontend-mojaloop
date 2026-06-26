/**************************************************************************
 * Copyright © 2026 Bangladeshi Software Ltd. All rights reserved.
 * Distributed under the license terms specified in this repository.
 *
 * ORIGINAL AUTHOR: Muhammad Nasim (Developer)
 **************************************************************************/

import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_APP_SERVER}/api` || '/api',
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('dfsp_v2_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dfsp_v2_token');
      localStorage.removeItem('dfsp_v2_user');
      setTimeout(() => {
        window.location.href = '/login';
      }, 5000);
    }
    return Promise.reject(err);
  },
);

export default api;
