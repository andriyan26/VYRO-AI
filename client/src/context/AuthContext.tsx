import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export type UserRole = 'USER' | 'CREATOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: any, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('vyro_access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          localStorage.removeItem('vyro_access_token');
          localStorage.removeItem('vyro_refresh_token');
          setUser(null);
        }
      } catch (error) {
        localStorage.removeItem('vyro_access_token');
        localStorage.removeItem('vyro_refresh_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User, accessToken: string, refreshToken?: string) => {
    localStorage.setItem('vyro_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('vyro_refresh_token', refreshToken);
    }
    setUser(userData);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('vyro_refresh_token');
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    localStorage.removeItem('vyro_access_token');
    localStorage.removeItem('vyro_refresh_token');
    setUser(null);
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

