import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setGuestMode: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('moviehub_token'));
  const [isGuest, setIsGuest] = useState<boolean>(() => localStorage.getItem('moviehub_guest') === 'true');
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('moviehub_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch {
      localStorage.removeItem('moviehub_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    localStorage.setItem('moviehub_token', data.token);
    localStorage.removeItem('moviehub_guest');
    setToken(data.token);
    setUser(data.user);
    setIsGuest(false);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.register(name, email, password);
    localStorage.setItem('moviehub_token', data.token);
    localStorage.removeItem('moviehub_guest');
    setToken(data.token);
    setUser(data.user);
    setIsGuest(false);
  };

  const logout = () => {
    localStorage.removeItem('moviehub_token');
    localStorage.removeItem('moviehub_guest');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  const setGuestMode = () => {
    localStorage.setItem('moviehub_guest', 'true');
    localStorage.removeItem('moviehub_token');
    setToken(null);
    setUser(null);
    setIsGuest(true);
  };

  const isAdmin = Boolean(user && user.role === 'admin' && user.status === 'active');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        isGuest,
        login,
        register,
        logout,
        setGuestMode,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
