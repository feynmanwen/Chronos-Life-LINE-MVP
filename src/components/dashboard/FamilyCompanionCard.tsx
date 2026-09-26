import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { Calendar, Users, HeartHandshake, AlertCircle, FileText, ChevronRight } from 'lucide-react';

export const FamilyCompanionCard: React.FC = () => {
  const { members, activeMemberId, setActiveMemberId, setIsDoctorSummaryOpen } = useHealth();

  const calculateDaysRemaining = (targetDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              家庭共融與親情陪診
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                PRD 5.2 最多4位成員
              </span>
            </h3>
          </div>
        </div>
        <span className="text-xs text-slate-400">各成員獨立數據隔離存儲</span>
      </div>

      {/* 4 名成員切換與倒數卡片 */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {members.map(member => {
          const isCurrent = member.id === activeMemberId;
          const daysLeft = calculateDaysRemaining(member.nextClinicDate);
          const isUrgent = daysLeft <= 7 && daysLeft >= 0;

          return (
            <div
              key={member.id}
              onClick={() => setActiveMemberId(member.id)}
              className={`cursor-pointer rounded-xl p-3.5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                isCurrent
                  ? 'bg-slate-800/90 border-pink-500/70 shadow-lg shadow-pink-950/20 scale-[1.02]'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{member.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    member.role === '本人' ? 'bg-cyan-500/20 text-cyan-300' :
                    member.role === '父親' ? 'bg-blue-500/20 text-blue-300' :
                    member.role === '母親' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-pink-500/20 text-pink-300'
                  }`}>
                    {member.role} ({member.age}歲)
                  </span>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>門診：{member.nextClinicDepartment}</span>
                </div>

                {/* 倒數天數醒目標記 */}
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xs text-slate-400">陪診倒數：</span>
                  <span className={`text-xl font-black font-mono ${
                    isUrgent ? 'text-rose-400 animate-pulse' : 'text-pink-300'
                  }`}>
                    {daysLeft > 0 ? `${daysLeft} 天` : daysLeft === 0 ? '今日回診！' : '已過期'}
                  </span>
                </div>

                <p className="mt-2 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {member.companionNotes}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {isCurrent ? '● 當前檢視中' : '點擊切換檔案'}
                </span>
                {isCurrent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDoctorSummaryOpen(true);
                    }}
                    className="text-[10px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-0.5"
                  >
                    <span>醫病摘要</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
