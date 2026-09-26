import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { LabRecordItem } from '../../types/health';
import { TrendingUp, AlertCircle, Sparkles, ShieldCheck, ChevronRight, Bookmark } from 'lucide-react';

export const TrendChartModal: React.FC = () => {
  const { activeRecords, activeEvents, setSelectedRecordForTrace, activeMember } = useHealth();

  // 取得受檢者目前有資料的所有指標 code 清單
  const availableCodes = Array.from(new Set(activeRecords.map(r => r.code)));
  const [selectedCode, setSelectedCode] = useState<string>(() => availableCodes[0] || 'ALT');

  // 依時間排序所選指標的歷年紀錄
  const filtered = activeRecords
    .filter(r => r.code === selectedCode)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const currentItem = filtered[filtered.length - 1] || activeRecords[0];

  if (!currentItem) {
    return (
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 text-center text-xs text-slate-400">
        目前無檢驗紀錄
      </div>
    );
  }

  // 數值折線圖座標換算 (SVG 向量渲染)
  const chartWidth = 520;
  const chartHeight = 180;
  const padding = 40;

  const numericVals = filtered.map(f => typeof f.value === 'number' ? f.value : (f.numericValue ?? 0));
  const minVal = Math.min(...numericVals, 0);
  const maxVal = Math.max(...numericVals, 100);
  const range = maxVal - minVal || 1;

  const points = filtered.map((f, idx) => {
    const val = typeof f.value === 'number' ? f.value : (f.numericValue ?? 0);
    const x = padding + (idx / Math.max(filtered.length - 1, 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - ((val - minVal) / range) * (chartHeight - padding * 2);
    return { x, y, record: f, val };
  });

  const pathD = points.length > 1 
    ? points.reduce((acc, curr, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`, '')
    : `M ${points[0]?.x || 0} ${points[0]?.y || 0}`;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              歷年指標趨勢圖與單次波動判別
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PRD 1.2 趨勢感知
              </span>
            </h3>
            <p className="text-xs text-slate-400">點擊圖中任一數據點，立即連回原始健檢報告裁切圖 (來源優先)</p>
          </div>
        </div>

        {/* 指標切換選單 */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {availableCodes.map(code => {
            const item = activeRecords.find(r => r.code === code);
            const isSel = selectedCode === code;
            return (
              <button
                key={code}
                onClick={() => setSelectedCode(code)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  isSel 
                    ? 'bg-cyan-500 text-slate-950 shadow-md' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {item?.standardName || code}
              </button>
            );
          })}
        </div>
      </div>

      {/* 核心資訊條 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <div>
          <span className="text-slate-400">當前追蹤項目</span>
          <div className="font-bold text-white mt-0.5">{currentItem.standardName}</div>
        </div>
        <div>
          <span className="text-slate-400">原著名稱 (溯源)</span>
          <div className="font-bold text-cyan-300 mt-0.5">{currentItem.originalReportName}</div>
        </div>
        <div>
          <span className="text-slate-400">最新檢驗值</span>
          <div className="font-mono font-bold text-emerald-400 mt-0.5">{currentItem.value} {currentItem.unit}</div>
        </div>
        <div>
          <span className="text-slate-400">原始參考區間</span>
          <div className="font-mono text-slate-200 mt-0.5">{currentItem.referenceInterval}</div>
        </div>
      </div>

      {/* SVG 趨勢折線圖 */}
      <div className="relative bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 overflow-x-auto">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-[200px] select-none"
        >
          {/* 背景參考網格線 */}
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#334155" strokeDasharray="3 3" />
          <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#334155" strokeDasharray="3 3" />

          {/* 趨勢折線 */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 數據點交互 */}
          {points.map((pt, i) => {
            const isAbn = pt.record.isAbnormal;
            return (
              <g 
                key={i} 
                className="cursor-pointer group"
                onClick={() => setSelectedRecordForTrace(pt.record)}
              >
                {/* 互動觸發圓圈 */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="7"
                  fill={isAbn ? '#ef4444' : '#10b981'}
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  className="transition group-hover:scale-125"
                />

                {/* 數值標註 */}
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {pt.record.value} {pt.record.unit}
                </text>

                {/* 日期標籤 */}
                <text
                  x={pt.x}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {pt.record.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 提示訊息 */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-2">
          <span>區分「單次波動」與「長期偏離」：連年上揚即觸發預警，非單次偶發誤差</span>
          <span className="text-cyan-400 font-bold">點擊圓點即可回溯原圖 ↗</span>
        </div>
      </div>
    </div>
  );
};
