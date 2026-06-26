/**************************************************************************
 * Copyright © 2026 Bangladeshi Software Ltd. All rights reserved.
 * Distributed under the license terms specified in this repository.
 *
 * ORIGINAL AUTHOR: Muhammad Nasim (Developer)
 **************************************************************************/

import axios from 'axios';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('dfsp_v2_token');
    } catch {
      return null;
    }
  });
  useEffect(() => {
    if (token) getProfile();
  }, [token]);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dfsp_v2_user') || 'null');
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);

  const login = useCallback((token, userData) => {
    localStorage.setItem('dfsp_v2_token', token);
    localStorage.setItem('dfsp_v2_user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('dfsp_v2_token');
    localStorage.removeItem('dfsp_v2_user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  const getProfile = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_APP_SERVER}/api/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setProfile(data);
    } catch (error) {
      null;
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isMerchant = user?.role === 'MERCHANT';

  return (
    <Ctx.Provider
      value={{ user, profile, getProfile, login, logout, isAdmin, isMerchant }}
    >
      {children}
    </Ctx.Provider>
  );
}
