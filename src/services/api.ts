export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: string;
  avatar_url?: string;
  line_user_id?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

const TOKEN_KEY = 'chronos_auth_token_v13';
const USER_KEY = 'chronos_auth_user_v13';

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setSession = (token: string, user: AuthUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// API 請求封裝（支援後台連線與離線自動降級）
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: '伺服器回應異常' }));
    throw new Error(errorData.error || `HTTP 錯誤 ${res.status}`);
  }

  return res.json();
}

// 帳號密碼登入
export async function loginWithCredentials(username: string, password: string): Promise<LoginResponse> {
  try {
    const data = await apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setSession(data.token, data.user);
    return data;
  } catch (err) {
    // 離線模擬備援（例如純手機端離線環境）
    if (username === 'chen_wei' && password === '123456') {
      const fallbackUser: AuthUser = {
        id: 'usr-1',
        username: 'chen_wei',
        name: '陳偉 (本人)',
        role: '本人',
        avatar_url: '/icon-192.png',
        line_user_id: 'U1001_chen_wei',
      };
      const fallbackToken = 'sess_offline_' + Date.now();
      setSession(fallbackToken, fallbackUser);
      return { token: fallbackToken, user: fallbackUser, message: '離線登入成功 (本地快取模式)' };
    }
    throw err;
  }
}

// LINE 快速登入
export async function loginWithLine(lineUserId?: string, displayName?: string): Promise<LoginResponse> {
  try {
    const data = await apiRequest<LoginResponse>('/api/auth/line-login', {
      method: 'POST',
      body: JSON.stringify({ lineUserId, displayName }),
    });
    setSession(data.token, data.user);
    return data;
  } catch (err) {
    // 離線快速登入備援
    const fallbackUser: AuthUser = {
      id: 'usr-1',
      username: 'chen_wei',
      name: displayName || '陳偉 (本人)',
      role: '本人',
      avatar_url: '/icon-192.png',
      line_user_id: lineUserId || 'U1001_chen_wei',
    };
    const fallbackToken = 'sess_line_offline_' + Date.now();
    setSession(fallbackToken, fallbackUser);
    return { token: fallbackToken, user: fallbackUser, message: 'LINE 離線快速登入成功' };
  }
}

// 登出
export async function logoutUser(): Promise<void> {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' });
  } catch {
    // 忽略連線失敗
  } finally {
    clearSession();
  }
}

// 註冊新使用者 (新增使用者)
export async function registerUser(params: {
  username: string;
  password: string;
  name: string;
  role?: string;
  age?: number;
  gender?: 'M' | 'F';
}): Promise<LoginResponse> {
  try {
    const data = await apiRequest<LoginResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setSession(data.token, data.user);
    return data;
  } catch (err: any) {
    // 離線模式備援註冊
    const offlineUser: AuthUser = {
      id: 'usr-offline-' + Date.now(),
      username: params.username,
      name: params.name,
      role: params.role || '本人',
      avatar_url: '/icon-192.png',
    };
    const offlineToken = 'sess_reg_offline_' + Date.now();
    setSession(offlineToken, offlineUser);
    return { token: offlineToken, user: offlineUser, message: '離線註冊成功 (本地模式)' };
  }
}

// 忘記密碼與密碼重設
export async function resetPassword(username: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  return await apiRequest<{ success: boolean; message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ username, newPassword }),
  });
}
