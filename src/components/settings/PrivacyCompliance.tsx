import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { 
  ShieldCheck, 
  Download, 
  Trash2, 
  Lock, 
  AlertTriangle, 
  KeyRound, 
  CheckCircle,
  FileCheck
} from 'lucide-react';

export const PrivacyCompliance: React.FC = () => {
  const { 
    activeMember, 
    activeRecords, 
    exportCsv, 
    deleteRecord, 
    purgeAccount 
  } = useHealth();

  const [confirmPurge, setConfirmPurge] = useState(false);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              系統設定、隱私與合規架構
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PRD 8.1 / 8.2 數據主權
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              保障個人終身健康資產數據主權，符合最高醫療資安與個人資料保護規範
            </p>
          </div>
        </div>
      </div>

      {/* 資安標準徽章 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-white">TLS 1.3 傳輸加密</div>
            <div className="text-[10px] text-slate-400">連線全面採用最新前向保密協定</div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 flex items-center gap-2.5">
          <KeyRound className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <div className="font-bold text-white">AES-256 靜態加密</div>
            <div className="text-[10px] text-slate-400">健康資料庫採用國防級強加密算法</div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 flex items-center gap-2.5">
          <FileCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <div className="font-bold text-white">HIPAA / PDPA / GDPR</div>
            <div className="text-[10px] text-slate-400">完整遵從國際醫療與個資隱私框架</div>
          </div>
        </div>
      </div>

      {/* 數據主權：標準 CSV 格式匯出 */}
      <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>匯出個人終身健康資產 (標準 CSV 格式)</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            確保數據資產不隨單一平台更換而消失，含歷年數值、原始報告名稱、參考區間與生命事件。
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>立即匯出 CSV (含 BOM)</span>
        </button>
      </div>

      {/* 逐筆刪除權 (Right to Rectification / Deletion) */}
      <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-3">
        <div className="text-xs font-bold text-white flex items-center gap-1.5">
          <Trash2 className="w-4 h-4 text-slate-400" />
          <span>逐筆刪除權 (管理誤量測值或撤銷特定紀錄)</span>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
          {activeRecords.map(r => (
            <div
              key={r.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800"
            >
              <div>
                <span className="font-bold text-white">{r.standardName}</span>
                <span className="ml-2 font-mono text-cyan-300 font-semibold">{r.value} {r.unit}</span>
                <span className="ml-2 text-slate-500 text-[11px]">({r.date}・{r.hospital})</span>
              </div>

              <button
                onClick={() => deleteRecord(r.id)}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded bg-rose-950/40 border border-rose-500/30 transition"
              >
                刪除此筆
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 被遺忘權 (Right to be Forgotten)：一鍵完全刪除帳號 */}
      <div className="rounded-xl bg-rose-950/20 border border-rose-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>一鍵完全刪除檔案 (被遺忘權 Right to be Forgotten)</span>
          </div>
          <p className="text-xs text-rose-200/80 mt-0.5">
            永久銷毀當前成員 ({activeMember.name}) 的所有健檢紀錄、生命事件、任務與個人模型。
          </p>
        </div>

        {!confirmPurge ? (
          <button
            onClick={() => setConfirmPurge(true)}
            className="px-4 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-500/40 text-xs font-bold transition whitespace-nowrap"
          >
            申請註銷帳號
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                purgeAccount(activeMember.id);
                setConfirmPurge(false);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
            >
              確定永久抹除
            </button>
            <button
              onClick={() => setConfirmPurge(false)}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
            >
              取消
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
