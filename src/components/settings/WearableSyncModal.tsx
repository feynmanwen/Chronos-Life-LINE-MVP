import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { Watch, CheckCircle2, RefreshCw, X, Smartphone, Activity, Heart, Moon } from 'lucide-react';

export const WearableSyncModal: React.FC = () => {
  const { isWearableModalOpen, setIsWearableModalOpen, activeMember } = useHealth();
  const [selectedBrand, setSelectedBrand] = useState<'apple' | 'google' | 'garmin'>('apple');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  if (!isWearableModalOpen) return null;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 2500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                穿戴裝置即時同步
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PRD 8.1 餘命校正
                </span>
              </h3>
              <p className="text-xs text-slate-400">整合 Apple HealthKit / Google Fit / Garmin</p>
            </div>
          </div>
          <button
            onClick={() => setIsWearableModalOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 內容 */}
        <div className="p-5 space-y-4 text-xs">
          {/* 裝置選擇 */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => setSelectedBrand('apple')}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                selectedBrand === 'apple'
                  ? 'border-cyan-500 bg-cyan-950/40 text-white font-bold'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Smartphone className="w-5 h-5 text-slate-200" />
              <span>Apple HealthKit</span>
            </button>

            <button
              onClick={() => setSelectedBrand('google')}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                selectedBrand === 'google'
                  ? 'border-cyan-500 bg-cyan-950/40 text-white font-bold'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Google Fit</span>
            </button>

            <button
              onClick={() => setSelectedBrand('garmin')}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                selectedBrand === 'garmin'
                  ? 'border-cyan-500 bg-cyan-950/40 text-white font-bold'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Watch className="w-5 h-5 text-blue-400" />
              <span>Garmin Connect</span>
            </button>
          </div>

          {/* 當前同步遙測數據快照 */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3.5 space-y-2.5">
            <div className="font-bold text-slate-300">目前遙測數據（用於動態餘命模型）：</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">每日步數</span>
                <span className="text-sm font-bold text-white font-mono">{activeMember.dailySteps.toLocaleString()} 步</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">睡眠時長</span>
                <span className="text-sm font-bold text-indigo-300 font-mono">{activeMember.sleepHoursDaily} 小時</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">血氧 SpO2 / 靜息心率</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{activeMember.spo2}% / {activeMember.restingHeartRate}bpm</span>
              </div>
            </div>
          </div>

          {/* 同步狀態 */}
          {syncDone && (
            <div className="rounded-xl bg-emerald-950/50 border border-emerald-500/50 p-3 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>同步成功！已根據最新 24 小時作息數據校正餘命倒數時鐘。</span>
            </div>
          )}

          {/* 按鈕 */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? '正在同步數據中...' : '立即連線同步最新穿戴數據'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
