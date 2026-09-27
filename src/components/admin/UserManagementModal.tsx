import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { AdminUserData } from '../../services/api';
import { 
  ShieldCheck, 
  X, 
  UserPlus, 
  Search, 
  Edit3, 
  KeyRound, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  Calendar,
  HeartPulse,
  User,
  Lock,
  Stethoscope,
  Activity
} from 'lucide-react';

export const UserManagementModal: React.FC = () => {
  const { 
    user: currentUser, 
    isAdmin, 
    getAdminUsers, 
    createAdminUser, 
    updateAdminUser, 
    deleteAdminUser, 
    resetAdminUserPassword 
  } = useAuth();

  const { isUserManagementOpen, setIsUserManagementOpen, refreshMembers } = useHealth();

  // 使用者列表狀態
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 子彈窗狀態
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserData | null>(null);
  const [resetPassUser, setResetPassUser] = useState<AdminUserData | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserData | null>(null);

  // 新增使用者表單狀態
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newRole, setNewRole] = useState('本人');
  const [newAge, setNewAge] = useState(38);
  const [newGender, setNewGender] = useState<'M' | 'F'>('M');
  const [newClinicDept, setNewClinicDept] = useState('家醫科 / 預防醫學');
  const [newNotes, setNewNotes] = useState('');

  // 編輯使用者表單狀態
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editAge, setEditAge] = useState(35);
  const [editGender, setEditGender] = useState<'M' | 'F'>('M');
  const [editHealthScore, setEditHealthScore] = useState(75);
  const [editClinicDept, setEditClinicDept] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // 重設密碼表單狀態
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || '載入使用者列表失敗' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isUserManagementOpen) {
      loadUsers();
      setFeedback(null);
    }
  }, [isUserManagementOpen]);

  if (!isUserManagementOpen) return null;

  // 搜尋過濾
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 處理新增使用者
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim() || !newPassword.trim()) {
      setFeedback({ type: 'error', message: '請完整填寫帳號、姓名與密碼' });
      return;
    }

    try {
      const res = await createAdminUser({
        username: newUsername.trim(),
        password: newPassword,
        name: newName.trim(),
        role: newRole,
        age: Number(newAge),
        gender: newGender,
        clinicDept: newClinicDept,
        notes: newNotes,
      });

      setFeedback({ type: 'success', message: res.message || `成功新增使用者 [${newName}]` });
      setIsAddModalOpen(false);
      // 清空表單
      setNewUsername('');
      setNewName('');
      setNewPassword('123456');
      setNewNotes('');
      // 重新載入列表與全域成員
      await loadUsers();
      await refreshMembers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || '新增使用者失敗' });
    }
  };

  // 打開編輯視窗
  const openEditModal = (u: AdminUserData) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditRole(u.role);
    setEditAge(u.age || 35);
    setEditGender(u.gender || 'M');
    setEditHealthScore(u.health_score || 75);
    setEditClinicDept(u.next_clinic_department || '家醫科 / 預防醫學');
    setEditNotes(u.companion_notes || '');
  };

  // 處理編輯儲存
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await updateAdminUser(editingUser.id, {
        name: editName.trim(),
        role: editRole,
        age: Number(editAge),
        gender: editGender,
        health_score: Number(editHealthScore),
        next_clinic_department: editClinicDept,
        companion_notes: editNotes,
      });

      setFeedback({ type: 'success', message: res.message || '使用者資料更新成功！' });
      setEditingUser(null);
      await loadUsers();
      await refreshMembers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || '更新使用者失敗' });
    }
  };

  // 處理密碼重設
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassUser || !newPasswordInput) return;

    if (newPasswordInput.length < 4) {
      setFeedback({ type: 'error', message: '新密碼長度至少需要 4 碼' });
      return;
    }

    try {
      const res = await resetAdminUserPassword(resetPassUser.id, newPasswordInput);
      setFeedback({ type: 'success', message: res.message || `帳號 [${resetPassUser.username}] 密碼已重設！` });
      setResetPassUser(null);
      setNewPasswordInput('');
      await loadUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || '重設密碼失敗' });
    }
  };

  // 處理刪除使用者
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    try {
      const res = await deleteAdminUser(deletingUser.id);
      setFeedback({ type: 'success', message: res.message || '已成功刪除使用者！' });
      setDeletingUser(null);
      await loadUsers();
      await refreshMembers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || '刪除失敗' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto select-none">
      <div className="w-full max-w-5xl bg-slate-900 border border-purple-800/60 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* 1. 頂部標題列 */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-lg shadow-purple-900/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  使用者數據與健康檔案管理中心
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  Admin Console
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>原生 SQLite 存儲 (`data/chronos_life.db`) · 具備全權限個人與家庭健康資產管理</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFeedback(null);
                loadUsers();
              }}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="重新載入"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsUserManagementOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="關閉視窗"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. 統計卡片與操作列 */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/30 flex flex-wrap items-center justify-between gap-3">
          {/* 總覽指標 */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700 text-slate-300 font-medium">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>總使用者：<strong className="text-white font-bold">{users.length}</strong> 位</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 font-medium">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
              <span>健康檔案連動率：<strong className="text-emerald-200 font-bold">100%</strong></span>
            </div>
          </div>

          {/* 搜尋與新增按鈕 */}
          <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋帳號、姓名、角色..."
                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-950 shrink-0 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>新增使用者</span>
            </button>
          </div>
        </div>

        {/* 狀態反饋提示 */}
        {feedback && (
          <div className={`mx-4 mt-3 p-3 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3. 使用者列表主體 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && users.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
              <span>正在讀取 SQLite 使用者與健康資料庫...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              查無符合條件的使用者
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredUsers.map((u) => {
                const isAdminAccount = u.username === 'admin' || u.role.includes('管理');
                return (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
                  >
                    {/* 卡片頂部：身分與角色 */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar_url || '/icon-192.png'}
                          alt={u.name}
                          className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white">{u.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              isAdminAccount
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : u.role === '本人'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {u.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                            <span>帳號: <strong className="text-slate-200">{u.username}</strong></span>
                            <span>·</span>
                            <span>{u.age || 35} 歲 ({u.gender === 'F' ? '女' : '男'})</span>
                          </div>
                        </div>
                      </div>

                      {/* 健康評分指標徽章 */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">健康指標分</span>
                        <span className="text-sm font-bold text-emerald-400 font-mono">
                          {u.health_score || 75} <span className="text-[10px] text-slate-500 font-normal">分</span>
                        </span>
                      </div>
                    </div>

                    {/* 卡片中部：臨床規劃與預防醫學 */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Stethoscope className="w-3 h-3 text-cyan-400" />
                          <span>預約回診：</span>
                        </span>
                        <span className="font-medium text-cyan-300">{u.next_clinic_department || '家醫科 / 預防醫學'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3 text-emerald-400" />
                          <span>預約日期：</span>
                        </span>
                        <span className="font-mono text-slate-200">{u.next_clinic_date || '2026-10-15'}</span>
                      </div>
                      {u.companion_notes && (
                        <p className="text-[10px] text-slate-400 truncate pt-1 border-t border-slate-800/60" title={u.companion_notes}>
                          註記: {u.companion_notes}
                        </p>
                      )}
                    </div>

                    {/* 卡片底部操作按鈕 */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                      <span className="text-[10px] text-slate-500 font-mono">
                        註冊於: {u.created_at ? new Date(u.created_at).toLocaleDateString() : '系統初始'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1 transition"
                          title="修改使用者資料"
                        >
                          <Edit3 className="w-3 h-3 text-cyan-400" />
                          <span>編輯</span>
                        </button>
                        <button
                          onClick={() => {
                            setResetPassUser(u);
                            setNewPasswordInput('');
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1 transition"
                          title="重設使用者密碼"
                        >
                          <KeyRound className="w-3 h-3 text-amber-400" />
                          <span>改密碼</span>
                        </button>
                        {!isAdminAccount && (
                          <button
                            onClick={() => setDeletingUser(u)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-[11px] flex items-center gap-1 transition"
                            title="刪除使用者帳號"
                          >
                            <Trash2 className="w-3 h-3 text-rose-400" />
                            <span>刪除</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. 底部資訊 */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>登入身分：<strong className="text-purple-300">{currentUser?.name}</strong> ({currentUser?.role})</span>
          <span>Chronos Life · 醫療特權模式</span>
        </div>

      </div>

      {/* ===================== 子彈窗 1: 管理者新增使用者 ===================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-slate-900 border border-purple-700 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-purple-400" />
                管理者新增使用者與健康檔案
              </span>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">使用者帳號 (Username)</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="例: chen_mary"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">真實姓名 (Full Name)</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="例: 陳美麗"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">身分角色</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white"
                  >
                    <option value="本人">本人</option>
                    <option value="配偶">配偶</option>
                    <option value="子女">子女</option>
                    <option value="父親">父親</option>
                    <option value="母親">母親</option>
                    <option value="照護者">照護者</option>
                    <option value="醫師 / 管理員">醫師 / 管理員</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">生理性別</label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setNewGender('M')}
                      className={`py-1.5 rounded-lg border text-center ${newGender === 'M' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'border-slate-800 text-slate-400'}`}
                    >
                      男
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewGender('F')}
                      className={`py-1.5 rounded-lg border text-center ${newGender === 'F' ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'border-slate-800 text-slate-400'}`}
                    >
                      女
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">年齡 (歲)</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">預設密碼</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">回診科別規劃</label>
                <input
                  type="text"
                  value={newClinicDept}
                  onChange={(e) => setNewClinicDept(e.target.value)}
                  placeholder="例: 家醫科 / 預防醫學"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">臨床備註 / 照護指引</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="例: 預約初診建立基礎健檢數據"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  建立使用者
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== 子彈窗 2: 管理者編輯使用者 ===================== */}
      {editingUser && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-slate-900 border border-cyan-700 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                編輯使用者資料：[{editingUser.username}]
              </span>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">真實姓名</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">身分角色</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white"
                  >
                    <option value="本人">本人</option>
                    <option value="配偶">配偶</option>
                    <option value="子女">子女</option>
                    <option value="父親">父親</option>
                    <option value="母親">母親</option>
                    <option value="照護者">照護者</option>
                    <option value="醫師 / 管理員">醫師 / 管理員</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">年齡 (歲)</label>
                  <input
                    type="number"
                    value={editAge}
                    onChange={(e) => setEditAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">性別</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white"
                  >
                    <option value="M">男</option>
                    <option value="F">女</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">健康評分</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editHealthScore}
                    onChange={(e) => setEditHealthScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">回診科別</label>
                <input
                  type="text"
                  value={editClinicDept}
                  onChange={(e) => setEditClinicDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">照護指導與備註</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  儲存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== 子彈窗 3: 管理者重設密碼 ===================== */}
      {resetPassUser && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-600 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-400" />
                重設密碼：[{resetPassUser.username}]
              </span>
              <button onClick={() => setResetPassUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
              <p className="text-slate-400 text-[11px]">
                請輸入此帳號的新安全密碼，儲存後使用者將以此新密碼登入系統。
              </p>
              <div>
                <label className="text-slate-300 block mb-1">新密碼 (4碼以上)</label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="輸入新密碼"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetPassUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  確認變更密碼
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== 子彈窗 4: 刪除確認 ===================== */}
      {deletingUser && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-600 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>確認刪除使用者？</span>
            </div>
            <p className="text-xs text-slate-300">
              您即將刪除帳號 <strong className="text-white font-bold">[{deletingUser.username}]</strong> ({deletingUser.name})。
              此動作將同時清除其對應的健康資產檔案與健檢紀錄。
            </p>
            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                確定刪除
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
