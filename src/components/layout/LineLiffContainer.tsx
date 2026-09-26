import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { RichMenu } from './RichMenu';
import { Wifi, Battery, ChevronLeft, MoreVertical, X } from 'lucide-react';

interface LineLiffContainerProps {
  children: React.ReactNode;
}

export const LineLiffContainer: React.FC<LineLiffContainerProps> = ({ children }) => {
  const { viewMode, activeTab } = useHealth();

  if (viewMode === 'desktop') {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {children}
        {/* 在桌面模式底部依然提供快捷宮格選單 */}
        <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
          <RichMenu />
        </div>
      </main>
    );
  }

  // 手機 LINE LIFF 擬真視窗模式 (390px iPhone Viewport Frame)
  return (
    <div className="py-6 flex justify-center items-start min-h-[calc(100vh-80px)] px-2">
      <div className="w-full max-w-[420px] bg-slate-950 rounded-[40px] border-4 border-slate-700 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col h-[840px] relative">
        {/* 手機頂部瀏海與狀態列 */}
        <div className="bg-slate-950 px-6 pt-3 pb-1 flex items-center justify-between text-white text-xs select-none">
          <span className="font-semibold font-mono">09:41</span>
          <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto" />
          <div className="flex items-center gap-1.5 text-slate-300">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* LINE 導航頂欄 (LINE LIFF Webview Header) */}
        <div className="bg-[#1f2937] text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 select-none">
          <div className="flex items-center gap-2">
            <button className="text-slate-300 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="leading-tight">
              <div className="text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#06c755]" />
                <span>Chronos Life (LIFF)</span>
              </div>
              <span className="text-[9px] text-slate-400">liff.line.me/chronos-v13</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <button className="hover:text-white">
              <MoreVertical className="w-4 h-4" />
            </button>
            <button className="hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LIFF 內容捲動區域 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-slate-950/80">
          {children}
        </div>

        {/* LINE 底部固定六宮格圖文選單 (Rich Menu) */}
        <div className="shrink-0">
          <RichMenu />
        </div>

        {/* 底部 iPhone Home Bar 指示條 */}
        <div className="bg-slate-950 py-1.5 flex justify-center select-none">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
