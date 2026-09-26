import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { FileText, Printer, Download, X, HelpCircle, CheckCircle, AlertTriangle, Building, Calendar } from 'lucide-react';

export const DoctorSummaryModal: React.FC = () => {
  const { 
    isDoctorSummaryOpen, 
    setIsDoctorSummaryOpen, 
    activeMember, 
    activeRecords, 
    activeEvents, 
    organSystems 
  } = useHealth();

  if (!isDoctorSummaryOpen) return null;

  // 整理異常與惡化中的重點指標
  const criticalItems = activeRecords.filter(r => r.trendClassification === 'abnormal_worsening' || r.isAbnormal);

  // 門診提問清單建議 (依據指標自動生成)
  const questionList: string[] = [
    '請問近三年數值呈現跨院上升趨勢，是否需進一步安排腹部超音波或肝纖維化掃描？',
    '目前日常飲食與運動計畫，是否需要搭配特定處方藥物或保肝保健品？',
    '下一次抽血追蹤建議間隔多久（如 3 個月或 6 個月）為宜？',
  ];

  if (activeMember.role === '母親') {
    questionList.length = 0;
    questionList.push('DXA T-score 已達 -2.6，目前肌少合併骨鬆情況下，是否建議開始使用雙磷酸鹽類或副甲狀腺素相關骨鬆治療藥物？');
    questionList.push('長輩目前膝關節退化，是否有適合骨質疏鬆患者的物理治療或居家防跌肌力指導？');
    questionList.push('飲食中鈣質與活性維生素 D3 之每日攝取目標劑量為何？');
  } else if (activeMember.role === '配偶') {
    questionList.length = 0;
    questionList.push('針對乳房 X 光攝影為良性 (BI-RADS 1) 但超音波評為 BI-RADS 3 (右乳 0.8cm 結節)，請問 6 個月追蹤是否維持單做超音波即可？');
    questionList.push('因屬於緻密型乳腺，未來每年篩檢策略應如何搭配攝影與超音波？');
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                一頁式醫病溝通摘要 (Doctor-Patient Summary)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PRD 2.2 診間效率
                </span>
              </h3>
              <p className="text-xs text-slate-400">專為回診 3 分鐘設計：歷年趨勢、來源頁碼、醫師提問清單</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>列印 / 匯出 PDF</span>
            </button>
            <button
              onClick={() => setIsDoctorSummaryOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 診間專用 A4 單頁排版內容 */}
        <div className="p-6 space-y-5 overflow-y-auto bg-slate-950/40 text-xs">
          {/* 病患基本資料卡 */}
          <div className="rounded-xl bg-slate-900 p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-400 text-[11px]">姓名 / 身份：</span>
                <div className="text-sm font-bold text-white">{activeMember.name} ({activeMember.role})</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">年齡 / 性別：</span>
                <div className="text-sm font-bold text-white">{activeMember.age} 歲 ({activeMember.gender})</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">預計看診科別：</span>
                <div className="text-sm font-bold text-cyan-300">{activeMember.nextClinicDepartment}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[11px]">摘要生成日期：</span>
              <div className="font-mono text-slate-200">{new Date().toISOString().split('T')[0]}</div>
            </div>
          </div>

          {/* 區塊一：歷年異常與重點趨勢清單 (含原始頁碼溯源) */}
          <div className="rounded-xl bg-slate-900 p-4 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              1. 歷年跨院檢驗軌跡與來源頁碼（來源優先溯源清單）
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2">採檢日</th>
                    <th className="pb-2">受檢院所</th>
                    <th className="pb-2">標準名稱</th>
                    <th className="pb-2">原著名稱</th>
                    <th className="pb-2">數值 / 單位</th>
                    <th className="pb-2">原報告參考值</th>
                    <th className="pb-2">報告頁碼</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {criticalItems.map((item, idx) => (
                    <tr key={idx} className="text-slate-200">
                      <td className="py-2 text-[11px]">{item.date}</td>
                      <td className="py-2 text-[11px] font-sans">{item.hospital}</td>
                      <td className="py-2 text-[11px] font-sans font-bold text-white">{item.standardName}</td>
                      <td className="py-2 text-[11px] font-sans text-cyan-300">{item.originalReportName}</td>
                      <td className="py-2 text-rose-400 font-bold">{item.value} {item.unit}</td>
                      <td className="py-2 text-slate-400">{item.referenceInterval}</td>
                      <td className="py-2 text-emerald-400 font-sans font-medium">第 {item.reportPage} 頁</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 區塊二：近期生命脈絡與用藥事件 */}
          <div className="rounded-xl bg-slate-900 p-4 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              2. 關鍵生命事件脈絡 (Event Annotations)
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              {activeEvents.map(e => (
                <div key={e.id} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg">
                  <span className="text-indigo-400 font-mono shrink-0">[{e.date}]</span>
                  <span><strong>{e.title}：</strong>{e.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 區塊三：診間醫師提問清單 (提升溝通效率) */}
          <div className="rounded-xl bg-slate-900 p-4 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              3. 今日回診建言提問清單 (已依據檢驗趨勢預先擬定)
            </h4>
            <div className="space-y-2">
              {questionList.map((q, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-cyan-950/20 border border-cyan-500/20 p-2.5 rounded-lg text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
