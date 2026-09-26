import React, { useState, useEffect } from 'react';
import { useHealth } from '../../context/HealthContext';
import { RichMenu } from './RichMenu';
import { isNativeApp } from '../../utils/device';
import { Wifi, Battery, ChevronLeft, MoreVertical, X, ShieldCheck } from 'lucide-react';

interface LineLiffContainerProps {
  children: React.ReactNode;
}

export const LineLiffContainer: React.FC<LineLiffContainerProps> = ({ children }) => {
  const { viewMode } = useHealth();
  const [isNarrowScreen, setIsNarrowScreen] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsNarrowScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. 平板 / 桌面寬螢幕模式 (Android Tablet 或 電腦檢視)
  if (viewMode === 'desktop') {
    return (
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        {children}
        {/* 在平板/桌面模式底部依然提供快捷六宮格選單 */}
        <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900/60 backdrop-blur-md">
          <RichMenu />
        </div>
      </main>
    );
  }

  // 2. 原生 Android 手機環境 或 實體窄螢幕裝置：採用原生沉浸滿版，移除假的外框與瀏海
  const isNativeOrSmallScreen = isNativeApp() || isNarrowScreen;

  if (isNativeOrSmallScreen) {
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col min-h-[calc(100vh-130px)] bg-slate-950 pb-2">
        {/* Android 原生行動端狀態與識別標題 */}
        <div className="bg-slate-900/90 backdrop-blur-sm text-white px-4 py-2 flex items-center justify-between border-b border-slate-800/80 sticky top-14 z-30 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06c755] animate-pulse" />
            <span className="text-xs font-bold text-slate-200">Chronos Life (行動守護)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI 即時守護中</span>
          </div>
        </div>

        {/* 內容滑動區域 */}
        <div className="flex-1 p-3 space-y-4">
          {children}
        </div>

        {/* 底部固定六宮格圖文選單 */}
        <div className="sticky bottom-0 z-30 shrink-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 shadow-2xl pt-1">
          <RichMenu />
        </div>
      </div>
    );
  }

  // 3. 電腦大螢幕下的手機模擬預覽框 (Desktop Browser 測試專用)
  return (
    <div className="py-6 flex justify-center items-start min-h-[calc(100vh-80px)] px-2">
      <div className="w-full max-w-[420px] bg-slate-950 rounded-[40px] border-4 border-slate-700 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col h-[840px] relative">
        {/* 手機頂部狀態列 */}
        <div className="bg-slate-950 px-6 pt-3 pb-1 flex items-center justify-between text-white text-xs select-none">
          <span className="font-semibold font-mono">09:41</span>
          <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto" />
          <div className="flex items-center gap-1.5 text-slate-300">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* LINE 導航頂欄 (LIFF 模擬) */}
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

        {/* 底部 Home Bar 指示條 */}
        <div className="bg-slate-950 py-1.5 flex justify-center select-none">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};

