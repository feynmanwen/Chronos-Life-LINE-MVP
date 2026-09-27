import React from 'react';
import { useHealth, ViewMode } from '../../context/HealthContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Smartphone, 
  Tablet,
  Monitor, 
  Users, 
  Upload, 
  FileSearch, 
  FileText, 
  Watch, 
  ShieldAlert,
  ShieldCheck,
  Heart,
  Sparkles,
  LogOut,
  Database
} from 'lucide-react';

export const DesktopHeader: React.FC = () => {
  const { 
    viewMode, 
    setViewMode, 
    members, 
    activeMemberId, 
    setActiveMemberId,
    setIsIngestionModalOpen,
    setIsAuditWorkbenchOpen,
    setIsDoctorSummaryOpen,
    setIsWearableModalOpen,
    setIsUserManagementOpen,
    activeMember
  } = useHealth();
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* 左側：品牌識別 */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <img
            src="/icon-192.png"
            alt="Chronos Life"
            className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-cyan-500/25 border border-cyan-500/30 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                AI 健檢趨勢管家 <span className="text-cyan-400 font-normal text-xs sm:text-sm">(Chronos Life)</span>
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                Android / 平板 / LINE MVP v13.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">個人健康資產管理與行為改變閉環系統 · 支援 Android 手機與平板</p>
          </div>
        </div>

        {/* 中間：家庭成員切換器 */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs self-stretch md:self-auto overflow-x-auto">
          <Users className="w-3.5 h-3.5 text-slate-500 ml-1.5 shrink-0" />
          {members.map(m => {
            const isSel = m.id === activeMemberId;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMemberId(m.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                  isSel
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.name.split(' ')[0]} ({m.role})
              </button>
            );
          })}
        </div>

        {/* 右側：動作按鈕與模態切換 */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* 管理者專用：使用者資料管理中心入口 */}
          {isAdmin && (
            <button
              onClick={() => setIsUserManagementOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-950 transition cursor-pointer"
              title="管理目前所有使用者的資料"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>使用者管理</span>
            </button>
          )}

          {/* 四源匯入 */}
          <button
            onClick={() => setIsIngestionModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">四源匯入</span>
          </button>

          {/* 核對工作台 */}
          <button
            onClick={() => setIsAuditWorkbenchOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-950 transition"
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">核對工作台</span>
          </button>

          {/* 醫病溝通摘要 */}
          <button
            onClick={() => setIsDoctorSummaryOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">醫病摘要</span>
          </button>

          {/* 穿戴同步 */}
          <button
            onClick={() => setIsWearableModalOpen(true)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="穿戴裝置同步"
          >
            <Watch className="w-4 h-4" />
          </button>

          {/* 視窗模式切換 (手機行動模式 vs 平板/電腦寬螢幕) */}
          <div className="ml-1 pl-2 border-l border-slate-800 flex items-center gap-1 bg-slate-900 p-1 rounded-xl border">
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs ${
                viewMode === 'mobile'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="手機行動版模式"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden xl:inline text-[11px]">手機</span>
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs ${
                viewMode === 'desktop'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="平板 / 寬螢幕工作台模式"
            >
              <Tablet className="w-4 h-4" />
              <span className="hidden xl:inline text-[11px]">平板/桌面</span>
            </button>
          </div>

          {/* 目前登入者身分與登出按鈕 */}
          <div className="ml-1 pl-2 border-l border-slate-800 flex items-center gap-2">
            <div className="hidden lg:flex flex-col text-right leading-tight">
              <span className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {user?.name || '陳偉 (本人)'}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {user?.role || '本人'} · SQLite
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/70 hover:text-rose-300 text-slate-400 border border-slate-800 hover:border-rose-800/60 transition cursor-pointer"
              title="登出帳號並返回登入介面"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
