import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { LabRecordItem } from '../../types/health';
import { 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  Image as ImageIcon, 
  Save, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  X,
  ExternalLink
} from 'lucide-react';

export const AuditWorkbench: React.FC = () => {
  const { 
    activeRecords, 
    updateRecord, 
    isAuditWorkbenchOpen, 
    setIsAuditWorkbenchOpen,
    activeMember 
  } = useHealth();

  // 待核對項目優先
  const [selectedRecordId, setSelectedRecordId] = useState<string>(() => {
    const pending = activeRecords.find(r => r.isPendingAudit);
    return pending ? pending.id : activeRecords[0]?.id || '';
  });

  const selectedRecord = activeRecords.find(r => r.id === selectedRecordId) || activeRecords[0];

  // 編輯表單狀態
  const [formValue, setFormValue] = useState<string>('');
  const [formUnit, setFormUnit] = useState<string>('');
  const [formRefInterval, setFormRefInterval] = useState<string>('');
  const [formDate, setFormDate] = useState<string>('');

  React.useEffect(() => {
    if (selectedRecord) {
      setFormValue(String(selectedRecord.value));
      setFormUnit(selectedRecord.unit);
      setFormRefInterval(selectedRecord.referenceInterval);
      setFormDate(selectedRecord.date);
    }
  }, [selectedRecord]);

  if (!isAuditWorkbenchOpen) return null;

  const handleSaveAudit = () => {
    if (!selectedRecord) return;
    const num = parseFloat(formValue);
    updateRecord(selectedRecord.id, {
      value: isNaN(num) ? formValue : num,
      numericValue: isNaN(num) ? undefined : num,
      unit: formUnit,
      referenceInterval: formRefInterval,
      date: formDate,
      isPendingAudit: false, // 標記為已核對
      confidenceScore: 1.0, // 人工核對後信心度滿分
    });
    setIsAuditWorkbenchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* 工作台頂部欄 */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  醫療數據核對工作台 (Audit Workbench)
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PRD 3.2 醫療資訊學核心規範
                </span>
              </div>
              <p className="text-xs text-slate-400">
                對比「原圖裁切塊」與「AI 辨識結果」，落實參考區間金律與同義詞溯源
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuditWorkbenchOpen(false)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 雙欄主視圖 */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
          {/* 左欄：待核對與歷史清單 */}
          <div className="md:col-span-4 border-r border-slate-800 bg-slate-950/40 p-4 overflow-y-auto space-y-2">
            <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
              <span>受檢者：{activeMember.name}</span>
              <span>共 {activeRecords.length} 筆</span>
            </div>

            {activeRecords.map(r => {
              const isSelected = r.id === selectedRecordId;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRecordId(r.id)}
                  className={`cursor-pointer rounded-xl p-3 border transition text-left ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{r.standardName}</span>
                    {r.isPendingAudit ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
                        待核對
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5" />
                        已核對
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-baseline justify-between text-xs">
                    <span className="font-mono text-cyan-300 font-bold">{r.value} {r.unit}</span>
                    <span className="text-[11px] text-slate-400">{r.date}</span>
                  </div>

                  <div className="mt-1 text-[10px] text-slate-400 truncate">
                    原有名稱: {r.originalReportName}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 右欄：原圖裁切塊 vs 辨識結果 比對區 */}
          {selectedRecord && (
            <div className="md:col-span-8 p-5 space-y-5 overflow-y-auto">
              {/* 醫療資訊學金律提醒條 */}
              <div className="rounded-xl bg-amber-950/30 border border-amber-500/30 p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>參考區間金律 (Reference Interval Rule)：</strong>
                  嚴禁強行套用單一標準化正常值！必須保留原始院所報告之參考區間（{selectedRecord.hospital}：{selectedRecord.referenceInterval}），避免檢驗基線差異誤導臨床判斷。
                </div>
              </div>

              {/* 原圖裁切快照 (Crop Snippet) 模擬展示 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    原始報告圖檔裁切塊 (Source Crop Snippet - 溯源優先)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    報告第 {selectedRecord.reportPage} 頁・{selectedRecord.hospital}
                  </span>
                </div>

                {/* 擬真高對比掃描裁切圖模擬卡 */}
                <div className="relative rounded-xl border-2 border-dashed border-cyan-500/50 bg-slate-950 p-4 flex flex-col items-center justify-center text-center shadow-inner">
                  <div className="w-full bg-slate-900/90 rounded-lg p-3 font-mono text-left border border-slate-700 text-slate-200 text-xs sm:text-sm space-y-1">
                    <div className="text-[11px] text-slate-400 border-b border-slate-800 pb-1 flex justify-between">
                      <span>[檢驗原圖片段掃描] {selectedRecord.hospital} 臨床檢驗單</span>
                      <span className="text-cyan-400">PAGE {selectedRecord.reportPage}</span>
                    </div>
                    <div className="pt-1 text-sm font-semibold flex flex-wrap gap-x-4 gap-y-1 text-emerald-300">
                      <span>項目：{selectedRecord.originalReportName}</span>
                      <span>結果：<span className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-bold">{selectedRecord.value}</span></span>
                      <span>單位：{selectedRecord.unit}</span>
                      <span>參考值：{selectedRecord.referenceInterval}</span>
                    </div>
                    {selectedRecord.examModality && (
                      <div className="text-xs text-indigo-300 pt-1">
                        方法學/附註：{selectedRecord.examModality}
                      </div>
                    )}
                    {selectedRecord.auditNotes && (
                      <div className="text-xs text-rose-300/90 pt-1 font-sans">
                        ⚠️ 核對備註：{selectedRecord.auditNotes}
                      </div>
                    )}
                  </div>
                  <span className="mt-2 text-[10px] text-slate-500">
                    {selectedRecord.cropImageLabel} (來源可回溯率 100%)
                  </span>
                </div>
              </div>

              {/* 結構化欄位逐項核對與修正表單 */}
              <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    結構化解析結果核對 (逐欄比對)
                  </h4>
                  <span className="text-xs text-slate-400">
                    AI 信心度：
                    <strong className={selectedRecord.confidenceScore < 0.8 ? 'text-amber-400' : 'text-emerald-400'}>
                      {Math.round(selectedRecord.confidenceScore * 100)}%
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">標準名稱 (同義詞對照後)</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRecord.standardName}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-300 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">原始報告名稱 (溯源並列顯示)</label>
                    <input
                      type="text"
                      disabled
                      value={selectedRecord.originalReportName}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">檢測數值 (可手動校正)</label>
                    <input
                      type="text"
                      value={formValue}
                      onChange={(e) => setFormValue(e.target.value)}
                      className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg p-2 text-white font-bold font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">檢驗單位</label>
                    <input
                      type="text"
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">原始參考區間 (嚴禁擅改為統一度量)</label>
                    <input
                      type="text"
                      value={formRefInterval}
                      onChange={(e) => setFormRefInterval(e.target.value)}
                      className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">採檢日期</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* 儲存確認按鈕 */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsAuditWorkbenchOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveAudit}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-950 transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>確認無誤並完成核對 (解鎖臨床結論)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
