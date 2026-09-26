import React, { useRef, useEffect } from 'react';
import { useHealth } from '../../context/HealthContext';
import { TreePine, Leaf, Moon, Footprints, AlertTriangle } from 'lucide-react';

export const DynamicLifeTree: React.FC = () => {
  const { activeMember, activeTasks, activeRecords } = useHealth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 判斷樹木生命狀態
  const hasCritical = activeRecords.some(r => r.trendClassification === 'abnormal_worsening');
  const taskCompletionRate = activeTasks.length > 0 
    ? activeTasks.filter(t => t.isCompletedToday).length / activeTasks.length 
    : 0.5;

  const isHealthy = activeMember.healthScore >= 75 && !hasCritical;
  const isWithered = activeMember.healthScore < 65 || hasCritical;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let windAngle = 0;

    const renderTree = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const startX = canvas.width / 2;
      const startY = canvas.height - 15;
      const trunkLength = 48;
      const angle = -Math.PI / 2;

      windAngle += 0.03;
      const currentWind = Math.sin(windAngle) * 0.03;

      // 繪製樹枝與葉片之遞迴函數
      const drawBranch = (x: number, y: number, length: number, curAngle: number, depth: number) => {
        if (depth === 0) {
          // 繪製葉片與新芽
          const leafCount = isHealthy ? 4 : isWithered ? 1 : 2;
          for (let i = 0; i < leafCount; i++) {
            ctx.beginPath();
            const leafOffset = (i - (leafCount - 1) / 2) * 6;
            const leafX = x + Math.cos(curAngle) * leafOffset;
            const leafY = y + Math.sin(curAngle) * leafOffset;

            ctx.arc(leafX, leafY, isHealthy ? 4.5 : 3, 0, Math.PI * 2);

            if (isHealthy) {
              // 翠綠新芽
              ctx.fillStyle = i === 0 ? '#34d399' : '#10b981';
            } else if (isWithered) {
              // 發黃枯萎
              ctx.fillStyle = i === 0 ? '#d97706' : '#b45309';
            } else {
              // 混合綠黃
              ctx.fillStyle = '#84cc16';
            }
            ctx.fill();
          }
          return;
        }

        const endX = x + Math.cos(curAngle + currentWind * (5 - depth)) * length;
        const endY = y + Math.sin(curAngle + currentWind * (5 - depth)) * length;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = depth > 3 ? '#78350f' : '#92400e';
        ctx.lineWidth = depth * 1.6;
        ctx.lineCap = 'round';
        ctx.stroke();

        const branchSub = 2;
        const spread = 0.45;

        drawBranch(endX, endY, length * 0.76, curAngle - spread + currentWind * 0.5, depth - 1);
        drawBranch(endX, endY, length * 0.76, curAngle + spread + currentWind * 0.5, depth - 1);
      };

      // 繪製泥土基座
      ctx.beginPath();
      ctx.ellipse(startX, startY + 5, 55, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#334155';
      ctx.fill();

      // 展開生長
      drawBranch(startX, startY, trunkLength, angle, 4);

      animationFrameId = requestAnimationFrame(renderTree);
    };

    renderTree();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHealthy, isWithered]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TreePine className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              動態生命樹
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-medium ${
                isHealthy 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : isWithered 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-lime-500/20 text-lime-300 border border-lime-500/30'
              }`}>
                {isHealthy ? '枝繁葉茂・生機萌發' : isWithered ? '葉片發黃・需及時護理' : '平穩生長'}
              </span>
            </h3>
          </div>
        </div>
        <div className="text-right text-xs">
          <span className="text-slate-400">樹木活力</span>
          <span className="ml-1 text-emerald-400 font-bold">{activeMember.healthScore}%</span>
        </div>
      </div>

      {/* Canvas 畫布 */}
      <div className="relative my-2 flex items-center justify-center h-44">
        <canvas 
          ref={canvasRef} 
          width={260} 
          height={175} 
          className="w-full max-w-[260px] h-[175px]"
        />

        {/* 情感狀態反饋徽章 */}
        <div className="absolute bottom-1 right-2">
          {isHealthy ? (
            <div className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-md backdrop-blur">
              <Leaf className="w-3 h-3 text-emerald-400 animate-bounce" />
              <span>今日打卡孕育新芽</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded-md backdrop-blur">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>長期紅字導致葉片偏黃</span>
            </div>
          )}
        </div>
      </div>

      {/* 生理滋養維度 */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-1 bg-slate-950/40 p-1.5 rounded-lg">
          <Moon className="w-3 h-3 text-indigo-400" />
          <span>睡眠 {activeMember.sleepHoursDaily}h</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-950/40 p-1.5 rounded-lg">
          <Footprints className="w-3 h-3 text-teal-400" />
          <span>{activeMember.dailySteps.toLocaleString()} 步</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-950/40 p-1.5 rounded-lg">
          <Leaf className="w-3 h-3 text-emerald-400" />
          <span>打卡 {Math.round(taskCompletionRate * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
