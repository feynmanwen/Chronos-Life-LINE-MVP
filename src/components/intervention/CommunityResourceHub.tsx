import React, { useState } from 'react';
import { COMMUNITY_RESOURCES } from '../../data/communityResources';
import { MapPin, Phone, DollarSign, ShieldCheck, Dumbbell, Apple, Search, ExternalLink, Award } from 'lucide-react';

export const CommunityResourceHub: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'sports' | 'nutrition' | 'screening'>('all');

  const filtered = filterType === 'all' 
    ? COMMUNITY_RESOURCES 
    : COMMUNITY_RESOURCES.filter(r => r.type === filterType);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              社區健康資源模組 (Community Resources)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                PRD 6.2 建議落地
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              將生活改善建議轉化為具體可預約的在地運動據點、公費營養諮詢與防癌篩檢服務
            </p>
          </div>
        </div>

        {/* 篩選標籤 */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filterType === 'all' ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            全部資源
          </button>
          <button
            onClick={() => setFilterType('sports')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filterType === 'sports' ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            運動據點
          </button>
          <button
            onClick={() => setFilterType('nutrition')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filterType === 'nutrition' ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            營養諮詢
          </button>
          <button
            onClick={() => setFilterType('screening')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filterType === 'screening' ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            公費篩檢
          </button>
        </div>
      </div>

      {/* 資源卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map(res => (
          <div
            key={res.id}
            className="rounded-xl bg-slate-950/60 border border-slate-800/90 p-4 flex flex-col justify-between hover:border-teal-500/40 transition group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  res.type === 'sports' ? 'bg-emerald-500/20 text-emerald-300' :
                  res.type === 'nutrition' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {res.categoryLabel}
                </span>
                <span className="text-xs font-mono font-semibold text-teal-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {res.distance}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition">
                {res.name}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                {res.description}
              </p>

              {res.eligibilityNote && (
                <div className="rounded-lg bg-teal-950/40 border border-teal-500/30 p-2 text-xs text-teal-200 flex items-start gap-1.5">
                  <Award className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>公費資格提示：</strong>{res.eligibilityNote}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1 pt-1">
                {res.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="text-slate-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] truncate max-w-[200px]">{res.feeInfo}</span>
              </div>

              <a
                href={`tel:${res.phone}`}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition"
              >
                <Phone className="w-3 h-3 text-cyan-400" />
                <span>預約專線</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
