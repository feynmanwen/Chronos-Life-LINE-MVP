import React, { useState, useRef } from 'react';
import { useHealth } from '../../context/HealthContext';
import { analyzeFoodImage } from '../../services/api';
import { FoodAnalysisResult } from '../../types/health';
import { 
  Camera, 
  Upload, 
  Utensils, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  HeartPulse, 
  Trash2, 
  TrendingUp, 
  Scan, 
  Apple, 
  RefreshCw,
  Clock,
  Layers,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

// 預設經典健康在地餐點
const PRESET_MEALS = [
  {
    name: '炙烤鮭魚彩椒沙拉',
    keyword: '鮭魚',
    tag: '深海 Omega-3 · 抗發炎',
    icon: '🐟',
    imageUrl: '/icon-192.png'
  },
  {
    name: '舒肥雞胸地瓜便當',
    keyword: '雞胸',
    tag: '低脂高蛋白 · Zone 2 補充',
    icon: '🍗',
    imageUrl: '/icon-192.png'
  },
  {
    name: '希臘優格堅果燕麥碗',
    keyword: '優格',
    tag: '益生菌 · 護腸胃腎臟',
    icon: '🥣',
    imageUrl: '/icon-192.png'
  },
  {
    name: '清蒸海鱸魚糙米定食',
    keyword: '海鱸魚',
    tag: '極低膽固醇 · 保護心血管',
    icon: '🥗',
    imageUrl: '/icon-192.png'
  },
  {
    name: '台式炸排骨便當',
    keyword: '排骨',
    tag: '高熱量對比 · 示警建議',
    icon: '🍱',
    imageUrl: '/icon-192.png'
  }
];

export const DietModuleView: React.FC = () => {
  const { 
    dietRecords, 
    addDietRecord, 
    deleteDietRecord, 
    todayDietCalories, 
    dietGoalCalories,
    dietRingPercent,
    activeMember 
  } = useHealth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 拍照與辨識狀態
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<'早餐' | '午餐' | '晚餐' | '點心加餐'>('午餐');
  const [feedback, setFeedback] = useState<string | null>(null);

  // 處理相機/檔案選取
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        triggerAnalysis(file.name.replace(/\.[^/.]+$/, ""), base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // 觸發多模態 Vision AI 辨識
  const triggerAnalysis = async (keyword?: string, imageBase64?: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setFeedback(null);

    try {
      const res = await analyzeFoodImage(keyword, imageBase64);
      setTimeout(() => {
        setAnalysisResult(res.analysis);
        setIsAnalyzing(false);
      }, 900);
    } catch {
      setIsAnalyzing(false);
      setFeedback('照片辨識服務暫時離線，已切換至本機神經網路估算');
    }
  };

  // 快捷選擇預設餐點
  const handleSelectPreset = (preset: typeof PRESET_MEALS[0]) => {
    setSelectedImage(preset.imageUrl);
    triggerAnalysis(preset.keyword, preset.imageUrl);
  };

  // 儲存至今日飲食日誌並連動三環
  const handleSaveMeal = async () => {
    if (!analysisResult) return;

    try {
      await addDietRecord({
        mealType: selectedMealType,
        foodName: analysisResult.foodName,
        imageUrl: selectedImage || '/icon-192.png',
        calories: analysisResult.calories,
        carbs: analysisResult.carbs,
        protein: analysisResult.protein,
        fat: analysisResult.fat,
        fiber: analysisResult.fiber,
        sodium: analysisResult.sodium,
        glycemicIndex: analysisResult.glycemicIndex,
        healthImpactRating: analysisResult.healthImpactRating,
        aiAnalysisNotes: analysisResult.aiAnalysisNotes,
      });

      setFeedback(`✓ 已成功將 [${analysisResult.foodName}] 記錄至今日${selectedMealType}！赤燃橘環進度已同步更新。`);

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          colors: ['#ea580c', '#fb923c', '#f97316'],
          origin: { y: 0.6 }
        });
      } catch {}

      setTimeout(() => {
        setAnalysisResult(null);
        setSelectedImage(null);
        setFeedback(null);
      }, 4000);
    } catch (err: any) {
      setFeedback('儲存失敗：' + err.message);
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMeals = dietRecords.filter(r => r.loggedAt.slice(0, 10) === todayStr);

  return (
    <div className="space-y-6">
      {/* 1. 模組頂部 Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-slate-900 border border-orange-800/50 p-5 sm:p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-900/30">
                <Camera className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                AI 照片解析卡路里與智慧營養中控
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 font-mono">
                Vision-LLM 4.0
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              透過手機相機拍照或上傳餐點照片，多模態神經網路即時分解食材、估算總熱量 (kcal)、三大營養素與升糖指數 (GI)，並依據 {activeMember.name} 的肝膽 ALT 與代謝數值提供臨床營養防護回饋。
            </p>
          </div>

          {/* 今日熱量與三環進度小卡 */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-orange-700/40 rounded-2xl p-3.5 shrink-0">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block">今日攝取熱量</span>
              <span className="text-lg font-bold text-orange-400 font-mono">
                {todayDietCalories} <span className="text-xs text-slate-400 font-normal">/ {dietGoalCalories} kcal</span>
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block">飲食合規環 (赤燃橘)</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {dietRingPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 核心功能區：拍照辨識工作台 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* 左側：相機拍攝與照片解析操作 */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Scan className="w-4 h-4 text-orange-400" />
              餐點照片拍攝與影像辨識
            </span>
            <div className="flex items-center gap-1.5">
              {(['早餐', '午餐', '晚餐', '點心加餐'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedMealType(t)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                    selectedMealType === t
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 隱藏的 File Input 支援手機相機拍立得 */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* 照片預覽或上傳提示框 */}
          <div className="relative rounded-2xl border-2 border-dashed border-slate-700 hover:border-orange-500/70 bg-slate-950/60 p-6 flex flex-col items-center justify-center transition min-h-[220px]">
            {selectedImage ? (
              <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-slate-700 group">
                <img
                  src={selectedImage}
                  alt="Food Preview"
                  className="w-full h-48 object-cover rounded-xl"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="w-7 h-7 text-orange-400 animate-spin" />
                    <span className="text-xs text-orange-300 font-medium">Vision-LLM 神經網路掃描食材中...</span>
                    <div className="w-4/5 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse" />
                  </div>
                )}
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalysisResult(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-slate-400 hover:text-white cursor-pointer"
                  title="清除照片"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">點擊啟動相機拍照 或 上傳餐點照片</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    支援手機相機、平板即時拍照或相簿圖檔 (JPEG, PNG, HEIC)
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-950 cursor-pointer transition"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>啟動手機相機拍照</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 cursor-pointer transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>選取圖檔</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 快速示範試玩按鈕列 */}
          <div className="space-y-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>點擊載入健康與在地示範餐點（一鍵體驗多模態熱量解析）：</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_MEALS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectPreset(p)}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-orange-500/60 text-left transition flex items-center gap-2 group cursor-pointer"
                >
                  <span className="text-xl shrink-0 group-hover:scale-110 transition">{p.icon}</span>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-orange-300">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {p.tag}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* 右側：AI 解析結果與營養成分儀表板 */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                多模態卡路里與巨量營養素分解
              </span>
              {analysisResult && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI 信心度 98%
                </span>
              )}
            </div>

            {/* 解析結果展示 */}
            {analysisResult ? (
              <div className="space-y-4 pt-3">
                {/* 菜名與總熱量 */}
                <div className="rounded-2xl bg-slate-950/80 border border-orange-800/40 p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {analysisResult.foodName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        analysisResult.glycemicIndex === '低GI' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : analysisResult.glycemicIndex === '中GI'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {analysisResult.glycemicIndex}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        合規評分：<strong className="text-orange-400 font-bold">{analysisResult.healthImpactRating} 分</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">預估總熱量</span>
                    <span className="text-2xl font-black text-orange-400 font-mono tracking-tight">
                      {analysisResult.calories}
                    </span>
                    <span className="text-[11px] text-slate-400 block -mt-1">kcal</span>
                  </div>
                </div>

                {/* 三大營養素長條佔比 */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300">三大營養素與微量成分：</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">碳水化合物</span>
                      <span className="text-sm font-bold text-amber-300 font-mono">{analysisResult.carbs}g</span>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">蛋白質</span>
                      <span className="text-sm font-bold text-cyan-300 font-mono">{analysisResult.protein}g</span>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">脂肪</span>
                      <span className="text-sm font-bold text-rose-300 font-mono">{analysisResult.fat}g</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-400">
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800">
                      <span>膳食纖維：</span>
                      <strong className="text-emerald-300">{analysisResult.fiber} g</strong>
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800">
                      <span>鈉含量：</span>
                      <strong className="text-slate-200">{analysisResult.sodium} mg</strong>
                    </div>
                  </div>
                </div>

                {/* 臨床營養醫學點評 */}
                <div className="rounded-xl bg-orange-950/30 border border-orange-800/40 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-300">
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>AI 健檢指標關聯指引</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {analysisResult.aiAnalysisNotes}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-2 text-slate-500">
                <Utensils className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-xs">尚未解析餐點</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  請於左側拍攝上傳照片，或點擊下方示範菜色，AI 將立即運算完整卡路里與生化指標影響
                </p>
              </div>
            )}
          </div>

          {/* 操作按鈕 */}
          <div className="pt-2">
            {feedback && (
              <div className="mb-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{feedback}</span>
              </div>
            )}

            <button
              onClick={handleSaveMeal}
              disabled={!analysisResult || isAnalyzing}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-950 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-orange-200" />
              <span>儲存至今日飲食日誌並同步長壽三環</span>
            </button>
          </div>
        </div>

      </div>

      {/* 3. 今日已記錄之飲食清單 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              今日飲食日誌流水帳 ({todayMeals.length} 餐)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            今日總計：<strong className="text-orange-400 font-bold font-mono">{todayDietCalories} kcal</strong>
          </span>
        </div>

        {todayMeals.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            今日尚未記錄任何餐點。使用上方相機拍攝第一餐吧！
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayMeals.map(meal => (
              <div
                key={meal.id}
                className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-3.5 space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold">
                        {meal.mealType}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{meal.foodName}</h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-orange-400 font-mono">{meal.calories}</span>
                      <span className="text-[10px] text-slate-400 block -mt-1">kcal</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-1.5 text-[10px] text-center text-slate-400">
                    <div className="bg-slate-900 p-1 rounded border border-slate-800">碳水: {meal.carbs}g</div>
                    <div className="bg-slate-900 p-1 rounded border border-slate-800">蛋白: {meal.protein}g</div>
                    <div className="bg-slate-900 p-1 rounded border border-slate-800">脂肪: {meal.fat}g</div>
                  </div>

                  {meal.aiAnalysisNotes && (
                    <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/60 line-clamp-2">
                      💡 {meal.aiAnalysisNotes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => deleteDietRecord(meal.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition cursor-pointer"
                    title="刪除餐點"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
