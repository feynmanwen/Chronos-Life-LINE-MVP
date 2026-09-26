import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { FittVpTask } from '../../types/health';
import { Dumbbell, CheckCircle2, Flame, AlertOctagon, Sparkles, TrendingUp, Calendar } from 'lucide-react';

export const FittVpPlanCard: React.FC = () => {
  const { activeTasks, toggleTaskCheckin, activeMember } = useHealth();

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              FITT-VP 個人化 30 天微習慣干預計畫
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PRD 6.1 國際運動醫學標準
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              將冰冷檢驗指標轉化為具備劑量概念的日常行動任務（目標完成率 &gt;= 50%）
            </p>
          </div>
        </div>
      </div>

      {activeTasks.length === 0 ? (
        <div className="text-xs text-slate-400 text-center py-6">
          目前無進行中之 FITT-VP 任務。在儀表板趨勢卡片點擊「啟用微習慣」即可產出。
        </div>
      ) : (
        <div className="space-y-4">
          {activeTasks.map(task => {
            const progressPercent = Math.min(100, Math.round((task.streakDays / task.totalTargetDays) * 100));

            return (
              <div
                key={task.id}
                className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 space-y-3.5"
              >
                {/* 任務頂部標題與打卡按鈕 */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        目標指標: {task.relatedMetric}
                      </span>
                      <h4 className="text-sm font-bold text-white">{task.title}</h4>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Flame className="w-3.5 h-3.5" />
                        <span>已連續打卡 <strong>{task.streakDays} 天</strong></span>
                      </span>
                      <span>/ 目標 {task.totalTargetDays} 天</span>
                      <span>(完成率 {progressPercent}%)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleTaskCheckin(task.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg ${
                      task.isCompletedToday
                        ? 'bg-emerald-600 text-white shadow-emerald-950/40'
                        : 'bg-slate-800 hover:bg-emerald-600/80 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${task.isCompletedToday ? 'text-white' : 'text-emerald-400'}`} />
                    <span>{task.isCompletedToday ? '今日已打卡 ✓' : '今日打卡簽到'}</span>
                  </button>
                </div>

                {/* 30 天進度條 */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* FITT-VP 六維度解析表格 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block font-mono">F (Frequency 頻率)</span>
                    <span className="font-semibold text-slate-200">{task.f_frequency}</span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block font-mono">I (Intensity 強度)</span>
                    <span className="font-semibold text-slate-200">{task.i_intensity}</span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block font-mono">T (Time 時間)</span>
                    <span className="font-semibold text-slate-200">{task.t_time}</span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block font-mono">T (Type 類型)</span>
                    <span className="font-semibold text-slate-200">{task.t_type}</span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block font-mono">V (Volume 累積總量)</span>
                    <span className="font-semibold text-slate-200">{task.v_volume}</span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block font-mono">P (Progression 進階)</span>
                    <span className="font-semibold text-slate-200">{task.p_progression}</span>
                  </div>
                </div>

                {/* 跌倒/安全限制說明 (PRD Golden Case B 強制規範) */}
                {task.restrictionWarning && (
                  <div className="rounded-lg bg-rose-950/40 border border-rose-500/40 p-2.5 text-xs text-rose-200 flex items-start gap-2">
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed font-medium">
                      {task.restrictionWarning}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
