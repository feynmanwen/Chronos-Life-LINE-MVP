import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { 
  Camera, 
  MessageSquare, 
  FileSpreadsheet, 
  FileCode, 
  Sparkles, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  RefreshCw,
  Layers
} from 'lucide-react';

export const IngestionModal: React.FC = () => {
  const { 
    isIngestionModalOpen, 
    setIsIngestionModalOpen, 
    addRecord, 
    activeMember, 
    setIsAuditWorkbenchOpen 
  } = useHealth();

  const [activeSource, setActiveSource] = useState<'ocr' | 'nlp' | 'nhi' | 'pdf'>('ocr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [blurDetected, setBlurDetected] = useState(false);

  // NLP 輸入內容
  const [nlpInput, setNlpInput] = useState('早晨空腹血糖測量 106 mg/dL，另外昨晚睡眠約 6.5 小時');

  if (!isIngestionModalOpen) return null;

  // 1. 照片 OCR 解析流程 (含模糊/反光檢測攔截)
  const handleSimulateOcr = (withBlur = false) => {
    setIsProcessing(true);
    setBlurDetected(false);
    setProcessStep('正在進行光學檢驗與模糊/反光度分析...');

    setTimeout(() => {
      if (withBlur) {
        setIsProcessing(false);
        setBlurDetected(true);
        setProcessStep('【PRD 3.1 攔截】偵測到照片局部反光嚴重且文字邊緣模糊，已暫停解析以防數據失真。');
        return;
      }

      setProcessStep('正在提取檢驗項目、數值、單位及原始參考區間...');
      setTimeout(() => {
        setIsProcessing(false);
        // 新增一筆待核對資料
        addRecord({
          memberId: activeMember.id,
          date: new Date().toISOString().split('T')[0],
          hospital: '台大醫院健檢中心 (最新拍照上傳)',
          system: 'liver',
          code: 'ALT',
          standardName: '丙胺酸轉胺酶 (ALT)',
          originalReportName: 'GPT (ALT)',
          value: 68,
          numericValue: 68,
          unit: 'U/L',
          referenceInterval: '0 - 41',
          isAbnormal: true,
          trendClassification: 'abnormal_worsening',
          isPendingAudit: true, // 標記為待核對
          confidenceScore: 0.74,
          reportPage: 1,
          cropImageLabel: '手機拍照上傳切片：GPT (ALT) 68 U/L',
          auditNotes: '拍照字跡已識別，請在核對工作台進行雙欄確認。',
        });
        setIsIngestionModalOpen(false);
        setIsAuditWorkbenchOpen(true);
      }, 900);
    }, 800);
  };

  // 2. 文字 NLP 自然語言轉錄
  const handleSimulateNlp = () => {
    if (!nlpInput.trim()) return;
    setIsProcessing(true);
    setProcessStep('正在以 LLM 生理紀錄轉錄引擎解析自然語言...');

    setTimeout(() => {
      setIsProcessing(false);
      addRecord({
        memberId: activeMember.id,
        date: new Date().toISOString().split('T')[0],
        hospital: 'LINE 自然語言日常生理日誌記錄',
        system: 'vascular',
        code: 'GLU_AC',
        standardName: '空腹血糖 (AC Glucose)',
        originalReportName: '早晨空腹血糖 (對話輸入)',
        value: 106,
        numericValue: 106,
        unit: 'mg/dL',
        referenceInterval: '70 - 99',
        isAbnormal: true,
        trendClassification: 'normal_worsening',
        isPendingAudit: false,
        confidenceScore: 0.96,
        reportPage: 1,
        cropImageLabel: `LINE 對話轉錄：${nlpInput}`,
      });
      setIsIngestionModalOpen(false);
    }, 700);
  };

  // 3. 健保快易通 SDK 同步
  const handleSimulateNhi = () => {
    setIsProcessing(true);
    setProcessStep('正在連線衛生福利部健保快易通 SDK 進行雙重身份驗證...');

    setTimeout(() => {
      setProcessStep('已取得近 30 天就醫紀錄 3 筆、處方用藥明細 2 筆、檢驗報告 1 筆...');
      setTimeout(() => {
        setIsProcessing(false);
        addRecord({
          memberId: activeMember.id,
          date: '2026-08-30',
          hospital: '臺北榮民總醫院 (健保快易通同步)',
          system: 'kidney',
          code: 'CREATININE',
          standardName: '肌酸酐 (Creatinine)',
          originalReportName: 'Creatinine (健保快易通)',
          value: 0.92,
          numericValue: 0.92,
          unit: 'mg/dL',
          referenceInterval: '0.7 - 1.2',
          isAbnormal: false,
          trendClassification: 'stable_normal',
          isPendingAudit: false,
          confidenceScore: 0.99,
          reportPage: 1,
          cropImageLabel: '健保資料庫官方同步數據明細 (NHI SDK 授權鏈結)',
        });
        setIsIngestionModalOpen(false);
      }, 900);
    }, 800);
  };

  // 4. 多頁 PDF 電子報告解析
  const handleSimulatePdf = () => {
    setIsProcessing(true);
    setProcessStep('正在解析多頁 PDF：建立「報告 → 頁面 → 項目」結構樹...');

    setTimeout(() => {
      setProcessStep('成功提取 P.1 血液生化、P.2 尿液常規、P.3 骨質與胸腹影像...');
      setTimeout(() => {
        setIsProcessing(false);
        addRecord({
          memberId: activeMember.id,
          date: '2026-08-15',
          hospital: '國泰綜合醫院 (電子 PDF 報告)',
          system: 'heart',
          code: 'TC_HDL',
          standardName: '總膽固醇與高密度脂蛋白比值',
          originalReportName: 'T-CHOL / HDL-C Ratio',
          value: 4.2,
          numericValue: 4.2,
          unit: 'Ratio',
          referenceInterval: '< 5.0',
          isAbnormal: false,
          trendClassification: 'stable_normal',
          isPendingAudit: false,
          confidenceScore: 0.98,
          reportPage: 3,
          cropImageLabel: '多頁 PDF 報告 P.3 [T-CHOL / HDL-C: 4.2]',
        });
        setIsIngestionModalOpen(false);
      }, 900);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                四源數據智能匯入系統
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PRD 3.1 無痛數位化
                </span>
              </h3>
              <p className="text-xs text-slate-400">當前匯入目標：{activeMember.name}</p>
            </div>
          </div>
          <button
            onClick={() => setIsIngestionModalOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 四大訊號源切換頁籤 */}
        <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => setActiveSource('ocr')}
            className={`p-3 flex flex-col sm:flex-row items-center justify-center gap-1.5 border-b-2 transition ${
              activeSource === 'ocr' ? 'border-emerald-500 text-emerald-400 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>照片 OCR</span>
          </button>

          <button
            onClick={() => setActiveSource('nlp')}
            className={`p-3 flex flex-col sm:flex-row items-center justify-center gap-1.5 border-b-2 transition ${
              activeSource === 'nlp' ? 'border-cyan-500 text-cyan-400 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>文字對話 NLP</span>
          </button>

          <button
            onClick={() => setActiveSource('nhi')}
            className={`p-3 flex flex-col sm:flex-row items-center justify-center gap-1.5 border-b-2 transition ${
              activeSource === 'nhi' ? 'border-blue-500 text-blue-400 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>健保快易通</span>
          </button>

          <button
            onClick={() => setActiveSource('pdf')}
            className={`p-3 flex flex-col sm:flex-row items-center justify-center gap-1.5 border-b-2 transition ${
              activeSource === 'pdf' ? 'border-purple-500 text-purple-400 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>多頁 PDF 解析</span>
          </button>
        </div>

        {/* 內容區域 */}
        <div className="p-5 space-y-4">
          {isProcessing && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
              <div className="text-xs text-emerald-200">{processStep}</div>
            </div>
          )}

          {blurDetected && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-200">
                <div className="font-bold text-rose-300 text-sm mb-1">【影像品質攔截觸發】照片模糊/反光！</div>
                系統偵測到原圖在「數值欄位」存在反光光斑，文字邊緣銳利度不足 65%。為遵守醫療資訊學嚴謹性，本報告已中斷自動結論，請重新平放拍攝或手動上傳清晰圖檔。
              </div>
            </div>
          )}

          {/* 1. OCR Panel */}
          {activeSource === 'ocr' && !isProcessing && (
            <div className="space-y-3 text-xs">
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-6 text-center bg-slate-950/50 transition">
                <Camera className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="font-medium text-slate-200 text-sm">支援手機拍照或健檢報告掃描圖上傳</div>
                <div className="text-slate-400 text-xs mt-1">
                  1 分鐘內完成對檢驗項目、數值、單位及參考區間之辨識 (支援自動模糊與反光攔截)
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSimulateOcr(false)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>模擬上傳清晰報告 (觸發工作台核對)</span>
                </button>
                <button
                  onClick={() => handleSimulateOcr(true)}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium border border-amber-500/30 transition"
                >
                  測試模糊/反光攔截
                </button>
              </div>
            </div>
          )}

          {/* 2. NLP Panel */}
          {activeSource === 'nlp' && !isProcessing && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                支援在 LINE 中直接輸入口語自然語言，AI 自動轉錄為生理紀錄：
              </p>
              <textarea
                value={nlpInput}
                onChange={(e) => setNlpInput(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleSimulateNlp}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>模擬 LINE 對話自動轉錄</span>
              </button>
            </div>
          )}

          {/* 3. NHI SDK Panel */}
          {activeSource === 'nhi' && !isProcessing && (
            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-blue-950/30 border border-blue-500/30 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>健保快易通 (健康存摺 SDK) 官方授權同步</span>
                </div>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  經健保卡 / 身分證字號與手機門號雙重授權認證後，自動同步 <strong>近 30 天</strong> 之就醫紀錄、用藥明細及檢驗影像報告。
                </p>
              </div>
              <button
                onClick={handleSimulateNhi}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-950 transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>授權並同步近 30 天就醫與用藥紀錄</span>
              </button>
            </div>
          )}

          {/* 4. PDF Panel */}
          {activeSource === 'pdf' && !isProcessing && (
            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-purple-950/30 border border-purple-500/30 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
                  <Layers className="w-4 h-4" />
                  <span>多頁電子報告結構化提取</span>
                </div>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  針對醫院提供之多頁 PDF 電子健檢報告，自動切分章節並建立「報告 → 頁面 → 項目」精準追蹤鏈結。
                </p>
              </div>
              <button
                onClick={handleSimulatePdf}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-purple-950 transition"
              >
                <Layers className="w-4 h-4" />
                <span>模擬解析多頁 PDF 報告並建立鏈結</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
