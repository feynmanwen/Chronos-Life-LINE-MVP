import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { PhoneCall, Navigation, AlertTriangle, ShieldAlert, X } from 'lucide-react';

export const RedFlagAlertModal: React.FC = () => {
  const { redFlagModal, closeRedFlagModal } = useHealth();

  if (!redFlagModal.isOpen || !redFlagModal.interception) return null;

  const data = redFlagModal.interception;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-rose-950/95 backdrop-blur-xl overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-950 border-4 border-rose-600 shadow-[0_0_50px_rgba(225,29,72,0.8)] overflow-hidden flex flex-col p-6 sm:p-8 text-center animate-emergency">
        {/* 緊急圖標 */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/50 mb-4 animate-bounce">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* 標題與警告 */}
        <div className="inline-block mx-auto px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black tracking-wider uppercase mb-2">
          PRD 7.1 紅旗急症強制中斷機制
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight">
          【系統急症攔截】立即啟動緊急醫療救護！
        </h2>

        <div className="mt-3 bg-rose-950/60 border border-rose-600/50 rounded-2xl p-4 text-left text-xs sm:text-sm text-rose-100 leading-relaxed space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>命中急症關鍵字：{data.matchedKeywords.join('、')}</span>
          </div>
          <p>
            根據醫療安全防衛規範，系統已<strong>強制終止 AI 對話與所有生活型態干預運算</strong>。上述症狀極可能為急性心肌梗塞、急性腦中風、大量出血或急性呼吸衰竭等危及生命之急症，請勿耽誤！
          </p>
        </div>

        {/* 119 直接撥打按鈕 (巨型緊急通話鍵) */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href="tel:119"
            className="flex-1 py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-xl shadow-rose-600/50 transition hover:scale-105 active:scale-95"
          >
            <PhoneCall className="w-6 h-6 animate-pulse" />
            <span>立即撥打 119 緊急救護</span>
          </a>
        </div>

        {/* 鄰近急診室導航 */}
        <div className="mt-5 text-left">
          <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>鄰近醫院急診室聯絡與導航 (24小時急診中心)：</span>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {data.nearbyHospitals.map((hosp, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
              >
                <div>
                  <div className="font-bold text-white">{hosp.name}</div>
                  <div className="text-[11px] text-slate-400">{hosp.distance}</div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${hosp.phone}`}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>致電</span>
                  </a>
                  <a
                    href={hosp.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>GPS 導航</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 解除攔截按鈕 (需確認非誤觸) */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500 text-[11px]">生命安全優先，請確認安全後再解除</span>
          <button
            onClick={closeRedFlagModal}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            我已安全 / 關閉警訊視窗
          </button>
        </div>
      </div>
    </div>
  );
};
