import React, { useState, useRef, useEffect } from 'react';
import { useHealth } from '../../context/HealthContext';
import { RAG_KNOWLEDGE_SNIPPETS } from '../../data/medicalKnowledge';
import { sanitizeAiResponse } from '../../utils/redFlagDetector';
import { Send, Bot, User, Sparkles, ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isLogSuccess?: boolean;
  citation?: string;
}

export const LineChatView: React.FC = () => {
  const { 
    activeMember, 
    triggerRedFlagCheck, 
    addRecord, 
    setActiveTab, 
    setIsDoctorSummaryOpen 
  } = useHealth();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: `您好 ${activeMember.name}！我是您的 Chronos Life AI 健檢趨勢管家。您可以隨時詢問我任何健檢數值趨勢，或直接用語音/文字對話記錄生活作息（例如：「今天睡了 7 小時」、「空腹血糖 102」）。`,
      timestamp: '10:00',
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // PRD 7.1 急症關鍵字即時安全防衛攔截 (0 延遲中斷)
    const isIntercepted = triggerRedFlagCheck(text);
    if (isIntercepted) {
      // 終止 AI 對話與 RAG 運算
      return;
    }

    // AI 生成與 NLP 轉錄處理
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      // 檢查是否為自然語言生理紀錄 (PRD 3.1)
      if (text.includes('睡') || text.includes('小時')) {
        const botMsg: ChatMessage = {
          id: `msg-${Date.now()}-reply`,
          sender: 'bot',
          text: `收到！已為您將「${text}」自動轉錄為今日生理日誌。維持 7-8 小時深層睡眠有助於肝細胞代謝修復，生命樹已為您滋養生長！`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isLogSuccess: true,
        };
        setMessages(prev => [...prev, botMsg]);
        return;
      }

      if (text.includes('血糖') || text.includes('GLU') || text.includes('mg/dL')) {
        addRecord({
          memberId: activeMember.id,
          date: new Date().toISOString().split('T')[0],
          hospital: 'LINE 對話轉錄',
          system: 'vascular',
          code: 'GLU_AC',
          standardName: '空腹血糖 (AC Glucose)',
          originalReportName: '空腹血糖 (對話轉錄)',
          value: 104,
          numericValue: 104,
          unit: 'mg/dL',
          referenceInterval: '70 - 99',
          isAbnormal: true,
          trendClassification: 'normal_worsening',
          isPendingAudit: false,
          confidenceScore: 0.95,
          reportPage: 1,
          cropImageLabel: 'LINE 輸入轉錄',
        });

        const botMsg: ChatMessage = {
          id: `msg-${Date.now()}-reply`,
          sender: 'bot',
          text: `已成功轉錄空腹血糖紀錄 (104 mg/dL) 並納入個人健康資產！目前數值處於正常高標臨界，已為您自動同步至策略儀表板。`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isLogSuccess: true,
        };
        setMessages(prev => [...prev, botMsg]);
        return;
      }

      // 一般 RAG 衛教諮詢
      let replyText = `根據臨床醫學指引，您的個人健康趨勢整體處於可主動干預範圍。建議維持低精緻澱粉飲食，並配合每週 150 分鐘中強度運動。`;
      let citation = '台灣衛福部國健署健康促進指引 (2024)';

      if (text.includes('ALT') || text.includes('GPT') || text.includes('肝')) {
        const rag = RAG_KNOWLEDGE_SNIPPETS.find(r => r.system === 'liver');
        replyText = rag ? rag.summary : replyText;
        citation = rag ? rag.citation : citation;
      } else if (text.includes('骨') || text.includes('T-score') || text.includes('肌少')) {
        const rag = RAG_KNOWLEDGE_SNIPPETS.find(r => r.system === 'joints');
        replyText = rag ? rag.summary : replyText;
        citation = rag ? rag.citation : citation;
      } else if (text.includes('BI-RADS') || text.includes('乳房')) {
        const rag = RAG_KNOWLEDGE_SNIPPETS.find(r => r.system === 'gi');
        replyText = rag ? rag.summary : replyText;
        citation = rag ? rag.citation : citation;
      }

      // PRD 7.2 安全 No-Go 審查過濾
      const sanitized = sanitizeAiResponse(replyText);

      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-reply`,
        sender: 'bot',
        text: sanitized.safeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citation,
      };
      setMessages(prev => [...prev, botMsg]);
    }, 700);
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[560px]">
      {/* LINE 對話視窗頂部標題 */}
      <div className="bg-[#06c755] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight">Chronos Life 官方帳號</h3>
            <span className="text-[10px] text-white/80">24/7 AI 衛教助手・醫療安全認證</span>
          </div>
        </div>

        <button
          onClick={() => setIsDoctorSummaryOpen(true)}
          className="text-xs px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/30 font-bold text-white transition"
        >
          就醫摘要
        </button>
      </div>

      {/* 快捷對話氣泡 Chip */}
      <div className="bg-slate-950/80 px-3 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
        <span className="text-slate-500 text-[10px] shrink-0">快捷測試:</span>
        <button
          onClick={() => handleSend('我突然劇烈胸痛喘不過氣')}
          className="px-2.5 py-1 rounded-full bg-rose-950/70 text-rose-300 border border-rose-500/50 hover:bg-rose-900 shrink-0 font-bold"
        >
          🚨 測試急症紅旗攔截
        </button>
        <button
          onClick={() => handleSend('今天睡了 6.5 小時')}
          className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 shrink-0"
        >
          📝 記錄睡眠 6.5 小時
        </button>
        <button
          onClick={() => handleSend('請問 ALT 升高代表什麼？')}
          className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 shrink-0"
        >
          📊 ALT 升高的意義
        </button>
        <button
          onClick={() => handleSend('BI-RADS 3 該注意什麼？')}
          className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 shrink-0"
        >
          🩺 BI-RADS 3 追蹤
        </button>
      </div>

      {/* 對話訊息捲動區域 */}
      <div className="flex-1 bg-[#1a2332] p-4 overflow-y-auto space-y-3.5">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex items-end gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-[#06c755] flex items-center justify-center text-white shrink-0 mb-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
              m.sender === 'user'
                ? 'bg-[#06c755] text-white rounded-br-none shadow-md font-medium'
                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
            }`}>
              <p>{m.text}</p>

              {m.isLogSuccess && (
                <div className="mt-1.5 pt-1.5 border-t border-emerald-500/30 text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                  <span>✓ 已記錄至健康資料庫與生活樹</span>
                </div>
              )}

              {m.citation && (
                <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-cyan-400" />
                  <span>文獻來源：{m.citation}</span>
                </div>
              )}

              <span className={`text-[9px] block text-right mt-1 ${
                m.sender === 'user' ? 'text-white/70' : 'text-slate-500'
              }`}>
                {m.timestamp}
              </span>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 mb-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-6 h-6 rounded-full bg-[#06c755] flex items-center justify-center text-white animate-pulse">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span>AI 衛教管家正在檢索醫學知識庫...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 輸入欄 */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          placeholder="輸入訊息或生理紀錄（例：今早空腹血糖 102）..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#06c755]"
        />
        <button
          onClick={() => handleSend()}
          className="p-2 rounded-xl bg-[#06c755] hover:bg-[#05b34c] text-white transition shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
