import React from 'react';
import { useHealth, AppTab } from '../../context/HealthContext';
import { 
  Activity, 
  Utensils, 
  Watch, 
  TrendingUp, 
  MessageSquare, 
  Settings,
  ShieldAlert
} from 'lucide-react';

interface RichMenuItem {
  id: AppTab;
  label: string;
  subLabel: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}

const MENU_ITEMS: RichMenuItem[] = [
  { id: 'dashboard', label: '策略儀表板', subLabel: '3D器官/生命樹', icon: Activity, color: 'text-emerald-400' },
  { id: 'diet', label: '智慧飲食', subLabel: '照片解析卡路里', icon: Utensils, color: 'text-orange-400' },
  { id: 'exercise', label: '運動穿戴', subLabel: 'Zone 2/步數同步', icon: Watch, color: 'text-sky-400' },
  { id: 'trends', label: '長期監控', subLabel: '熱量天平/生化逆轉', icon: TrendingUp, color: 'text-indigo-400' },
  { id: 'chat', label: 'LINE AI諮詢', subLabel: '急症紅旗防衛', icon: MessageSquare, color: 'text-green-400' },
  { id: 'settings', label: '社區與設定', subLabel: '資源/資安匯出', icon: Settings, color: 'text-purple-400' },
];

export const RichMenu: React.FC = () => {
  const { activeTab, setActiveTab, setIsAuditWorkbenchOpen } = useHealth();

  const handleTabClick = (tab: AppTab) => {
    if (tab === 'audit') {
      setIsAuditWorkbenchOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="bg-slate-950 border-t border-slate-800 shadow-2xl">
      <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-slate-800/80">
        {MENU_ITEMS.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`p-2.5 sm:p-3 flex flex-col items-center justify-center gap-1 transition relative group ${
                isActive
                  ? 'bg-slate-900/90 text-white shadow-inner'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                {item.label}
              </span>
              <span className="text-[9px] text-slate-500 scale-90 hidden sm:block">
                {item.subLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
