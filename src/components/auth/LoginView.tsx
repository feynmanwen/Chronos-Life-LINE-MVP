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
  Stethoscope
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, loginLine, switchPresetUser, isLoading } = useAuth();
  const [username, setUsername] = useState('chen_wei');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await login(username, password);
    } catch (err: any) {
      setErrorMsg(err.message || '登入失敗，請檢查帳號密碼');
    }
  };

  const handleLineClick = async () => {
    setErrorMsg(null);
    try {
      await loginLine('陳偉 (本人)');
    } catch (err: any) {
      setErrorMsg(err.message || 'LINE 快速登入失敗');
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

      {/* 主登入卡片 */}
      <div className="w-full max-w-md my-auto space-y-6">
        {/* 品牌標誌與標題 */}
        <div className="text-center space-y-3">
          <div className="inline-block relative">
            <img
              src="/icon-192.png"
              alt="Chronos Life"
              className="w-20 h-20 rounded-2xl mx-auto shadow-2xl shadow-cyan-500/30 border-2 border-cyan-500/40 object-cover"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                AI 健檢趨勢管家
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                v13.0
              </span>
            </div>
            <p className="text-xs text-cyan-400 font-medium mt-0.5">Chronos Life · 個人健康資產管理系統</p>
            <p className="text-[11px] text-slate-400 mt-1">三環生命賦能 · 3D器官地圖 · 跨院報告對齊</p>
          </div>
        </div>

        {/* 登入主面板 */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. LINE 一鍵快速登入 (LINE LIFF 主流路徑) */}
          <div className="space-y-2">
            <button
              onClick={handleLineClick}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#06c755] hover:bg-[#05b34c] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#06c755]/25 transition duration-150 disabled:opacity-60 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white text-[#06c755]" />
              <span>LINE 一鍵快速登入</span>
            </button>
            <p className="text-[10px] text-center text-slate-400">
              符合 LINE LIFF 生態 · 自動同步 LINE 個人與家庭守護身分
            </p>
          </div>

          {/* 分隔線 */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider shrink-0">
              或使用帳號密碼登入
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          {/* 2. 帳號密碼表單 */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>使用者帳號</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="請輸入帳號"
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>安全密碼</span>
              </label>
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

          {/* 3. 快速展示驗收身分快捷鈕 */}
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
