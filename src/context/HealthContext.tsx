import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  FamilyMember, 
  LabRecordItem, 
  LifeEvent, 
  FittVpTask, 
  HealthSystem, 
  OrganSystemInfo, 
  RedFlagInterception,
  GoldenCaseId
} from '../types/health';
import { INITIAL_MEMBERS } from '../data/initialMembers';
import { GOLDEN_CASE_A, GOLDEN_CASE_B, GOLDEN_CASE_C } from '../data/goldenCases';
import { evaluateOrganSystems, classifyTrend } from '../utils/trendAnalyzer';
import { checkRedFlagKeywords } from '../utils/redFlagDetector';
import { exportHealthAssetsToCSV } from '../utils/csvExporter';
import confetti from 'canvas-confetti';

export type AppTab = 'dashboard' | 'audit' | 'trends' | 'fittvp' | 'chat' | 'settings';
export type ViewMode = 'mobile' | 'desktop';

interface HealthContextType {
  members: FamilyMember[];
  activeMemberId: string;
  activeMember: FamilyMember;
  setActiveMemberId: (id: string) => void;
  records: LabRecordItem[];
  activeRecords: LabRecordItem[];
  events: LifeEvent[];
  activeEvents: LifeEvent[];
  tasks: FittVpTask[];
  activeTasks: FittVpTask[];
  organSystems: Record<HealthSystem, OrganSystemInfo>;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  
  // Modals & Tracing
  redFlagModal: { isOpen: boolean; interception: RedFlagInterception | null };
  closeRedFlagModal: () => void;
  triggerRedFlagCheck: (input: string) => boolean;
  selectedRecordForTrace: LabRecordItem | null;
  setSelectedRecordForTrace: (rec: LabRecordItem | null) => void;
  isDoctorSummaryOpen: boolean;
  setIsDoctorSummaryOpen: (open: boolean) => void;
  isAuditWorkbenchOpen: boolean;
  setIsAuditWorkbenchOpen: (open: boolean) => void;
  isIngestionModalOpen: boolean;
  setIsIngestionModalOpen: (open: boolean) => void;
  isWearableModalOpen: boolean;
  setIsWearableModalOpen: (open: boolean) => void;
  isPrivacyModalOpen: boolean;
  setIsPrivacyModalOpen: (open: boolean) => void;

  // Actions
  toggleTaskCheckin: (taskId: string) => void;
  addRecord: (record: Omit<LabRecordItem, 'id'>) => void;
  updateRecord: (id: string, updates: Partial<LabRecordItem>) => void;
  deleteRecord: (id: string) => void;
  purgeAccount: (memberId: string) => void;
  addLifeEvent: (event: Omit<LifeEvent, 'id'>) => void;
  loadGoldenCase: (caseId: GoldenCaseId) => void;
  exportCsv: () => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

// 組合初始預設資料集
const ALL_INITIAL_RECORDS: LabRecordItem[] = [
  ...GOLDEN_CASE_A.labRecords,
  ...GOLDEN_CASE_B.labRecords,
  ...GOLDEN_CASE_C.labRecords,
];

const ALL_INITIAL_EVENTS: LifeEvent[] = [
  ...GOLDEN_CASE_A.events,
  ...GOLDEN_CASE_B.events,
  ...GOLDEN_CASE_C.events,
];

const ALL_INITIAL_TASKS: FittVpTask[] = [
  ...GOLDEN_CASE_A.recommendedTasks,
  ...GOLDEN_CASE_B.recommendedTasks,
  ...GOLDEN_CASE_C.recommendedTasks,
];

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('chronos_members_v13');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [activeMemberId, setActiveMemberId] = useState<string>('member-1');

  const [records, setRecords] = useState<LabRecordItem[]>(() => {
    const saved = localStorage.getItem('chronos_records_v13');
    return saved ? JSON.parse(saved) : ALL_INITIAL_RECORDS;
  });

  const [events, setEvents] = useState<LifeEvent[]>(() => {
    const saved = localStorage.getItem('chronos_events_v13');
    return saved ? JSON.parse(saved) : ALL_INITIAL_EVENTS;
  });

  const [tasks, setTasks] = useState<FittVpTask[]>(() => {
    const saved = localStorage.getItem('chronos_tasks_v13');
    return saved ? JSON.parse(saved) : ALL_INITIAL_TASKS;
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return 'desktop'; // 平板與寬螢幕預設為雙欄工作台介面
    }
    return 'mobile'; // 手機預設為行動介面
  });
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  // Modals
  const [redFlagModal, setRedFlagModal] = useState<{ isOpen: boolean; interception: RedFlagInterception | null }>({
    isOpen: false,
    interception: null,
  });
  const [selectedRecordForTrace, setSelectedRecordForTrace] = useState<LabRecordItem | null>(null);
  const [isDoctorSummaryOpen, setIsDoctorSummaryOpen] = useState(false);
  const [isAuditWorkbenchOpen, setIsAuditWorkbenchOpen] = useState(false);
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState(false);
  const [isWearableModalOpen, setIsWearableModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('chronos_members_v13', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('chronos_records_v13', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('chronos_events_v13', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('chronos_tasks_v13', JSON.stringify(tasks));
  }, [tasks]);

  // 嘗試從後台 SQLite 資料庫載入成員與最新健檢紀錄
  useEffect(() => {
    fetch('/api/members')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setMembers(data);
        }
      })
      .catch(() => {});

    fetch('/api/records')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setRecords(data);
        }
      })
      .catch(() => {});
  }, []);

  const activeMember = members.find(m => m.id === activeMemberId) || members[0];
  const activeRecords = records.filter(r => r.memberId === activeMemberId);
  const activeEvents = events.filter(e => e.memberId === activeMemberId);
  const activeTasks = tasks.filter(t => t.memberId === activeMemberId);

  const organSystems = evaluateOrganSystems(activeRecords);

  // 紅旗關鍵字攔截檢查
  const triggerRedFlagCheck = (input: string): boolean => {
    const check = checkRedFlagKeywords(input);
    if (check.isTriggered) {
      setRedFlagModal({ isOpen: true, interception: check });
      return true;
    }
    return false;
  };

  const closeRedFlagModal = () => {
    setRedFlagModal({ isOpen: false, interception: null });
  };

  // 任務每日打卡
  const toggleTaskCheckin = (taskId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const isNowCompleted = !t.isCompletedToday;
      const newHistory = isNowCompleted 
        ? (t.completedHistory.includes(today) ? t.completedHistory : [...t.completedHistory, today])
        : t.completedHistory.filter(d => d !== today);

      if (isNowCompleted) {
        // 觸發打卡撒花效果
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 }
          });
        } catch (_) {}
      }

      return {
        ...t,
        isCompletedToday: isNowCompleted,
        streakDays: isNowCompleted ? t.streakDays + 1 : Math.max(0, t.streakDays - 1),
        completedHistory: newHistory,
      };
    }));

    // 動態增加餘命時間與健康分數
    setMembers(prev => prev.map(m => {
      if (m.id !== activeMemberId) return m;
      return {
        ...m,
        dynamicBonusYears: Number((m.dynamicBonusYears + 0.05).toFixed(2)),
        healthScore: Math.min(99, m.healthScore + 1)
      };
    }));
  };

  const addRecord = (record: Omit<LabRecordItem, 'id'>) => {
    const newRec: LabRecordItem = {
      ...record,
      id: `rec-${Date.now()}`,
    };
    setRecords(prev => [newRec, ...prev]);

    // 同步寫入後台 SQLite
    fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRec),
    }).catch(() => {});
  };

  const updateRecord = (id: string, updates: Partial<LabRecordItem>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const purgeAccount = (memberId: string) => {
    setRecords(prev => prev.filter(r => r.memberId !== memberId));
    setEvents(prev => prev.filter(e => e.memberId !== memberId));
    setTasks(prev => prev.filter(t => t.memberId !== memberId));
    setMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      return {
        ...m,
        healthScore: 50,
        dynamicBonusYears: 0,
      };
    }));
  };

  const addLifeEvent = (event: Omit<LifeEvent, 'id'>) => {
    const newEvent: LifeEvent = {
      ...event,
      id: `event-${Date.now()}`,
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const loadGoldenCase = (caseId: GoldenCaseId) => {
    if (caseId === 'caseA') {
      setActiveMemberId('member-1');
      setActiveTab('dashboard');
    } else if (caseId === 'caseB') {
      setActiveMemberId('member-3');
      setActiveTab('dashboard');
    } else if (caseId === 'caseC') {
      setActiveMemberId('member-4');
      setActiveTab('dashboard');
    }
  };

  const exportCsv = () => {
    exportHealthAssetsToCSV(activeMember, activeRecords, activeEvents);
  };

  return (
    <HealthContext.Provider
      value={{
        members,
        activeMemberId,
        activeMember,
        setActiveMemberId,
        records,
        activeRecords,
        events,
        activeEvents,
        tasks,
        activeTasks,
        organSystems,
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab,
        redFlagModal,
        closeRedFlagModal,
        triggerRedFlagCheck,
        selectedRecordForTrace,
        setSelectedRecordForTrace,
        isDoctorSummaryOpen,
        setIsDoctorSummaryOpen,
        isAuditWorkbenchOpen,
        setIsAuditWorkbenchOpen,
        isIngestionModalOpen,
        setIsIngestionModalOpen,
        isWearableModalOpen,
        setIsWearableModalOpen,
        isPrivacyModalOpen,
        setIsPrivacyModalOpen,
        toggleTaskCheckin,
        addRecord,
        updateRecord,
        deleteRecord,
        purgeAccount,
        addLifeEvent,
        loadGoldenCase,
        exportCsv,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = (): HealthContextType => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
