import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { 
  Heart, 
  Dumbbell, 
  Utensils, 
  Sparkles, 
  Camera, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck,
  Watch,
  Flame,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ChronosRingsCard: React.FC = () => {
  const { 
    activeMember, 
    dietRingPercent, 
    exerciseRingPercent, 
    todayDietCalories, 
    dietGoalCalories,
    addDietRecord,
    todayExerciseMinutes, 
    exerciseGoalMinutes,
    addExerciseRecord,
    setActiveTab 
  } = useHealth();

  // 三環進度狀態 (0 - 100)
  const [lifespanProgress, setLifespanProgress] = useState<number>(() => Math.min(96, activeMember.healthScore + 15));
  const exerciseProgress = exerciseRingPercent;
  const dietProgress = dietRingPercent;

  // 動態效果
  const [isPulsingGreen, setIsPulsingGreen] = useState(false);
  const [activeRingTooltip, setActiveRingTooltip] = useState<'green' | 'blue' | 'orange' | null>(null);
  const [isSimulatingFood, setIsSimulatingFood] = useState(false);
  const [foodLogMessage, setFoodLogMessage] = useState<string | null>(null);

  // 圓環參數 (Apple Watch 經典同心環比例)
  const size = 260;
  const strokeWidth = 18;
  const center = size / 2;

  // 外環 (綠): 半徑 102
  const rGreen = 102;
  const cGreen = 2 * Math.PI * rGreen;
  const offsetGreen = cGreen - (Math.min(100, lifespanProgress) / 100) * cGreen;

  // 中環 (藍): 半徑 78
  const rBlue = 78;
  const cBlue = 2 * Math.PI * rBlue;
  const offsetBlue = cBlue - (Math.min(100, exerciseProgress) / 100) * cBlue;

  // 內環 (橘): 半徑 54
  const rOrange = 54;
  const cOrange = 2 * Math.PI * rOrange;
  const offsetOrange = cOrange - (Math.min(100, dietProgress) / 100) * cOrange;

  // 互動 1：落實健康任務，激發綠環擴張與脈衝
  const handleBoostLifespan = () => {
    setIsPulsingGreen(true);
    setLifespanProgress(prev => Math.min(100, prev + 5));
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (_) {}
    setTimeout(() => setIsPulsingGreen(false), 2000);
  };

  // 互動 2：模擬完成 Zone 2 超慢跑，藍環動態推進
  const handleCompleteExercise = async () => {
    try {
      await addExerciseRecord({
        exerciseType: 'Zone 2 超慢跑',
        sourceDevice: 'Apple Watch Ultra 2',
        durationMinutes: 30,
        caloriesBurned: 185,
        avgHeartRate: 124,
        maxHeartRate: 135,
        zone2Minutes: 28,
        distanceKm: 3.2,
        lifespanBonusHours: 2.5
      });
      confetti({
        particleCount: 45,
        spread: 70,
        colors: ['#0284c7', '#38bdf8', '#7dd3fc'],
        origin: { y: 0.6 }
      });
    } catch (_) {}
  };

  // 互動 3：多模態 AI 飲食拍照辨識，橘環動態推進
  const handleSimulateFoodPhoto = () => {
    setIsSimulatingFood(true);
    setFoodLogMessage('正在以多模態 Vision-LLM 辨識餐點成分...');
    setTimeout(async () => {
      setIsSimulatingFood(false);
      try {
        await addDietRecord({
          mealType: '午餐',
          foodName: '地中海嫩煎鮭魚彩椒溫沙拉',
          calories: 480,
          carbs: 18,
          protein: 38,
          fat: 22,
          fiber: 7,
          sodium: 340,
          glycemicIndex: '低GI',
          healthImpactRating: 95,
          aiAnalysisNotes: '富含 Omega-3 與花青素，保護 ALT 與 eGFR，極佳抗炎飲食。'
        });
      } catch (_) {}
      setFoodLogMessage('✓ 辨識完成：地中海嫩煎鮭魚彩椒溫沙拉（低鈉、極低嘌呤，保護 ALT 與 eGFR），今日膳食完全合規！');
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          colors: ['#ea580c', '#fb923c', '#fdba74'],
          origin: { y: 0.6 }
        });
      } catch (_) {}
      setTimeout(() => setFoodLogMessage(null), 5000);
    }, 1200);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/90 p-5 sm:p-6 shadow-2xl">
      {/* 背景微妙光斑 */}
      <div className="absolute top-0 right-1/4 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-52 h-52 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 標題欄 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center shadow-lg">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute" />
            <Sparkles className="w-5 h-5 text-emerald-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                健康與生命同心三環
                <span className="text-xs font-mono text-slate-400 font-normal">(Chronos Rings)</span>
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-emerald-500/30 font-medium">
                Apple 極簡行為模型
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              將冰冷生化指標轉譯為具備呼吸感與生命賦能的動態視覺中控
            </p>
          </div>
        </div>

        {/* 閉合三環總成效徽章 */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 self-end sm:self-auto">
          <span className="text-slate-400">今日三環達成率：</span>
          <span className="font-mono font-black text-white text-sm">
            {Math.round((lifespanProgress + exerciseProgress + dietProgress) / 3)}%
          </span>
        </div>
      </div>

      {/* 主體區塊：同心三環 SVG 與三環指標卡 */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 左側 / 上側：Apple 質感同心三環 SVG 畫布 */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative select-none">
          <div className="relative w-[260px] h-[260px] flex items-center justify-center">
            <svg 
              width={size} 
              height={size} 
              className={`transform -rotate-90 transition-all duration-700 ${isPulsingGreen ? 'scale-105 filter drop-shadow-[0_0_20px_rgba(16,185,129,0.7)]' : ''}`}
            >
              <defs>
                {/* 綠環漸層 */}
                <linearGradient id="greenRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
                {/* 藍環漸層 */}
                <linearGradient id="blueRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
                {/* 橘環漸層 */}
                <linearGradient id="orangeRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
              </defs>

              {/* 1. 外環底槽 (深色暗底) */}
              <circle
                cx={center}
                cy={center}
                r={rGreen}
                stroke="#064e3b"
                strokeWidth={strokeWidth}
                strokeOpacity="0.35"
                fill="transparent"
              />
              {/* 1. 外環進度條 (能量綠：期望餘生環) */}
              <circle
                cx={center}
                cy={center}
                r={rGreen}
                stroke="url(#greenRingGrad)"
                strokeWidth={strokeWidth}
                strokeDasharray={cGreen}
                strokeDashoffset={offsetGreen}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out cursor-pointer hover:opacity-90"
                onClick={() => setActiveRingTooltip('green')}
              />

              {/* 2. 中環底槽 (深色暗底) */}
              <circle
                cx={center}
                cy={center}
                r={rBlue}
                stroke="#0c4a6e"
                strokeWidth={strokeWidth}
                strokeOpacity="0.35"
                fill="transparent"
              />
              {/* 2. 中環進度條 (心肺藍：運動達標環) */}
              <circle
                cx={center}
                cy={center}
                r={rBlue}
                stroke="url(#blueRingGrad)"
                strokeWidth={strokeWidth}
                strokeDasharray={cBlue}
                strokeDashoffset={offsetBlue}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out cursor-pointer hover:opacity-90"
                onClick={() => setActiveRingTooltip('blue')}
              />

              {/* 3. 內環底槽 (深色暗底) */}
              <circle
                cx={center}
                cy={center}
                r={rOrange}
                stroke="#7c2d12"
                strokeWidth={strokeWidth}
                strokeOpacity="0.35"
                fill="transparent"
              />
              {/* 3. 內環進度條 (飲食橘：膳食控制環) */}
              <circle
                cx={center}
                cy={center}
                r={rOrange}
                stroke="url(#orangeRingGrad)"
                strokeWidth={strokeWidth}
                strokeDasharray={cOrange}
                strokeDashoffset={offsetOrange}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out cursor-pointer hover:opacity-90"
                onClick={() => setActiveRingTooltip('orange')}
              />
            </svg>

            {/* 圓環中央焦點統計 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">CHRONOS</span>
              <span className="text-xl font-black text-white font-mono tracking-tight mt-0.5">
                +{activeMember.dynamicBonusYears}y
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">已贏回時間</span>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_#10b981]" /> 期望餘生</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block shadow-[0_0_8px_#38bdf8]" /> 心肺有氧</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block shadow-[0_0_8px_#fb923c]" /> 膳食合規</span>
          </div>
        </div>

        {/* 右側 / 下側：三環詳細意義與即時互動控制 */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* 環 1：外環 能量綠 ——「期望餘生環（Lifespan Ring）」 */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 relative ${
            isPulsingGreen 
              ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]' 
              : 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/40'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-300">🟢 外環：能量綠</span>
                    <h3 className="text-sm font-bold text-white">期望餘生環 (Lifespan Ring)</h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    與 500 萬筆亞洲長壽生化大數據對齊後，動態預測之健康餘命年限。落實微習慣時產生<strong>擴張微光脈衝</strong>，象徵贏回時間。
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400">預估餘命：<strong className="text-white">{(activeMember.baseLifeExpectancyYears + activeMember.dynamicBonusYears).toFixed(1)} 年</strong></span>
                    <span className="text-emerald-400">贏回時間：<strong>+{activeMember.dynamicBonusYears} 年</strong></span>
                    <span className="text-slate-400">達成率：<strong>{lifespanProgress}%</strong></span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBoostLifespan}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-950 transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>落實任務贏回時間</span>
              </button>
            </div>
          </div>

          {/* 環 2：中環 心肺藍 ——「運動達標環（Exercise Ring）」 */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-sky-500/40 transition">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0 mt-0.5">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-sky-300">🔵 中環：心肺藍</span>
                    <h3 className="text-sm font-bold text-white">運動達標環 (Exercise Ring)</h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    30 天心肺有氧與超慢跑（Zone 2）任務執行率。對接穿戴裝置 VO2 Max 與心率，每週 3 次、每次 30 分鐘黃金心率即可閉合。
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400">今日有氧：<strong className="text-white">{todayExerciseMinutes} / {exerciseGoalMinutes} 分鐘</strong></span>
                    <span className="text-sky-400">Zone 2 心率：<strong>115-130 bpm</strong></span>
                    <span className="text-slate-400">穿戴連線：<strong>已同步</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => setActiveTab('exercise')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-950 active:scale-95 transition cursor-pointer flex items-center gap-1 justify-center"
                >
                  <Watch className="w-3.5 h-3.5" />
                  <span>進入運動模組</span>
                </button>
                <button
                  onClick={handleCompleteExercise}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition justify-center ${
                    exerciseProgress >= 100
                      ? 'bg-sky-950 text-sky-300 border border-sky-500/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{exerciseProgress >= 100 ? '今日已閉合' : '快速達標打卡'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 環 3：內環 飲食橘 ——「膳食控制環（Diet Ring）」 */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-orange-500/40 transition">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0 mt-0.5">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-orange-300">🟠 內環：飲食橘</span>
                    <h3 className="text-sm font-bold text-white">膳食控制環 (Diet Ring)</h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    多模態 AI 飲食拍照辨識之熱量與營養合規率。避開高鹽重鈉與高嘌呤（防止 ALT 發炎與 eGFR 腎過濾負擔），向內收縮閉合。
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400">總熱量：<strong className="text-white">{todayDietCalories} / {dietGoalCalories} kcal</strong></span>
                    <span className="text-orange-400">低鈉低嘌呤：<strong>達標</strong></span>
                    <span className="text-slate-400">合規率：<strong>{dietProgress}%</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => setActiveTab('diet')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-950 active:scale-95 transition cursor-pointer flex items-center gap-1 justify-center"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>進入飲食模組</span>
                </button>
                <button
                  onClick={handleSimulateFoodPhoto}
                  disabled={isSimulatingFood}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition justify-center ${
                    dietProgress >= 100
                      ? 'bg-orange-950 text-orange-300 border border-orange-500/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isSimulatingFood ? 'AI 辨識中...' : dietProgress >= 100 ? '今日已閉合' : 'AI 拍照試玩'}</span>
                </button>
              </div>
            </div>

            {/* AI 飲食拍照辨識即時提示 */}
            {foodLogMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-orange-950/40 border border-orange-500/40 text-xs text-orange-200 animate-fadeIn">
                {foodLogMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
