import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { BookmarkPlus, Sparkles, Calendar, Tag, ChevronRight, X } from 'lucide-react';

export const EventAnnotationBar: React.FC = () => {
  const { activeEvents, addLifeEvent, activeMember } = useHealth();
  const [isAdding, setIsAdding] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<'medication' | 'surgery' | 'lifestyle' | 'milestone'>('medication');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventDesc, setEventDesc] = useState('');

  const handleSaveEvent = () => {
    if (!eventTitle.trim()) return;

    // AI 生成關聯分析模擬
    let aiInsight = `AI 關聯分析：於 ${eventDate} 標註「${eventTitle}」。後續生理檢驗指標（如肝功能、血壓與代謝指標）之正向或負向波動，將由 Chronos 智能引擎自動計算關聯係數並標註於時間軸。`;
    if (eventType === 'medication') {
      aiInsight = `AI 關聯分析：標註藥物介入後，系統預計於 8-12 週檢測血中生化濃度反應，並在趨勢圖對比用藥前後斜率。`;
    } else if (eventType === 'surgery') {
      aiInsight = `AI 關聯分析：手術事件標註完成，系統已自動校正術後急性發炎期之生理指標閾值。`;
    }

    addLifeEvent({
      memberId: activeMember.id,
      date: eventDate,
      title: eventTitle,
      type: eventType,
      description: eventDesc || '使用者於時間軸手動建立之生命事件標註。',
      aiCorrelationInsight: aiInsight,
    });

    setEventTitle('');
    setEventDesc('');
    setIsAdding(false);
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <BookmarkPlus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              生命事件註記 (Event Annotation)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRD 4.1 脈絡感知
              </span>
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(prev => !prev)}
          className="text-xs px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 transition shadow-md shadow-indigo-950"
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
          <span>{isAdding ? '取消' : '新增生命事件'}</span>
        </button>
      </div>

      {/* 新增事件表單 */}
      {isAdding && (
        <div className="mt-3 p-4 rounded-xl bg-slate-950/70 border border-indigo-500/40 space-y-3">
          <div className="text-xs font-bold text-indigo-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>標註生命事件（如：開始用藥、手術、戒菸、飲食劇變）</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">事件類型</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
              >
                <option value="medication">開始/變更用藥</option>
                <option value="surgery">外科手術/重大處置</option>
                <option value="lifestyle">生活型態改變 (如戒菸/應酬)</option>
                <option value="milestone">重大生理里程碑 (如停經)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">事件日期</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">事件名稱</label>
              <input
                type="text"
                placeholder="例如：開始服用降血脂藥品"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">事件詳細脈絡說明</label>
            <input
              type="text"
              placeholder="例如：每晚睡前一顆 Atorvastatin 20mg，並配合減少油炸物"
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
            >
              取消
            </button>
            <button
              onClick={handleSaveEvent}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              確認標註並計算 AI 關聯
            </button>
          </div>
        </div>
      )}

      {/* 事件列表與 AI 關聯性洞察 */}
      <div className="mt-3.5 space-y-2.5">
        {activeEvents.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-4">
            尚無標註之生命事件，點擊上方按鈕記錄關鍵用藥或生活變化
          </div>
        ) : (
          activeEvents.map(event => (
            <div
              key={event.id}
              className="rounded-xl bg-slate-950/50 border border-slate-800/80 p-3 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    event.type === 'medication' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    event.type === 'surgery' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    event.type === 'lifestyle' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {event.type === 'medication' ? '用藥變更' :
                     event.type === 'surgery' ? '手術處置' :
                     event.type === 'lifestyle' ? '習慣改變' : '生理里程碑'}
                  </span>
                  <h4 className="text-xs font-bold text-white">{event.title}</h4>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{event.date}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {event.description}
              </p>

              <div className="rounded-lg bg-indigo-950/40 border border-indigo-500/30 p-2 text-xs text-indigo-200/90 flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{event.aiCorrelationInsight}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
