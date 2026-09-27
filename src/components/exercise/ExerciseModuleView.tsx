import React, { useState, useEffect } from 'react';
import { useHealth } from '../../context/HealthContext';
import { 
  Watch, 
  Activity, 
  Dumbbell, 
  Flame, 
  Heart, 
  CheckCircle2, 
  Play, 
  Pause, 
  RotateCcw, 
  RefreshCw, 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  Clock, 
  Footprints, 
  TrendingUp, 
  Zap, 
  Gauge
} from 'lucide-react';
import confetti from 'canvas-confetti';

const WEARABLE_BRANDS = [
  {
    id: 'apple',
    name: 'Apple Watch Ultra 2',
    icon: Smartphone,
    color: 'border-cyan-500 text-cyan-400',
    battery: '88%',
    protocol: 'Apple HealthKit'
  },
  {
    id: 'garmin',
    name: 'Garmin Forerunner 965',
    icon: Watch,
    color: 'border-blue-500 text-blue-400',
    battery: '94%',
    protocol: 'Garmin Connect API'
  },
  {
    id: 'google',
    name: 'Google Pixel Watch 3',
    icon: Activity,
    color: 'border-emerald-500 text-emerald-400',
    battery: '76%',
    protocol: 'Health Connect'
  },
  {
    id: 'samsung',
    name: 'Samsung Galaxy Watch 7',
    icon: Watch,
    color: 'border-indigo-500 text-indigo-400',
    battery: '82%',
    protocol: 'Samsung Health'
  }
];

export const ExerciseModuleView: React.FC = () => {
  const { 
    exerciseRecords, 
    addExerciseRecord, 
    wearableDevice, 
    syncWearable, 
    todayExerciseMinutes, 
    exerciseGoalMinutes,
    exerciseRingPercent,
    activeMember 
  } = useHealth();

  const [selectedBrand, setSelectedBrand] = useState('Apple Watch Ultra 2');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // 運動計時器狀態
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedExerciseType, setSelectedExerciseType] = useState<'Zone 2 超慢跑' | '心肺有氧快走' | '高強度間歇 HIIT' | '力量抗阻訓練' | '核心與伸展'>('Zone 2 超慢跑');
  const [simulatedHeartRate, setSimulatedHeartRate] = useState(124);

  // 計時器計時效果
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
        // 心率在 Zone 2 (115 - 135 bpm) 之間健康微幅震盪
        setSimulatedHeartRate(Math.floor(120 + Math.sin(Date.now() / 1500) * 8));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // 一鍵連線同步穿戴裝置
  const handleWearableSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const data = await syncWearable(selectedBrand);
      setIsSyncing(false);
      setSyncFeedback(`✓ 已成功同步 ${selectedBrand} 最新數據！今日步數 ${data.dailySteps.toLocaleString()} 步，Zone 2 心肺達標 ${data.zone2MinutesToday} 分鐘。`);
      
      try {
        confetti({
          particleCount: 45,
          spread: 70,
          colors: ['#0284c7', '#38bdf8', '#7dd3fc'],
          origin: { y: 0.6 }
        });
      } catch {}

      setTimeout(() => setSyncFeedback(null), 5000);
    } catch {
      setIsSyncing(false);
      setSyncFeedback('同步失敗，請確認穿戴式裝置藍牙連線。');
    }
  };

  // 儲存目前運動階段
  const handleSaveWorkout = async () => {
    const durationMin = Math.max(1, Math.round(timerSeconds / 60)) || 30;
    const calories = Math.round(durationMin * 8.5); // 估算每分鐘約 8.5 kcal
    const zone2Min = selectedExerciseType === 'Zone 2 超慢跑' ? durationMin : Math.round(durationMin * 0.7);
    const steps = durationMin * 140; // 每分鐘約 140 步超慢跑步頻
    const bonusHours = +(zone2Min / 12).toFixed(1);

    try {
      await addExerciseRecord({
        exerciseType: selectedExerciseType,
        sourceDevice: selectedBrand as any,
        durationMinutes: durationMin,
        caloriesBurned: calories,
        avgHeartRate: simulatedHeartRate,
        maxHeartRate: simulatedHeartRate + 16,
        zone2Minutes: zone2Min,
        distanceKm: +(durationMin * 0.11).toFixed(2),
        steps,
        lifespanBonusHours: bonusHours,
        loggedAt: new Date().toISOString()
      });

      setIsTimerRunning(false);
      setTimerSeconds(0);
      setSyncFeedback(`✓ 已儲存 [${selectedExerciseType}] 運動記錄！消耗 ${calories} kcal，為生命贏回 +${bonusHours} 小時健康餘命！心肺藍環已同步閉合。`);

      try {
        confetti({
          particleCount: 60,
          spread: 80,
          colors: ['#0284c7', '#10b981', '#38bdf8'],
          origin: { y: 0.6 }
        });
      } catch {}

      setTimeout(() => setSyncFeedback(null), 5000);
    } catch (err: any) {
      setSyncFeedback('儲存失敗：' + err.message);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayExercises = exerciseRecords.filter(r => r.loggedAt.slice(0, 10) === todayStr);

  return (
    <div className="space-y-6">
      {/* 1. 頂部 Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950/40 via-blue-950/30 to-slate-900 border border-sky-800/50 p-5 sm:p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-lg shadow-sky-900/30">
                <Watch className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                穿戴裝置即時遙測與 Zone 2 心肺運動中控
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
                PRD 6.1 FITT-VP & HealthKit
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              全面整合 Apple HealthKit、Garmin、Google Fit 等穿戴智慧裝置，毫秒級監測心率區間與步數。精準鎖定最大攝氧量 (VO2 Max) 與 Zone 2 超慢跑（110~135 bpm），透過微習慣持續強化心肺、激發藍環閉合並為 {activeMember.name} 贏回期望年限。
            </p>
          </div>

          {/* 今日達標卡 */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-sky-700/40 rounded-2xl p-3.5 shrink-0">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block">今日運動時長</span>
              <span className="text-lg font-bold text-sky-400 font-mono">
                {todayExerciseMinutes} <span className="text-xs text-slate-400 font-normal">/ {exerciseGoalMinutes} min</span>
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block">運動達標環 (心肺藍)</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">
                {exerciseRingPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 穿戴裝置連線狀態與即時遙測看板 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* 左側：穿戴裝置管理與同步 */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              穿戴式裝置連線管理
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              即時藍牙同步中
            </span>
          </div>

          {/* 裝置選擇卡片 */}
          <div className="grid grid-cols-2 gap-2.5">
            {WEARABLE_BRANDS.map(b => {
              const Icon = b.icon;
              const isSelected = selectedBrand === b.name;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrand(b.name)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-950/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span className="text-[10px] text-slate-500 font-mono">電量 {b.battery}</span>
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {b.name}
                    </h4>
                    <span className="text-[10px] text-slate-500">{b.protocol}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 當前穿戴遙測快照 */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">連線裝置：{selectedBrand}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                最後更新: {wearableDevice?.syncTime ? new Date(wearableDevice.syncTime).toLocaleTimeString() : '剛剛'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
                  <Footprints className="w-3 h-3 text-emerald-400" /> 今日步數
                </span>
                <span className="text-base font-bold text-white font-mono">
                  {(wearableDevice?.dailySteps || activeMember.dailySteps).toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-500 block">步 / 8000 目標</span>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
                  <Heart className="w-3 h-3 text-rose-400" /> 即時心率
                </span>
                <span className="text-base font-bold text-rose-400 font-mono">
                  {wearableDevice?.currentHeartRate || 72}
                </span>
                <span className="text-[9px] text-slate-500 block">bpm (靜息 64)</span>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" /> 活動消耗
                </span>
                <span className="text-base font-bold text-amber-400 font-mono">
                  {wearableDevice?.activeCaloriesKcal || 485}
                </span>
                <span className="text-[9px] text-slate-500 block">Active kcal</span>
              </div>
            </div>
          </div>

          {/* 同步按鈕 */}
          <button
            onClick={handleWearableSync}
            disabled={isSyncing}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-950 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? '正在自穿戴裝置讀取遙測紀錄...' : '立即連線同步最新穿戴數據'}</span>
          </button>
        </div>

        {/* 右側：Zone 2 超慢跑訓練控制台 */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                Zone 2 心肺耐力即時訓練工作台
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                目標心率 110-135 bpm
              </span>
            </div>

            {/* 運動項目選擇 */}
            <div className="pt-2 flex flex-wrap gap-1.5">
              {(['Zone 2 超慢跑', '心肺有氧快走', '高強度間歇 HIIT', '力量抗阻訓練'] as const).map(item => (
                <button
                  key={item}
                  onClick={() => setSelectedExerciseType(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    selectedExerciseType === item
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-950'
                      : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* 運動碼表與心率指針 */}
            <div className="mt-4 rounded-2xl bg-slate-950/80 border border-sky-800/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">訓練持續時間</span>
                  <span className="text-3xl font-black text-white font-mono tracking-wider">
                    {formatTimer(timerSeconds)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">即時運動心率</span>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span className="text-2xl font-black text-rose-400 font-mono">
                      {isTimerRunning ? simulatedHeartRate : 124}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">bpm</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">✓ 完美維持於 Zone 2 燃脂區間</span>
                </div>
              </div>

              {/* 心率區間長條圖 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>熱身 (Zone 1)</span>
                  <span className="text-cyan-400 font-bold">Zone 2 超慢跑長壽心肺</span>
                  <span>無氧間歇 (Zone 4+)</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                  <div className="w-[30%] bg-slate-700" />
                  <div className="w-[40%] bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-sm" />
                  <div className="w-[30%] bg-rose-600/60" />
                </div>
              </div>

              {/* 期望餘生換算回饋 */}
              <div className="rounded-xl bg-emerald-950/30 border border-emerald-800/40 p-2.5 flex items-center justify-between text-xs">
                <span className="text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>預估為自己與家人贏回壽命：</span>
                </span>
                <strong className="text-emerald-300 font-mono font-bold text-sm">
                  +{+(Math.max(1, Math.round(timerSeconds / 60) || 30) / 12).toFixed(1)} 小時
                </strong>
              </div>
            </div>
          </div>

          {/* 碼表控制與存檔按鈕 */}
          <div className="pt-3 space-y-2">
            {syncFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{syncFeedback}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  isTimerRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isTimerRunning ? '暫停計時' : '開始運動'}</span>
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(0);
                }}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>重設碼表</span>
              </button>

              <button
                onClick={handleSaveWorkout}
                className="py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-cyan-200" />
                <span>紀錄並閉合三環</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 3. 今日已完成運動流水帳 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              今日運動與穿戴同步日誌 ({todayExercises.length} 筆)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            今日心肺累計：<strong className="text-sky-400 font-bold font-mono">{todayExerciseMinutes} 分鐘</strong>
          </span>
        </div>

        {todayExercises.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            今日尚未有完成之運動紀錄。點擊上方「開始運動」或「立即連線同步最新穿戴數據」！
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayExercises.map(ex => (
              <div
                key={ex.id}
                className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-3.5 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                      {ex.exerciseType}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1">{ex.sourceDevice}</h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-sky-400 font-mono">{ex.durationMinutes}</span>
                    <span className="text-[10px] text-slate-400 block -mt-1">分鐘</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-center text-slate-400">
                  <div className="bg-slate-900 p-1 rounded border border-slate-800">
                    消耗: <strong className="text-amber-400">{ex.caloriesBurned}</strong> kcal
                  </div>
                  <div className="bg-slate-900 p-1 rounded border border-slate-800">
                    心率: <strong className="text-rose-400">{ex.avgHeartRate}</strong> bpm
                  </div>
                  <div className="bg-slate-900 p-1 rounded border border-slate-800">
                    Zone 2: <strong className="text-cyan-400">{ex.zone2Minutes}</strong> min
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                  <span className="text-emerald-400 font-medium">
                    餘命獎勵 +{ex.lifespanBonusHours} 小時
                  </span>
                  <span className="text-slate-500 font-mono">
                    {new Date(ex.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
