import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useHealth } from '../../context/HealthContext';
import { HealthSystem, OrganSystemInfo } from '../../types/health';
import { Activity, ShieldAlert, Sparkles, RotateCw, ExternalLink } from 'lucide-react';

interface OrganNodeConfig {
  id: HealthSystem;
  name: string;
  chinese: string;
  position: [number, number, number];
  size: number;
}

const ORGAN_NODES: OrganNodeConfig[] = [
  { id: 'heart', name: '心臟循環', chinese: '心', position: [0.15, 0.55, 0.25], size: 0.32 },
  { id: 'lung', name: '呼吸肺部', chinese: '肺', position: [-0.25, 0.65, 0.1], size: 0.36 },
  { id: 'liver', name: '肝膽代謝', chinese: '肝', position: [0.35, 0.15, 0.2], size: 0.38 },
  { id: 'gi', name: '消化腺體', chinese: '腸胃', position: [-0.05, -0.2, 0.25], size: 0.35 },
  { id: 'kidney', name: '腎臟過濾', chinese: '腎', position: [-0.3, -0.05, -0.2], size: 0.28 },
  { id: 'vascular', name: '血管管壁', chinese: '血管', position: [0.0, 0.95, 0.0], size: 0.26 },
  { id: 'joints', name: '骨骼關節', chinese: '關節', position: [-0.4, -0.85, 0.1], size: 0.34 },
];

export const OrganMap3D: React.FC = () => {
  const { organSystems, setActiveTab } = useHealth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<HealthSystem>('liver');
  const [isRotating, setIsRotating] = useState<boolean>(true);

  const selectedInfo: OrganSystemInfo = organSystems[selectedSystem];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 取得容器尺寸
    const width = container.clientWidth;
    const height = 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x34d399, 2.5, 10);
    pointLight.position.set(2, 3, 2);
    scene.add(pointLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(-2, -1, 3);
    scene.add(dirLight);

    // 建立群組
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 建立全息人體軀幹 wireframe
    const bodyGeometry = new THREE.CylinderGeometry(0.7, 0.5, 2.4, 16, 8, true);
    const bodyMaterial = new THREE.MeshBasicMaterial({
      color: 0x334155,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.position.y = 0.05;
    mainGroup.add(bodyMesh);

    // 建立 7 大器官光球節點
    const organMeshes: { id: HealthSystem; mesh: THREE.Mesh }[] = [];

    ORGAN_NODES.forEach(node => {
      const info = organSystems[node.id];
      let colorHex = 0x10b981; // green
      if (info.status === 'critical') colorHex = 0xef4444; // red
      else if (info.status === 'warning') colorHex = 0xf59e0b; // yellow

      // 核心球體
      const geom = new THREE.SphereGeometry(node.size * 0.75, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.4,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(...node.position);
      mesh.userData = { id: node.id };
      mainGroup.add(mesh);
      organMeshes.push({ id: node.id, mesh });

      // 外層脈衝光環
      const ringGeom = new THREE.RingGeometry(node.size * 0.8, node.size * 0.95, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.set(...node.position);
      mainGroup.add(ringMesh);
    });

    // 連結神經回路線條 (經絡網絡)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.3,
    });
    for (let i = 0; i < ORGAN_NODES.length - 1; i++) {
      const p1 = new THREE.Vector3(...ORGAN_NODES[i].position);
      const p2 = new THREE.Vector3(...ORGAN_NODES[i + 1].position);
      const lineGeom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const line = new THREE.Line(lineGeom, lineMaterial);
      mainGroup.add(line);
    }

    // 旋轉互動
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      mainGroup.rotation.y += deltaX * 0.01;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 點擊射線檢測
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = domEl.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(organMeshes.map(o => o.mesh));
      if (intersects.length > 0) {
        const hitId = intersects[0].object.userData.id as HealthSystem;
        if (hitId) {
          setSelectedSystem(hitId);
        }
      }
    };
    domEl.addEventListener('click', onClick);

    // 動畫循環
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (isRotating && !isDragging) {
        mainGroup.rotation.y += 0.008;
      }

      // 脈衝呼吸浮動
      const time = Date.now() * 0.002;
      mainGroup.position.y = Math.sin(time) * 0.04;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      camera.aspect = newW / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [organSystems, isRotating]);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              3D 動態器官風險地圖
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                500萬華人大數據基準
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsRotating(prev => !prev)}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} />
            <span>{isRotating ? '自動旋轉中' : '已鎖定視角'}</span>
          </button>
        </div>
      </div>

      {/* 7 大系統快速切換標籤 */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
        {ORGAN_NODES.map(node => {
          const info = organSystems[node.id];
          const isSelected = selectedSystem === node.id;
          const statusColor = 
            info.status === 'critical' ? 'border-rose-500 text-rose-400 bg-rose-950/30' :
            info.status === 'warning' ? 'border-amber-500 text-amber-400 bg-amber-950/30' :
            'border-emerald-500 text-emerald-400 bg-emerald-950/30';

          return (
            <button
              key={node.id}
              onClick={() => setSelectedSystem(node.id)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium border transition ${
                isSelected 
                  ? `${statusColor} shadow-md scale-105 font-bold` 
                  : 'border-slate-800 text-slate-400 bg-slate-950/50 hover:border-slate-700'
              }`}
            >
              <span className="mr-1">{node.chinese}</span>
              <span className="text-[10px] opacity-80">{info.score}分</span>
            </button>
          );
        })}
      </div>

      {/* 3D 畫布與診斷面板雙欄佈局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* 3D 渲染區域 */}
        <div className="lg:col-span-6 relative flex items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden cursor-grab active:cursor-grabbing">
          <div ref={containerRef} className="w-full h-[280px]" />
          <div className="absolute bottom-2 left-3 text-[10px] text-slate-500 pointer-events-none">
            拖曳可 360° 旋轉 3D 人體全息圖
          </div>
          {/* 燈號圖例 */}
          <div className="absolute top-2 right-3 flex items-center gap-2 text-[10px] bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />正常</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />預警</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" />警戒</span>
          </div>
        </div>

        {/* 選中器官詳情卡 */}
        <div className="lg:col-span-6 flex flex-col justify-between h-full bg-slate-950/40 rounded-xl p-4 border border-slate-800">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  selectedInfo.status === 'critical' ? 'bg-rose-500 animate-ping' :
                  selectedInfo.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                <h4 className="text-base font-bold text-white">{selectedInfo.name}</h4>
              </div>
              
              {/* 生物老化倍數標籤 */}
              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${
                selectedInfo.bioAgingMultiplier > 1.2
                  ? 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                  : selectedInfo.bioAgingMultiplier > 1.05
                  ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>生物老化倍數：{selectedInfo.bioAgingMultiplier}x</span>
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
              <span className="font-semibold text-cyan-400">臨床大數據評估：</span>
              {selectedInfo.findings}
            </div>

            <div className="mt-2 text-xs text-slate-400 leading-relaxed">
              <span className="text-slate-300 font-medium">500萬華人基線關聯：</span>
              {selectedInfo.riskDescription}
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1">
              <span className="text-[10px] text-slate-500 mr-1">關聯核心指標:</span>
              {selectedInfo.keyMetrics.map((km, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {km}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{selectedInfo.doctorSummaryTip}</span>
            </div>
            <button
              onClick={() => setActiveTab('trends')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition"
            >
              <span>查看指標趨勢</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
