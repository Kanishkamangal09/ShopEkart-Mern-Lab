import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ask the backend who is logged in (the JWT lives in an HttpOnly cookie).
  const refreshUser = useCallback(async () => {
    try {
      const data = await apiRequest('/customers/me');
      setUser(data);
      return data;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials) => {
    await apiRequest('/customers/login', { method: 'POST', body: credentials });
    return refreshUser();
  };

  const logout = async () => {
    try {
      await apiRequest('/customers/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
