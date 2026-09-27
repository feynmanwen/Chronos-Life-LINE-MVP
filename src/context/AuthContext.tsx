import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AuthUser, 
  getStoredUser, 
  getStoredToken, 
  loginWithCredentials, 
  loginWithLine, 
  logoutUser,
  registerUser,
  resetPassword as apiResetPassword,
  setSession
} from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginLine: (displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchPresetUser: (username: string) => Promise<void>;
  register: (params: {
    username: string;
    password: string;
    name: string;
    role?: string;
    age?: number;
    gender?: 'M' | 'F';
  }) => Promise<void>;
  resetPassword: (username: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getStoredToken();
    const stored = getStoredUser();
    if (token && stored) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await loginWithCredentials(username, password);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginLine = async (displayName?: string) => {
    setIsLoading(true);
    try {
      const res = await loginWithLine(undefined, displayName);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (params: {
    username: string;
    password: string;
    name: string;
    role?: string;
    age?: number;
    gender?: 'M' | 'F';
  }) => {
    setIsLoading(true);
    try {
      const res = await registerUser(params);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (username: string, newPassword: string) => {
    return await apiResetPassword(username, newPassword);
  };

  // 快捷切換預設身分 (陳偉、陳國華、醫師)
  const switchPresetUser = async (username: string) => {
    const password = username === 'admin' ? 'admin123' : '123456';
    await login(username, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginLine,
        logout,
        switchPresetUser,
        register,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
