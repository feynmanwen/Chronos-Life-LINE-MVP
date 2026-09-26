import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { ALL_GOLDEN_CASES } from '../../data/goldenCases';
import { GoldenCaseId } from '../../types/health';
import { Sparkles, ArrowRight, ShieldAlert, Award } from 'lucide-react';

export const GoldenCaseSelector: React.FC = () => {
  const { loadGoldenCase, activeMemberId } = useHealth();

  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              PRD 9.2 匿名化黃金驗收情境 (Golden Cases)
            </h3>
            <p className="text-xs text-slate-400">點擊以下按鈕可一鍵載入特定驗收情境之臨床數據與演算法規則：</p>
          </div>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-1 md:grid-cols-3 gap-3">
        {ALL_GOLDEN_CASES.map(sc => {
          const isActive = 
            (sc.id === 'caseA' && activeMemberId === 'member-1') ||
            (sc.id === 'caseB' && activeMemberId === 'member-3') ||
            (sc.id === 'caseC' && activeMemberId === 'member-4');

          return (
            <div
              key={sc.id}
              onClick={() => loadGoldenCase(sc.id as GoldenCaseId)}
              className={`cursor-pointer rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-indigo-950/60 border-indigo-400 shadow-md shadow-indigo-950/40 scale-[1.01]'
                  : 'bg-slate-950/50 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">{sc.badge}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    isActive ? 'bg-indigo-500 text-white font-bold' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isActive ? '情境生效中' : '點擊載入'}
                  </span>
                </div>

                <h4 className="mt-1.5 text-xs font-bold text-white leading-snug">
                  {sc.title}
                </h4>

                <p className="mt-1.5 text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {sc.clinicalSummary}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-indigo-300/90 font-mono">
                {sc.informaticsPrinciple.slice(0, 36)}...
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
