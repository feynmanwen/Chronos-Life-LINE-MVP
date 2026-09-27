import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Database, 
  Sparkles, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle,
  UserPlus,
  KeyRound,
  ArrowLeft,
  HeartPulse
} from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export const LoginView: React.FC = () => {
  const { login, loginLine, switchPresetUser, register, resetPassword, isLoading } = useAuth();
  
  // 模式切換：'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<AuthMode>('login');

  // 登入表單狀態
  const [username, setUsername] = useState('chen_wei');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  // 註冊表單狀態
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('本人');
  const [regAge, setRegAge] = useState(38);
  const [regGender, setRegGender] = useState<'M' | 'F'>('F');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // 忘記密碼表單狀態
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotPass, setShowForgotPass] = useState(false);

  // 訊息與狀態回饋
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const switchMode = (newMode: AuthMode) => {
    resetMessages();
    setMode(newMode);
  };

  // 1. 處理一般登入
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    try {
      await login(username, password);
    } catch (err: any) {
      setErrorMsg(err.message || '登入失敗，請檢查帳號密碼');
    }
  };

  // 2. 處理 LINE 快速登入
  const handleLineClick = async () => {
    resetMessages();
    try {
      await loginLine('陳偉 (本人)');
    } catch (err: any) {
      setErrorMsg(err.message || 'LINE 快速登入失敗');
    }
  };

  // 3. 處理新使用者註冊
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!regUsername.trim() || !regName.trim()) {
      setErrorMsg('請輸入使用者帳號與姓名');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMsg('安全密碼長度至少需要 4 碼');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('兩次密碼輸入不一致，請再次確認');
      return;
    }

    try {
      await register({
        username: regUsername.trim(),
        password: regPassword,
        name: regName.trim(),
        role: regRole,
        age: Number(regAge) || 35,
        gender: regGender,
      });
    } catch (err: any) {
      setErrorMsg(err.message || '註冊失敗，該帳號可能已被使用');
    }
  };

  // 4. 處理忘記密碼 / 重設密碼
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!forgotUsername.trim()) {
      setErrorMsg('請輸入欲重設的使用者帳號');
      return;
    }
    if (forgotNewPassword.length < 4) {
      setErrorMsg('新密碼長度至少需要 4 碼');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMsg('新密碼與確認密碼不一致');
      return;
    }

    try {
      const res = await resetPassword(forgotUsername.trim(), forgotNewPassword);
      setSuccessMsg(res.message || '密碼重設成功！請使用新密碼登入');
      setUsername(forgotUsername.trim());
      setPassword(forgotNewPassword);
    } catch (err: any) {
      setErrorMsg(err.message || '重設密碼失敗，查無此帳號或伺服器異常');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden select-none">
      {/* 科技光暈背景效果 */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      {/* 頂部身分宣告 */}
      <div className="w-full max-w-md flex items-center justify-between text-xs text-slate-400 py-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono">SQLite 後台就緒</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>MY SQL LITE 原生驅動</span>
        </div>
      </div>

      {/* 主登入/註冊卡片 */}
      <div className="w-full max-w-md my-auto space-y-4">
        {/* 品牌標誌與標題 */}
        <div className="text-center space-y-2">
          <div className="inline-block relative">
            <img
              src="/icon-192.png"
              alt="Chronos Life"
              className="w-16 h-16 rounded-2xl mx-auto shadow-2xl shadow-cyan-500/30 border-2 border-cyan-500/40 object-cover"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full shadow-md">
              <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {mode === 'login' && 'AI 健檢趨勢管家'}
                {mode === 'register' && '建立健康資產帳號'}
                {mode === 'forgot' && '重設安全密碼'}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                v13.0
              </span>
            </div>
            <p className="text-xs text-cyan-400 font-medium mt-0.5">Chronos Life · 個人健康資產管理系統</p>
          </div>
        </div>

        {/* 核心操作主面板 */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-4">
          
          {/* 錯誤通知 */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 成功通知 */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ===================== MODE 1: 一般登入 ===================== */}
          {mode === 'login' && (
            <>
              {/* LINE 一鍵快速登入 */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleLineClick}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-[#06c755] hover:bg-[#05b34c] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#06c755]/25 transition duration-150 disabled:opacity-60 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-[#06c755]" />
                  <span>LINE 一鍵快速登入</span>
                </button>
                <p className="text-[10px] text-center text-slate-400">
                  符合 LINE LIFF 生態 · 自動同步個人與家庭守護身分
                </p>
              </div>

              {/* 分隔線 */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider shrink-0">
                  或使用帳號密碼登入
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              {/* 帳號密碼表單 */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>使用者帳號</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="請輸入帳號 (例如: chen_wei)"
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>安全密碼</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline transition"
                    >
                      忘記密碼？
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="請輸入密碼"
                      className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white pr-10 focus:outline-none focus:border-cyan-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-cyan-950 transition duration-150 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>{isLoading ? '驗證連線中...' : '登入健康資產系統'}</span>
                </button>
              </form>

              {/* 註冊新帳號引導鈕 */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-xs text-slate-300 hover:text-cyan-300 flex items-center justify-center gap-1.5 mx-auto transition"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>還沒有健康資產帳號？<strong className="text-cyan-400 font-medium underline">立即新增註冊</strong></span>
                </button>
              </div>

              {/* 快速驗收快捷切換 */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-2 font-medium">
                  ⚡ 快速驗收快捷切換（免手動輸入）：
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => switchPresetUser('chen_wei')}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-200 font-semibold transition text-center truncate"
                    title="陳偉 (本人 / 42歲)"
                  >
                    👤 陳偉 (本人)
                  </button>
                  <button
                    type="button"
                    onClick={() => switchPresetUser('chen_guo_hua')}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-200 font-semibold transition text-center truncate"
                    title="陳國華 (父親 / 70歲)"
                  >
                    👴 陳國華 (父親)
                  </button>
                  <button
                    type="button"
                    onClick={() => switchPresetUser('admin')}
                    className="px-2 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800 text-[11px] text-cyan-200 font-semibold transition text-center truncate"
                    title="主治醫師 / 管理員"
                  >
                    🩺 李醫師 (管理)
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ===================== MODE 2: 新增使用者 (註冊) ===================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  建立個人健康檔案
                </span>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  返回登入
                </button>
              </div>

              {/* 帳號與姓名 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">帳號 (Username)</label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="例: chen_lin"
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">姓名 (Full Name)</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="例: 林美秀"
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* 角色與性別 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">家庭角色</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="本人">本人</option>
                    <option value="配偶">配偶</option>
                    <option value="子女">子女</option>
                    <option value="母親">母親</option>
                    <option value="父親">父親</option>
                    <option value="照護者">照護者</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">生理性別</label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setRegGender('M')}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition ${
                        regGender === 'M'
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400'
                      }`}
                    >
                      男 (M)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegGender('F')}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition ${
                        regGender === 'F'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400'
                      }`}
                    >
                      女 (F)
                    </button>
                  </div>
                </div>
              </div>

              {/* 年齡 */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">年齡 (歲)</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={regAge}
                  onChange={(e) => setRegAge(Number(e.target.value))}
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* 設定密碼 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">設定密碼 (4碼以上)</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="設定新密碼"
                      className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white pr-8 focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-200"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">再次確認密碼</label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="再次確認"
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-300/90 flex items-start gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 shrink-0 text-cyan-400 mt-0.5" />
                <span>註冊後將自動於 SQLite 後台建立您的長壽生命時鐘、3D器官地圖與預防醫學健康資產。</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-xs shadow-md transition duration-150 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4 text-emerald-200" />
                <span>{isLoading ? '正在寫入 SQLite...' : '建立健康資產帳號並登入'}</span>
              </button>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-white"
              >
                已有帳號？返回登入
              </button>
            </form>
          )}

          {/* ===================== MODE 3: 忘記密碼 / 重設密碼 ===================== */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  重設登入安全密碼
                </span>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  返回登入
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>欲重設的使用者帳號</span>
                </label>
                <input
                  type="text"
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  placeholder="請輸入註冊帳號 (例如: chen_wei)"
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>新密碼 (4碼以上)</span>
                </label>
                <div className="relative">
                  <input
                    type={showForgotPass ? 'text' : 'password'}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="請設定新安全密碼"
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white pr-10 focus:outline-none focus:border-cyan-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotPass(!showForgotPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">確認新密碼</label>
                <input
                  type={showForgotPass ? 'text' : 'password'}
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  placeholder="請再次輸入新密碼"
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.98] text-white font-bold text-sm shadow-md transition duration-150 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-cyan-200" />
                <span>{isLoading ? '更新中...' : '確認重設密碼'}</span>
              </button>

              {successMsg && (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-200 font-medium text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>立即以新密碼登入</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-white"
              >
                想起密碼了？返回登入
              </button>
            </form>
          )}

        </div>
      </div>

      {/* 底部法規與資料庫宣告 */}
      <footer className="w-full max-w-md text-center space-y-1.5 text-[11px] text-slate-500 pt-4">
        <div className="flex items-center justify-center gap-3 text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            台灣個資法規遵循
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            後台 SQLite 儲存
          </span>
          <span>·</span>
          <span>HIPAA Ready</span>
        </div>
        <p className="text-[10px] text-slate-600">
          © 2026 Chronos Life Health Technologies. 醫病溝通與健康資產管理平台
        </p>
      </footer>
    </div>
  );
};
