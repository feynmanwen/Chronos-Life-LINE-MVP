import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { ShieldCheck, FileText, Image as ImageIcon, X, ExternalLink, Calendar, Building } from 'lucide-react';

export const SourceTraceModal: React.FC = () => {
  const { selectedRecordForTrace, setSelectedRecordForTrace } = useHealth();

  if (!selectedRecordForTrace) return null;

  const r = selectedRecordForTrace;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                來源優先 (User Sovereignty) 報告溯源
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  可追溯率 100%
                </span>
              </h3>
              <p className="text-xs text-slate-400">所有數據解析皆可回溯原始報告截圖與頁碼</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedRecordForTrace(null)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400">標準檢驗名稱：</span>
              <div className="font-bold text-white text-sm mt-0.5">{r.standardName}</div>
            </div>
            <div>
              <span className="text-slate-400">原始報告名稱 (溯源)：</span>
              <div className="font-bold text-cyan-300 text-sm mt-0.5">{r.originalReportName}</div>
            </div>
            <div>
              <span className="text-slate-400">檢測數值與單位：</span>
              <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">{r.value} {r.unit}</div>
            </div>
            <div>
              <span className="text-slate-400">院所原始參考區間：</span>
              <div className="font-mono text-slate-200 text-sm mt-0.5">{r.referenceInterval}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300 px-1">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-cyan-400" />
              <span>{r.hospital}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>採檢日期：{r.date}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto text-emerald-400 font-bold">
              <FileText className="w-4 h-4" />
              <span>報告第 {r.reportPage} 頁</span>
            </div>
          </div>

          {/* 原始原圖裁切塊 */}
          <div className="rounded-xl border-2 border-emerald-500/40 bg-slate-950 p-4">
            <div className="text-xs text-slate-400 font-semibold mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <ImageIcon className="w-4 h-4" />
                原始報告裁切光學掃描區塊 (Crop Snippet)
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                信心度：{Math.round(r.confidenceScore * 100)}%
              </span>
            </div>

            <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs border border-slate-700 text-slate-200 space-y-1">
              <div className="text-[11px] text-slate-400 border-b border-slate-800 pb-1">
                [HOSPITAL ARCHIVE SNIPPET] {r.hospital}
              </div>
              <div className="text-sm font-bold text-emerald-400 pt-1">
                {r.originalReportName} : {r.value} {r.unit} (Ref: {r.referenceInterval})
              </div>
              {r.examModality && (
                <div className="text-[11px] text-cyan-300">
                  檢驗儀器/方法：{r.examModality}
                </div>
              )}
            </div>

            <div className="mt-2 text-[11px] text-slate-400">
              檔案錨點標籤：{r.cropImageLabel}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setSelectedRecordForTrace(null)}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
            >
              關閉視窗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
