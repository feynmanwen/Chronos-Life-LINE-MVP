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
  member?: any;
  message?: string;
}

export interface AdminUserData {
  id: string;
  username: string;
  name: string;
  role: string;
  avatar_url?: string;
  created_at?: string;
  member_id?: string;
  age?: number;
  gender?: 'M' | 'F';
  base_life_expectancy?: number;
  health_score?: number;
  next_clinic_date?: string;
  next_clinic_department?: string;
  next_clinic_doctor?: string;
  companion_notes?: string;
}

export interface StoredLocalUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  member?: any;
}

const TOKEN_KEY = 'chronos_auth_token_v13';
const USER_KEY = 'chronos_auth_user_v13';
const LOCAL_USERS_KEY = 'chronos_registered_users_v14';
const LOCAL_MEMBERS_KEY = 'chronos_members_v13';

// 預設本機使用者（支援離線與無後端環境完整登入體驗）
const DEFAULT_PRESET_USERS: StoredLocalUser[] = [
  {
    id: 'usr-1',
    username: 'chen_wei',
    password: '123456',
    name: '陳偉 (本人)',
    role: '本人',
    avatar_url: '/icon-192.png',
    created_at: '2026-09-01T00:00:00.000Z',
    member: {
      id: 'member-1',
      name: '陳偉 (本人)',
      role: '本人',
      age: 42,
      gender: 'M',
      baseLifeExpectancyYears: 42.5,
      dynamicBonusYears: 3.2,
      nextClinicDate: '2026-09-28',
      nextClinicDepartment: '肝膽腸胃科',
      nextClinicDoctor: '李明峰 主治醫師',
      companionNotes: '追蹤脂肪肝與 ALT 數值，準備近三年健檢折線圖與用藥提問清單。',
      sleepHoursDaily: 6.5,
      dailySteps: 7850,
      spo2: 98,
      restingHeartRate: 72,
      healthScore: 78,
    }
  },
  {
    id: 'usr-2',
    username: 'chen_guo_hua',
    password: '123456',
    name: '陳國華 (父親)',
    role: '父親',
    avatar_url: '/icon-192.png',
    created_at: '2026-09-01T00:00:00.000Z',
    member: {
      id: 'member-2',
      name: '陳國華 (父親)',
      role: '父親',
      age: 70,
      gender: 'M',
      baseLifeExpectancyYears: 16.4,
      dynamicBonusYears: 1.1,
      nextClinicDate: '2026-09-19',
      nextClinicDepartment: '心臟血管內科',
      nextClinicDoctor: '張世傑 教授',
      companionNotes: '定期慢箋領藥，近期血壓偶有波動 (138/88 mmHg)，需留意晨間低血壓。',
      sleepHoursDaily: 7.0,
      dailySteps: 4200,
      spo2: 96,
      restingHeartRate: 68,
      healthScore: 71,
    }
  },
  {
    id: 'usr-admin',
    username: 'admin',
    password: 'admin123',
    name: '李明峰 主治醫師',
    role: '醫師 / 管理員',
    avatar_url: '/icon-192.png',
    created_at: '2026-09-01T00:00:00.000Z',
    member: {
      id: 'member-admin',
      name: '李明峰 主治醫師',
      role: '醫師 / 管理員',
      age: 48,
      gender: 'M',
      baseLifeExpectancyYears: 38.0,
      dynamicBonusYears: 2.5,
      nextClinicDate: '2026-10-01',
      nextClinicDepartment: '預防醫學暨健康管理中心',
      nextClinicDoctor: '醫療主管',
      companionNotes: '系統管理員兼主治醫師，具備跨科別健檢報告審核與全體用戶管理權限。',
      sleepHoursDaily: 7.5,
      dailySteps: 8500,
      spo2: 99,
      restingHeartRate: 65,
      healthScore: 92,
    }
  }
];

export const getLocalUsers = (): StoredLocalUser[] => {
  if (typeof window === 'undefined') return DEFAULT_PRESET_USERS;
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_PRESET_USERS));
      return DEFAULT_PRESET_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PRESET_USERS;
  } catch {
    return DEFAULT_PRESET_USERS;
  }
};

export const saveLocalUsers = (users: StoredLocalUser[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

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

// 帳號密碼登入 (支援 SQLite 與 本地持久快取)
export async function loginWithCredentials(username: string, password: string): Promise<LoginResponse> {
  try {
    const data = await apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setSession(data.token, data.user);
    return data;
  } catch (err: any) {
    // 檢查本地資料庫備援 (離線或 Android APK 獨立運行)
    const localUsers = getLocalUsers();
    const matched = localUsers.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    
    if (matched) {
      if (matched.password === password) {
        const safeUser: AuthUser = {
          id: matched.id,
          username: matched.username,
          name: matched.name,
          role: matched.role,
          avatar_url: matched.avatar_url || '/icon-192.png',
        };
        const token = 'sess_local_' + Date.now();
        setSession(token, safeUser);
        return { token, user: safeUser, member: matched.member, message: `歡迎回來，${matched.name}！` };
      }
      throw new Error('密碼錯誤，請重新輸入');
    }
    
    throw new Error(err.message || '查無此帳號，請確認帳號或點擊下方新增註冊');
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
    return { token: fallbackToken, user: fallbackUser, message: 'LINE 快速登入成功' };
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

// 註冊新使用者 (新增使用者) - 雙向保障 SQLite 與本地持久化
export async function registerUser(params: {
  username: string;
  password: string;
  name: string;
  role?: string;
  age?: number;
  gender?: 'M' | 'F';
}): Promise<LoginResponse> {
  const normUsername = params.username.trim();
  const normName = params.name.trim();
  const normRole = params.role || '本人';
  const normAge = Number(params.age) || 35;
  const normGender = params.gender || 'M';

  // 1. 建立健康成員資料模型
  const baseLife = normGender === 'F' ? 48.0 : 42.0;
  const newMemberId = 'member-' + Date.now();
  const newUserId = 'usr-' + Date.now();
  const newMember = {
    id: newMemberId,
    name: `${normName} (${normRole})`,
    role: normRole,
    age: normAge,
    gender: normGender,
    baseLifeExpectancyYears: baseLife,
    dynamicBonusYears: 1.5,
    nextClinicDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    nextClinicDepartment: '家醫科 / 預防醫學',
    nextClinicDoctor: '陳建國 主治醫師',
    companionNotes: '新註冊會員，建議預約初診建立基線健檢資料。',
    sleepHoursDaily: 7.0,
    dailySteps: 6000,
    spo2: 98,
    restingHeartRate: 72,
    healthScore: 75,
  };

  try {
    // 優先向後台 SQLite 註冊
    const data = await apiRequest<LoginResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: normUsername,
        password: params.password,
        name: normName,
        role: normRole,
        age: normAge,
        gender: normGender,
      }),
    });

    setSession(data.token, data.user);

    // 同步寫入本地資料庫快取
    const localUsers = getLocalUsers();
    const updatedUsers = localUsers.filter(u => u.username !== normUsername);
    updatedUsers.unshift({
      id: data.user.id,
      username: normUsername,
      password: params.password,
      name: normName,
      role: normRole,
      avatar_url: '/icon-192.png',
      created_at: new Date().toISOString(),
      member: data.member || newMember
    });
    saveLocalUsers(updatedUsers);

    // 同步新增到本地家庭健康成員快取
    try {
      const rawMembers = localStorage.getItem(LOCAL_MEMBERS_KEY);
      const membersList = rawMembers ? JSON.parse(rawMembers) : [];
      if (!membersList.some((m: any) => m.name.includes(normName))) {
        membersList.unshift(data.member || newMember);
        localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(membersList));
      }
    } catch {
      // 略過快取寫入異常
    }

    return { ...data, member: data.member || newMember };
  } catch (err: any) {
    // 若後台回應「此帳號已被註冊」且非連線異常，直接向上拋出提示
    if (err.message && err.message.includes('已被註冊')) {
      throw err;
    }

    // 離線/本地模式降級註冊
    const offlineUser: AuthUser = {
      id: newUserId,
      username: normUsername,
      name: normName,
      role: normRole,
      avatar_url: '/icon-192.png',
    };
    const offlineToken = 'sess_reg_offline_' + Date.now();
    setSession(offlineToken, offlineUser);

    const localUsers = getLocalUsers();
    const updatedUsers = localUsers.filter(u => u.username !== normUsername);
    updatedUsers.unshift({
      id: newUserId,
      username: normUsername,
      password: params.password,
      name: normName,
      role: normRole,
      avatar_url: '/icon-192.png',
      created_at: new Date().toISOString(),
      member: newMember
    });
    saveLocalUsers(updatedUsers);

    // 同步加入本地成員列表
    try {
      const rawMembers = localStorage.getItem(LOCAL_MEMBERS_KEY);
      const membersList = rawMembers ? JSON.parse(rawMembers) : [];
      membersList.unshift(newMember);
      localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(membersList));
    } catch {
      // 略過快取
    }

    return {
      token: offlineToken,
      user: offlineUser,
      member: newMember,
      message: `註冊成功！歡迎加入 Chronos Life，${normName}！`
    };
  }
}

// 忘記密碼與密碼重設
export async function resetPassword(username: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiRequest<{ success: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ username, newPassword }),
    });

    // 同步更新本機快取
    const localUsers = getLocalUsers();
    const target = localUsers.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (target) {
      target.password = newPassword;
      saveLocalUsers(localUsers);
    }

    return res;
  } catch (err: any) {
    // 離線模式重設
    const localUsers = getLocalUsers();
    const target = localUsers.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (target) {
      target.password = newPassword;
      saveLocalUsers(localUsers);
      return {
        success: true,
        message: `帳號 [${username}] 密碼已成功更新，請使用新密碼登入！`
      };
    }
    throw new Error(err.message || `查無帳號 [${username}]`);
  }
}

// ==================== 管理者專用 API ====================

// 取得所有使用者列表 (Admin)
export async function fetchAdminUsers(): Promise<AdminUserData[]> {
  try {
    return await apiRequest<AdminUserData[]>('/api/admin/users');
  } catch {
    // 離線備援：從本地資料庫產生管理清單
    const localUsers = getLocalUsers();
    return localUsers.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      avatar_url: u.avatar_url,
      created_at: u.created_at,
      member_id: u.member?.id,
      age: u.member?.age || 35,
      gender: u.member?.gender || 'M',
      base_life_expectancy: u.member?.baseLifeExpectancyYears || 42.0,
      health_score: u.member?.healthScore || 75,
      next_clinic_date: u.member?.nextClinicDate || '2026-10-15',
      next_clinic_department: u.member?.nextClinicDepartment || '家醫科 / 預防醫學',
      next_clinic_doctor: u.member?.nextClinicDoctor || '李明峰 主治醫師',
      companionNotes: u.member?.companionNotes || '',
    }));
  }
}

// 管理者新增使用者 (Admin)
export async function adminCreateUser(params: {
  username: string;
  password: string;
  name: string;
  role?: string;
  age?: number;
  gender?: 'M' | 'F';
  notes?: string;
  clinicDept?: string;
}): Promise<{ success: boolean; user: any; message: string }> {
  try {
    const res = await apiRequest<any>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    // 同步到本地
    const localUsers = getLocalUsers();
    const newMemberId = 'member-' + Date.now();
    const newMember = {
      id: newMemberId,
      name: `${params.name} (${params.role || '本人'})`,
      role: params.role || '本人',
      age: Number(params.age) || 35,
      gender: params.gender || 'M',
      baseLifeExpectancyYears: params.gender === 'F' ? 48.0 : 42.0,
      dynamicBonusYears: 1.5,
      nextClinicDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      nextClinicDepartment: params.clinicDept || '家醫科 / 預防醫學',
      nextClinicDoctor: '李明峰 主治醫師',
      companionNotes: params.notes || '管理者手動建立之會員健康資產。',
      sleepHoursDaily: 7.0,
      dailySteps: 6000,
      spo2: 98,
      restingHeartRate: 72,
      healthScore: 75,
    };
    localUsers.unshift({
      id: res.user?.id || 'usr-' + Date.now(),
      username: params.username,
      password: params.password,
      name: params.name,
      role: params.role || '本人',
      created_at: new Date().toISOString(),
      member: newMember,
    });
    saveLocalUsers(localUsers);

    return res;
  } catch (err: any) {
    // 離線新增備援
    const newUserId = 'usr-' + Date.now();
    const newMemberId = 'member-' + Date.now();
    const newMember = {
      id: newMemberId,
      name: `${params.name} (${params.role || '本人'})`,
      role: params.role || '本人',
      age: Number(params.age) || 35,
      gender: params.gender || 'M',
      baseLifeExpectancyYears: params.gender === 'F' ? 48.0 : 42.0,
      dynamicBonusYears: 1.5,
      nextClinicDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      nextClinicDepartment: params.clinicDept || '家醫科 / 預防醫學',
      nextClinicDoctor: '李明峰 主治醫師',
      companionNotes: params.notes || '管理者手動建立之會員健康資產。',
      sleepHoursDaily: 7.0,
      dailySteps: 6000,
      spo2: 98,
      restingHeartRate: 72,
      healthScore: 75,
    };
    const localUsers = getLocalUsers();
    localUsers.unshift({
      id: newUserId,
      username: params.username,
      password: params.password,
      name: params.name,
      role: params.role || '本人',
      created_at: new Date().toISOString(),
      member: newMember,
    });
    saveLocalUsers(localUsers);

    return {
      success: true,
      user: { id: newUserId, username: params.username, name: params.name, role: params.role },
      message: `成功新增使用者 [${params.name}] (本地快取模式)`
    };
  }
}

// 管理者修改使用者資料 (Admin)
export async function adminUpdateUser(id: string, updates: Partial<AdminUserData>): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiRequest<{ success: boolean; message: string }>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    // 同步更新本地
    const localUsers = getLocalUsers();
    const target = localUsers.find(u => u.id === id);
    if (target) {
      if (updates.name) target.name = updates.name;
      if (updates.role) target.role = updates.role;
      if (target.member) {
        if (updates.name) target.member.name = updates.name;
        if (updates.role) target.member.role = updates.role;
        if (updates.age !== undefined) target.member.age = updates.age;
        if (updates.gender) target.member.gender = updates.gender;
        if (updates.health_score !== undefined) target.member.healthScore = updates.health_score;
        if (updates.companion_notes !== undefined) target.member.companionNotes = updates.companion_notes;
        if (updates.next_clinic_department) target.member.nextClinicDepartment = updates.next_clinic_department;
      }
      saveLocalUsers(localUsers);
    }

    return res;
  } catch (err: any) {
    // 離線更新備援
    const localUsers = getLocalUsers();
    const target = localUsers.find(u => u.id === id);
    if (target) {
      if (updates.name) target.name = updates.name;
      if (updates.role) target.role = updates.role;
      if (target.member) {
        if (updates.name) target.member.name = updates.name;
        if (updates.role) target.member.role = updates.role;
        if (updates.age !== undefined) target.member.age = updates.age;
        if (updates.gender) target.member.gender = updates.gender;
        if (updates.health_score !== undefined) target.member.healthScore = updates.health_score;
        if (updates.companion_notes !== undefined) target.member.companionNotes = updates.companion_notes;
      }
      saveLocalUsers(localUsers);
      return { success: true, message: `使用者 [${target.name}] 資料已更新！` };
    }
    throw new Error(err.message || '找不到使用者');
  }
}

// 管理者重設使用者密碼 (Admin)
export async function adminResetPassword(id: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiRequest<{ success: boolean; message: string }>(`/api/admin/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });

    const localUsers = getLocalUsers();
    const target = localUsers.find(u => u.id === id);
    if (target) {
      target.password = newPassword;
      saveLocalUsers(localUsers);
    }

    return res;
  } catch (err: any) {
    const localUsers = getLocalUsers();
    const target = localUsers.find(u => u.id === id);
    if (target) {
      target.password = newPassword;
      saveLocalUsers(localUsers);
      return { success: true, message: `使用者 [${target.name}] 密碼已重設成功！` };
    }
    throw new Error(err.message || '找不到使用者');
  }
}

// 管理者刪除使用者 (Admin)
export async function adminDeleteUser(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiRequest<{ success: boolean; message: string }>(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });

    const localUsers = getLocalUsers();
    const updated = localUsers.filter(u => u.id !== id);
    saveLocalUsers(updated);

    return res;
  } catch (err: any) {
    const localUsers = getLocalUsers();
    const target = localUsers.find(u => u.id === id);
    if (target?.username === 'admin') {
      throw new Error('系統保護：無法刪除預設系統管理員帳號 (admin)');
    }
    const updated = localUsers.filter(u => u.id !== id);
    saveLocalUsers(updated);
    return { success: true, message: '已成功刪除使用者！' };
  }
}

// 取得家庭成員列表 (API)
export async function fetchMembers(): Promise<any[]> {
  try {
    return await apiRequest<any[]>('/api/members');
  } catch {
    return [];
  }
}
