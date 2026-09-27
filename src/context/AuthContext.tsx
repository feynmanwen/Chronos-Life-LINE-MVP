import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AuthUser, 
  AdminUserData,
  getStoredUser, 
  getStoredToken, 
  loginWithCredentials, 
  loginWithLine, 
  logoutUser,
  registerUser,
  resetPassword as apiResetPassword,
  fetchAdminUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminResetPassword as apiAdminResetPassword,
  setSession
} from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
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
  }) => Promise<any>;
  resetPassword: (username: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  // 管理者權限功能
  getAdminUsers: () => Promise<AdminUserData[]>;
  createAdminUser: (params: any) => Promise<any>;
  updateAdminUser: (id: string, updates: Partial<AdminUserData>) => Promise<any>;
  deleteAdminUser: (id: string) => Promise<any>;
  resetAdminUserPassword: (id: string, newPassword: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAdmin = Boolean(
    user && (
      user.role.includes('管理') || 
      user.role === 'admin' || 
      user.username === 'admin' ||
      user.role.includes('醫師')
    )
  );

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
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (username: string, newPassword: string) => {
    return await apiResetPassword(username, newPassword);
  };

  // 管理者 CRUD
  const getAdminUsers = async () => {
    return await fetchAdminUsers();
  };

  const createAdminUser = async (params: any) => {
    return await adminCreateUser(params);
  };

  const updateAdminUser = async (id: string, updates: Partial<AdminUserData>) => {
    return await adminUpdateUser(id, updates);
  };

  const deleteAdminUser = async (id: string) => {
    return await adminDeleteUser(id);
  };

  const resetAdminUserPassword = async (id: string, newPassword: string) => {
    return await apiAdminResetPassword(id, newPassword);
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
        isAdmin,
        isLoading,
        login,
        loginLine,
        logout,
        switchPresetUser,
        register,
        resetPassword,
        getAdminUsers,
        createAdminUser,
        updateAdminUser,
        deleteAdminUser,
        resetAdminUserPassword,
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
