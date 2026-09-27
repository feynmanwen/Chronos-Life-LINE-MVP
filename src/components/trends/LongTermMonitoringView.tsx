import React, { useState, useEffect } from 'react';
import { useHealth } from '../../context/HealthContext';
import { fetchLongTermAnalytics } from '../../services/api';
import { LongTermAnalyticsResponse } from '../../types/health';
import { 
  TrendingUp, 
  Calendar, 
  Flame, 
  Activity, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  ArrowDownRight, 
  ArrowUpRight, 
  Utensils, 
  Footprints, 
  Clock, 
  Layers,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const LongTermMonitoringView: React.FC = () => {
  const { activeMember } = useHealth();
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<LongTermAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'balance' | 'cardio' | 'biomarkers'>('balance');

  const loadData = async (targetDays: number) => {
    setIsLoading(true);
    try {
      const res = await fetchLongTermAnalytics(activeMember.id, targetDays);
      setData(res);
    } catch {
      // 保持目前資料
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(days);
  }, [days, activeMember.id]);

  if (!data) {
    return (
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-cyan-400" />
        <p className="text-sm">正在自 SQLite 資料庫彙整長期跨維度健康遙測數據...</p>
      </div>
    );
  }

  const { summary, timeline } = data;

  // 計算圖表的最大/最小值以進行 SVG 歸一化
  const maxCalories = Math.max(...timeline.map(t => Math.max(t.intakeCalories, t.totalExpenditure, 2200)));
  const maxSteps = Math.max(...timeline.map(t => t.steps), 10000);

  return (
    <div className="space-y-6">
      {/* 1. 頂部標題與時間跨度切換器 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-800/50 p-5 sm:p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-900/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                全維度長期健康數據監控工作台
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                PRD 7.1 跨維度關聯分析
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              對齊飲食攝取熱量、穿戴裝置活動消耗、Zone 2 心肺耐力與健檢指標（ALT 肝指數、HbA1c 糖化血色素）之長期推移軌跡，量化自律生活型態對期望餘命的持續加值。
            </p>
          </div>

          {/* 時段切換按鈕組 */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-indigo-800/50 shrink-0">
            <Calendar className="w-4 h-4 text-indigo-400 ml-1.5 mr-0.5" />
            {[
              { label: '7 天 (週)', value: 7 },
              { label: '30 天 (月)', value: 30 },
              { label: '90 天 (季)', value: 90 },
              { label: '180 天 (半年)', value: 180 },
            ].map(item => (
              <button
                key={item.value}
                onClick={() => setDays(item.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  days === item.value
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. 宏觀指標統計看板 (4大關鍵綜效) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 指標 1: 贏回健康餘命 */}
        <div className="rounded-3xl bg-slate-900/90 border border-emerald-800/50 p-4 sm:p-5 space-y-1.5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>累計贏回健康餘命</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              +{summary.totalLifespanEarnedDays} 天
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            +{summary.totalLifespanEarnedHours} <span className="text-xs text-slate-400 font-normal">小時</span>
          </div>
          <p className="text-[11px] text-slate-400">
            落實 Zone 2 超慢跑與低 GI 飲食所累積之期望壽命資產
          </p>
        </div>

        {/* 指標 2: 平均每日熱量赤字 */}
        <div className="rounded-3xl bg-slate-900/90 border border-orange-800/50 p-4 sm:p-5 space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>平均每日熱量收支</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-mono">
              赤字減脂中
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">
            -{summary.avgDailyCaloricDeficitKcal} <span className="text-xs text-slate-400 font-normal">kcal/天</span>
          </div>
          <p className="text-[11px] text-slate-400">
            攝取卡路里小於總消耗（基礎代謝+運動），穩定改善脂肪肝
          </p>
        </div>

        {/* 指標 3: 肝臟 ALT 改善幅度 */}
        <div className="rounded-3xl bg-slate-900/90 border border-cyan-800/50 p-4 sm:p-5 space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>肝臟發炎 ALT 推移</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono flex items-center gap-0.5">
              <ArrowDownRight className="w-3 h-3" /> 顯著逆轉
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
            {summary.liverAltImprovementPercent}% <span className="text-xs text-slate-400 font-normal">62 → 38 U/L</span>
          </div>
          <p className="text-[11px] text-slate-400">
            連續 30 天飲食去脂與超慢跑使肝細胞發炎指數回歸正常
          </p>
        </div>

        {/* 指標 4: 靜息心率提升 */}
        <div className="rounded-3xl bg-slate-900/90 border border-rose-800/50 p-4 sm:p-5 space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>靜息心率 (RHR)</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
              心血管年輕化
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            {summary.restingHeartRateDropBpm} <span className="text-xs text-slate-400 font-normal">bpm (75 → 68)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            心肌每搏輸出量增強，心血管生理年齡顯著倒退
          </p>
        </div>
      </div>

      {/* 3. 多維度趨勢圖表工作台 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              {days} 天歷史推移與跨維度對齊分析
            </h3>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('balance')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'balance'
                  ? 'bg-slate-800 text-orange-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🥗 熱量收支天平
            </button>
            <button
              onClick={() => setActiveTab('cardio')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'cardio'
                  ? 'bg-slate-800 text-sky-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🏃 心肺步數與 Zone 2
            </button>
            <button
              onClick={() => setActiveTab('biomarkers')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'biomarkers'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🩺 健檢生化指標逆轉
            </button>
          </div>
        </div>

        {/* 視圖 A: 熱量收支天平圖 (每日攝取 vs 每日消耗) */}
        {activeTab === 'balance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-orange-500/80 inline-block" />
                  <span>飲食攝取 (kcal)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-sky-500/80 inline-block" />
                  <span>總消耗 (基礎代謝+運動 kcal)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                  <span>每日熱量赤字 (有利減脂)</span>
                </span>
              </span>
              <span className="font-mono text-slate-500">{timeline[0].date} ~ {timeline[timeline.length - 1].date}</span>
            </div>

            {/* SVG 柱狀與複合趨勢圖 */}
            <div className="h-64 w-full bg-slate-950/60 rounded-2xl border border-slate-800/80 p-4 flex flex-col justify-between overflow-x-auto">
              <div className="h-44 w-full flex items-end gap-1.5 sm:gap-2">
                {timeline.map((point, idx) => {
                  const intakeHeight = Math.round((point.intakeCalories / maxCalories) * 100);
                  const expHeight = Math.round((point.totalExpenditure / maxCalories) * 100);
                  const isDeficit = point.caloricDeficit > 0;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full gap-1 group relative min-w-[12px]"
                      title={`${point.date} | 攝取: ${point.intakeCalories} kcal | 消耗: ${point.totalExpenditure} kcal | 赤字: ${point.caloricDeficit} kcal`}
                    >
                      {/* 長條對比 */}
                      <div className="w-full flex items-end justify-center gap-0.5 h-full">
                        <div
                          style={{ height: `${intakeHeight}%` }}
                          className="w-1/2 bg-orange-500/70 group-hover:bg-orange-400 rounded-t-sm transition-all"
                        />
                        <div
                          style={{ height: `${expHeight}%` }}
                          className="w-1/2 bg-sky-500/70 group-hover:bg-sky-400 rounded-t-sm transition-all"
                        />
                      </div>

                      {/* 底部赤字小圓點 */}
                      <span className={`w-1.5 h-1.5 rounded-full ${isDeficit ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    </div>
                  );
                })}
              </div>

              {/* X 軸日期標籤 */}
              <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                <span>{timeline[0].date.slice(5)}</span>
                <span>{timeline[Math.floor(timeline.length / 2)].date.slice(5)}</span>
                <span>{timeline[timeline.length - 1].date.slice(5)} (今日)</span>
              </div>
            </div>

            <div className="rounded-xl bg-orange-950/20 border border-orange-800/40 p-3 text-xs text-slate-300 flex items-start gap-2">
              <Flame className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span>
                <strong>熱量赤字天平臨床解讀：</strong>過去 {days} 天平均每日赤字達 <strong>-{summary.avgDailyCaloricDeficitKcal} kcal</strong>。依據臨床醫學每累積 7,700 kcal 赤字可健康減少 1 公斤內臟脂肪，預估已有效逆轉脂肪肝並提升動脈順應性。
              </span>
            </div>
          </div>
        )}

        {/* 視圖 B: 心肺步數與 Zone 2 趨勢 */}
        {activeTab === 'cardio' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-sky-500/80 inline-block" />
                  <span>每日步數 (步)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-cyan-400 inline-block" />
                  <span>Zone 2 超慢跑 (分鐘)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
                  <span>靜息心率 RHR (bpm)</span>
                </span>
              </span>
              <span className="font-mono text-slate-500">{timeline[0].date} ~ {timeline[timeline.length - 1].date}</span>
            </div>

            <div className="h-64 w-full bg-slate-950/60 rounded-2xl border border-slate-800/80 p-4 flex flex-col justify-between">
              <div className="h-44 w-full flex items-end gap-1.5 sm:gap-2">
                {timeline.map((point, idx) => {
                  const stepHeight = Math.round((point.steps / maxSteps) * 100);
                  const isZone2Active = point.zone2Minutes > 0;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full gap-1 group relative min-w-[12px]"
                      title={`${point.date} | 步數: ${point.steps.toLocaleString()} 步 | Zone 2: ${point.zone2Minutes} min | 靜息心率: ${point.restingHeartRate} bpm`}
                    >
                      <div
                        style={{ height: `${stepHeight}%` }}
                        className={`w-full rounded-t-sm transition-all ${
                          isZone2Active 
                            ? 'bg-gradient-to-t from-sky-600 to-cyan-400' 
                            : 'bg-slate-700/60'
                        }`}
                      />
                      <span className="text-[8px] font-mono text-slate-500 hidden sm:block">
                        {point.restingHeartRate}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                <span>{timeline[0].date.slice(5)}</span>
                <span>{timeline[Math.floor(timeline.length / 2)].date.slice(5)}</span>
                <span>{timeline[timeline.length - 1].date.slice(5)} (今日)</span>
              </div>
            </div>

            <div className="rounded-xl bg-sky-950/20 border border-sky-800/40 p-3 text-xs text-slate-300 flex items-start gap-2">
              <Activity className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                <strong>心肺耐力強化指標：</strong>累計完成 <strong>{summary.totalZone2Minutes} 分鐘</strong> Zone 2 超慢跑。靜息心率從 75 bpm 穩健下降至 68 bpm，象徵心肌收縮效能卓越強化，心臟猝死風險顯著降低。
              </span>
            </div>
          </div>
        )}

        {/* 視圖 C: 健檢指標長期關聯預測 (ALT 與 HbA1c) */}
        {activeTab === 'biomarkers' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* ALT 肝臟指數逆轉 */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>丙胺酸轉胺酶 (ALT) 推移折線</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    安全標準 &lt; 40 U/L
                  </span>
                </div>

                <div className="h-36 flex items-end gap-1.5 pt-2">
                  {timeline.map((point, idx) => {
                    // ALT 區間 30 - 70 U/L
                    const h = Math.round(((point.altValue - 25) / 45) * 100);
                    const isSafe = point.altValue <= 40;

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative"
                        title={`${point.date} | ALT: ${point.altValue} U/L`}
                      >
                        <div
                          style={{ height: `${h}%` }}
                          className={`w-full rounded-t-sm transition-all ${
                            isSafe ? 'bg-emerald-500/80' : 'bg-rose-500/70'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                  <span>62 U/L (初期輕度脂肪肝)</span>
                  <span className="text-emerald-400 font-bold">38 U/L (健康合規 ✓)</span>
                </div>
              </div>

              {/* HbA1c 糖化血色素控制 */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-emerald-400" />
                    <span>糖化血色素 (HbA1c) 恆定推移</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    理想標準 &lt; 5.7%
                  </span>
                </div>

                <div className="h-36 flex items-end gap-1.5 pt-2">
                  {timeline.map((point, idx) => {
                    // HbA1c 區間 5.0 - 6.5 %
                    const h = Math.round(((point.hba1cValue - 5.0) / 1.5) * 100);
                    const isIdeal = point.hba1cValue < 5.7;

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative"
                        title={`${point.date} | HbA1c: ${point.hba1cValue}%`}
                      >
                        <div
                          style={{ height: `${h}%` }}
                          className={`w-full rounded-t-sm transition-all ${
                            isIdeal ? 'bg-emerald-500/80' : 'bg-amber-500/70'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                  <span>6.1% (前期代謝警訊)</span>
                  <span className="text-emerald-400 font-bold">5.5% (理想健康 ✓)</span>
                </div>
              </div>

            </div>

            <div className="rounded-xl bg-emerald-950/20 border border-emerald-800/40 p-3 text-xs text-slate-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>生化大數據對齊綜效：</strong>低 GI 高纖抗氧化飲食大幅減少糖化終產物 (AGEs) 累積，配合 Zone 2 骨骼肌 GLUT4 葡萄糖通道活化，成功將糖尿病前期風險降為 0，預估整體期望壽命累積增長 <strong>+1.8 年</strong>！
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. 歷史日常流水帳歷程 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              最近歷史活動與生活型態日記 (按日期展開)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">共 {timeline.length} 天紀錄</span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {timeline.slice(0, 10).map((p, i) => (
            <div
              key={i}
              className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-400 font-bold text-xs bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  {p.date}
                </span>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-orange-400" />
                    <strong>{p.intakeCalories}</strong> kcal
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className="flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5 text-sky-400" />
                    <strong>{p.steps.toLocaleString()}</strong> 步
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    Zone 2: <strong>{p.zone2Minutes}</strong> min
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
                <span className="text-orange-400 font-medium">
                  赤字: -{p.caloricDeficit} kcal
                </span>
                <span className="text-emerald-400 font-bold font-mono">
                  +{p.lifespanBonusHours} 小時
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
