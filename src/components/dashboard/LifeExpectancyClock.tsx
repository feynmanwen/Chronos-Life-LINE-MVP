import React, { useState, useEffect } from 'react';
import { useHealth } from '../../context/HealthContext';
import { Clock, ShieldCheck, Heart, Sparkles, TrendingUp } from 'lucide-react';

export const LifeExpectancyClock: React.FC = () => {
  const { activeMember } = useHealth();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // 計算預估剩餘總秒數 (基準年 + 良好習慣動態獎勵年)
  useEffect(() => {
    const totalYears = activeMember.baseLifeExpectancyYears + activeMember.dynamicBonusYears;
    const initialSeconds = Math.floor(totalYears * 365.25 * 24 * 3600);
    setSecondsRemaining(initialSeconds);
  }, [activeMember.baseLifeExpectancyYears, activeMember.dynamicBonusYears]);

  // 秒級動態時鐘：生活習慣優良時，時鐘倒數時速自動調慢 (每 1.4 秒才減 1 秒，代表為生命延展時間)
  useEffect(() => {
    const isHealthy = activeMember.healthScore >= 75;
    const intervalMs = isHealthy ? 1400 : 1000;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [activeMember.healthScore]);

  // 換算為 年、天、時、分、秒
  const years = Math.floor(secondsRemaining / (365.25 * 24 * 3600));
  const remainingAfterYears = secondsRemaining % Math.floor(365.25 * 24 * 3600);
  const days = Math.floor(remainingAfterYears / (24 * 3600));
  const remainingAfterDays = remainingAfterYears % (24 * 3600);
  const hours = Math.floor(remainingAfterDays / 3600);
  const remainingAfterHours = remainingAfterDays % 3600;
  const minutes = Math.floor(remainingAfterHours / 60);
  const seconds = remainingAfterHours % 60;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 p-4 sm:p-5 shadow-xl shadow-emerald-950/30">
      {/* 背景光暈效果 */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                秒級餘命倒數時鐘
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                PRD v13.0 生命反饋
              </span>
            </div>
            <p className="text-xs text-slate-400">
              預估剩餘生物年限（根據 500 萬華人大數據與生活作息即時校正）
            </p>
          </div>
        </div>

        {/* 獎勵延展壽命標章 */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>健康習慣已延展 <strong>+{activeMember.dynamicBonusYears} 年</strong></span>
        </div>
      </div>

      {/* 倒數時鐘核心顯示 */}
      <div className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-3 text-center">
        <div className="bg-slate-950/70 border border-emerald-500/20 rounded-xl p-2 sm:p-3">
          <div className="text-xl sm:text-3xl font-black text-emerald-400 tracking-tight font-mono">
            {years}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">年</div>
        </div>
        <div className="bg-slate-950/70 border border-emerald-500/20 rounded-xl p-2 sm:p-3">
          <div className="text-xl sm:text-3xl font-black text-emerald-300 tracking-tight font-mono">
            {days}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">天</div>
        </div>
        <div className="bg-slate-950/70 border border-emerald-500/20 rounded-xl p-2 sm:p-3">
          <div className="text-xl sm:text-3xl font-black text-emerald-200 tracking-tight font-mono">
            {String(hours).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">時</div>
        </div>
        <div className="bg-slate-950/70 border border-emerald-500/20 rounded-xl p-2 sm:p-3">
          <div className="text-xl sm:text-3xl font-black text-emerald-100 tracking-tight font-mono">
            {String(minutes).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">分</div>
        </div>
        <div className="bg-slate-950/70 border border-emerald-500/40 rounded-xl p-2 sm:p-3 shadow-inner shadow-emerald-500/10">
          <div className="text-xl sm:text-3xl font-black text-emerald-400 tracking-tight font-mono animate-pulse">
            {String(seconds).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-emerald-300 font-medium mt-0.5">秒</div>
        </div>
      </div>

      {/* 底部動態時速說明 */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between text-xs text-slate-400 bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/80">
        <div className="flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span>健康狀態分：<strong className="text-white">{activeMember.healthScore} 分</strong></span>
          <span className="text-slate-600">|</span>
          <span>今日步數：<strong className="text-white">{activeMember.dailySteps.toLocaleString()} 步</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] mt-1 sm:mt-0 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>時鐘時速：每 1.4 秒流逝 1 秒（維持減速延壽狀態）</span>
        </div>
      </div>
    </div>
  );
};
