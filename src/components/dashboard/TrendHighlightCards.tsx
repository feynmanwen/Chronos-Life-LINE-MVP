import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { LabRecordItem, TrendDirection } from '../../types/health';
import { AlertCircle, AlertTriangle, CheckCircle2, ArrowUpRight, FileText, Dumbbell, ShieldCheck, ChevronRight } from 'lucide-react';

export const TrendHighlightCards: React.FC = () => {
  const { 
    activeRecords, 
    setIsDoctorSummaryOpen, 
    setActiveTab, 
    setSelectedRecordForTrace, 
    activeEvents 
  } = useHealth();

  // 依據 PRD 4.2 優先級排序
  const getPriorityScore = (trend: TrendDirection): number => {
    switch (trend) {
      case 'abnormal_worsening': return 1; // 最高優先
      case 'normal_worsening': return 2;   // 次高優先
      case 'abnormal_improving': return 3; // 激勵回饋
      default: return 4;
    }
  };

  // 取得最新非重複項目的記錄
  const uniqueCodeRecords: LabRecordItem[] = [];
  const seenCodes = new Set<string>();

  // 依時間由新到舊
  const sorted = [...activeRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  for (const r of sorted) {
    if (!seenCodes.has(r.code)) {
      seenCodes.add(r.code);
      uniqueCodeRecords.push(r);
    }
  }

  // 排序：優先級 1 -> 2 -> 3
  const highlighted = uniqueCodeRecords.sort((a, b) => getPriorityScore(a.trendClassification) - getPriorityScore(b.trendClassification));

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              主動策略趨勢亮點卡
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRD 4.2 優先級排序
              </span>
            </h3>
          </div>
        </div>
        <span className="text-xs text-slate-400">已監控 {highlighted.length} 項指標</span>
      </div>

      <div className="mt-4 space-y-3">
        {highlighted.map(record => {
          const trend = record.trendClassification;
          
          if (trend === 'abnormal_worsening') {
            return (
              <div 
                key={record.id}
                className="relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/40 p-3.5 transition hover:border-rose-500/70"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0 mt-0.5">
                      <AlertCircle className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          優先級 1：異常且持續惡化
                        </span>
                        <h4 className="text-sm font-bold text-white">{record.standardName}</h4>
                        <span className="text-[11px] text-slate-400">({record.originalReportName})</span>
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-lg font-black text-rose-400 font-mono">{record.value} {record.unit}</span>
                        <span className="text-xs text-slate-400">參考區間: {record.referenceInterval}</span>
                      </div>
                      <p className="mt-1 text-xs text-rose-200/90 leading-relaxed">
                        【高危險警訊】連年指標惡化，已達專科處置評估閾值。系統強烈建議於回診時主動出示趨勢報告。
                      </p>
                    </div>
                  </div>

                  {/* 行動按鈕：引導至就醫溝通摘要 */}
                  <div className="shrink-0 flex flex-col gap-1.5 items-end">
                    <button
                      onClick={() => setIsDoctorSummaryOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 shadow-lg shadow-rose-950 transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>產生就醫摘要</span>
                    </button>
                    <button
                      onClick={() => setSelectedRecordForTrace(record)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                    >
                      檢視報告切片
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          if (trend === 'normal_worsening') {
            return (
              <div 
                key={record.id}
                className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/40 p-3.5 transition hover:border-amber-500/70"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          優先級 2：正常但持續惡化
                        </span>
                        <h4 className="text-sm font-bold text-white">{record.standardName}</h4>
                        <span className="text-[11px] text-slate-400">({record.originalReportName})</span>
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-lg font-black text-amber-400 font-mono">{record.value} {record.unit}</span>
                        <span className="text-xs text-slate-400">參考區間: {record.referenceInterval}</span>
                      </div>
                      <p className="mt-1 text-xs text-amber-200/90 leading-relaxed">
                        【早期預警】數值尚在正常安全區間內，但近三年斜率顯著上揚，提示早期亞健康進行中，及早調整習慣可逆轉。
                      </p>
                    </div>
                  </div>

                  {/* 行動按鈕：觸發生活型態任務 */}
                  <div className="shrink-0 flex flex-col gap-1.5 items-end">
                    <button
                      onClick={() => setActiveTab('fittvp')}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 shadow-lg shadow-amber-950 transition"
                    >
                      <Dumbbell className="w-3.5 h-3.5" />
                      <span>啟用微習慣計畫</span>
                    </button>
                    <button
                      onClick={() => setSelectedRecordForTrace(record)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                    >
                      檢視報告切片
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          if (trend === 'abnormal_improving') {
            return (
              <div 
                key={record.id}
                className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/40 p-3.5 transition hover:border-emerald-500/70"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          優先級 3：異常但已改善
                        </span>
                        <h4 className="text-sm font-bold text-white">{record.standardName}</h4>
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-lg font-black text-emerald-400 font-mono">{record.value} {record.unit}</span>
                        <span className="text-xs text-slate-400">參考區間: {record.referenceInterval}</span>
                      </div>
                      <p className="mt-1 text-xs text-emerald-200/90 leading-relaxed">
                        【激勵回饋】您的健康資產已升值！干預計畫成效顯著，細胞發炎指標已顯著回落。
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col gap-1.5 items-end">
                    <div className="px-3 py-1 rounded-lg bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>資產增值 +5%</span>
                    </div>
                    <button
                      onClick={() => setSelectedRecordForTrace(record)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                    >
                      檢視報告切片
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
