import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  FamilyMember, 
  LabRecordItem, 
  LifeEvent, 
  FittVpTask, 
  HealthSystem, 
  OrganSystemInfo, 
  RedFlagInterception,
  GoldenCaseId,
  DietRecord,
  ExerciseRecord,
  WearableDeviceData
} from '../types/health';
import { INITIAL_MEMBERS } from '../data/initialMembers';
import { GOLDEN_CASE_A, GOLDEN_CASE_B, GOLDEN_CASE_C } from '../data/goldenCases';
import { evaluateOrganSystems, classifyTrend } from '../utils/trendAnalyzer';
import { checkRedFlagKeywords } from '../utils/redFlagDetector';
import { exportHealthAssetsToCSV } from '../utils/csvExporter';
import { useAuth } from './AuthContext';
import { 
  fetchMembers,
  fetchDietRecords,
  createDietRecord,
  removeDietRecord,
  fetchExerciseRecords,
  createExerciseRecord,
  syncWearableTelemetry
} from '../services/api';
import confetti from 'canvas-confetti';

export type AppTab = 'dashboard' | 'diet' | 'exercise' | 'trends' | 'audit' | 'fittvp' | 'chat' | 'settings';
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
  isUserManagementOpen: boolean;
  setIsUserManagementOpen: (open: boolean) => void;

  // Actions
  refreshMembers: () => Promise<void>;
  toggleTaskCheckin: (taskId: string) => void;
  addRecord: (record: Omit<LabRecordItem, 'id'>) => void;
  updateRecord: (id: string, updates: Partial<LabRecordItem>) => void;
  deleteRecord: (id: string) => void;
  purgeAccount: (memberId: string) => void;
  addLifeEvent: (event: Omit<LifeEvent, 'id'>) => void;
  loadGoldenCase: (caseId: GoldenCaseId) => void;
  exportCsv: () => void;

  // 飲食模組
  dietRecords: DietRecord[];
  addDietRecord: (record: Partial<DietRecord>) => Promise<DietRecord>;
  deleteDietRecord: (id: string) => Promise<void>;
  todayDietCalories: number;
  dietGoalCalories: number;
  dietRingPercent: number;

  // 運動模組與穿戴裝置
  exerciseRecords: ExerciseRecord[];
  addExerciseRecord: (record: Partial<ExerciseRecord>) => Promise<ExerciseRecord>;
  todayExerciseMinutes: number;
  exerciseGoalMinutes: number;
  exerciseRingPercent: number;
  wearableDevice: WearableDeviceData | null;
  syncWearable: (device?: string) => Promise<WearableDeviceData>;
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
  const { user } = useAuth();
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
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  // 飲食與運動數據狀態
  const [dietRecords, setDietRecords] = useState<DietRecord[]>([]);
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecord[]>([]);
  const [wearableDevice, setWearableDevice] = useState<WearableDeviceData | null>(null);

  // 載入飲食與運動數據
  useEffect(() => {
    let isMounted = true;
    async function loadDietAndExercise() {
      try {
        const [dRecs, eRecs] = await Promise.all([
          fetchDietRecords(activeMemberId),
          fetchExerciseRecords(activeMemberId)
        ]);
        if (isMounted) {
          setDietRecords(dRecs);
          setExerciseRecords(eRecs);
        }
      } catch {}
    }
    loadDietAndExercise();
    return () => { isMounted = false; };
  }, [activeMemberId]);

  // 新增飲食紀錄
  const addDietRecord = async (record: Partial<DietRecord>): Promise<DietRecord> => {
    const created = await createDietRecord({
      ...record,
      memberId: activeMemberId,
      userId: user?.id
    });
    setDietRecords(prev => [created, ...prev]);
    return created;
  };

  // 刪除飲食紀錄
  const deleteDietRecord = async (id: string): Promise<void> => {
    await removeDietRecord(id);
    setDietRecords(prev => prev.filter(r => r.id !== id));
  };

  // 新增運動紀錄
  const addExerciseRecord = async (record: Partial<ExerciseRecord>): Promise<ExerciseRecord> => {
    const created = await createExerciseRecord({
      ...record,
      memberId: activeMemberId,
      userId: user?.id
    });
    setExerciseRecords(prev => [created, ...prev]);
    return created;
  };

  // 穿戴裝置即時同步
  const syncWearable = async (device: string = 'Apple Watch Ultra 2'): Promise<WearableDeviceData> => {
    const telemetry = await syncWearableTelemetry(device, activeMemberId);
    setWearableDevice(telemetry);
    if (telemetry.zone2MinutesToday > 0) {
      await addExerciseRecord({
        exerciseType: 'Zone 2 超慢跑',
        sourceDevice: device as any,
        durationMinutes: telemetry.zone2MinutesToday,
        caloriesBurned: telemetry.activeCaloriesKcal,
        avgHeartRate: 122,
        zone2Minutes: telemetry.zone2MinutesToday,
        steps: telemetry.dailySteps,
        lifespanBonusHours: +(telemetry.zone2MinutesToday / 12).toFixed(1)
      });
    }
    return telemetry;
  };

  // 今日卡路里與三環動態進度計算
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDietMeals = dietRecords.filter(r => r.loggedAt.slice(0, 10) === todayStr);
  const todayDietCalories = todayDietMeals.reduce((sum, r) => sum + r.calories, 0);
  const dietGoalCalories = 1800; // 目標大卡
  const dietRingPercent = todayDietMeals.length > 0 
    ? Math.min(100, Math.round((todayDietMeals.reduce((s, m) => s + m.healthImpactRating, 0) / todayDietMeals.length)))
    : 82;

  const todayExerciseList = exerciseRecords.filter(r => r.loggedAt.slice(0, 10) === todayStr);
  const todayExerciseMinutes = todayExerciseList.reduce((sum, r) => sum + r.durationMinutes, 0);
  const exerciseGoalMinutes = 30; // 每日 30 分鐘微習慣
  const exerciseRingPercent = todayExerciseList.length > 0
    ? Math.min(100, Math.round((todayExerciseMinutes / exerciseGoalMinutes) * 100))
    : 85;

  // 重新整理並同步家庭成員清單 (SQLite 與 本地快取雙向連動)
  const refreshMembers = async () => {
    try {
      const serverMembers = await fetchMembers();
      if (serverMembers && Array.isArray(serverMembers) && serverMembers.length > 0) {
        setMembers(prev => {
          const map = new Map<string, FamilyMember>();
          serverMembers.forEach(m => map.set(m.id, m));
          prev.forEach(m => {
            if (!map.has(m.id)) map.set(m.id, m);
          });
          return Array.from(map.values());
        });
      }
    } catch {
      // 保持目前 members
    }
  };

  // 當使用者登入身分變更時，自動聚焦切換至該使用者的專屬健康檔案
  useEffect(() => {
    if (!user) return;

    setMembers(currentMembers => {
      // 檢查是否已有該用戶姓名之檔案
      const matched = currentMembers.find(m => 
        m.name.includes(user.name) || 
        m.name.split(' ')[0] === user.name.split(' ')[0]
      );

      if (matched) {
        setActiveMemberId(matched.id);
        return currentMembers;
      }

      // 若為新註冊會員或管理者，立即建立專屬成員健康資產
      const newMember: FamilyMember = {
        id: 'member-' + (user.id || Date.now()),
        name: `${user.name} (${user.role || '本人'})`,
        role: user.role || '本人',
        age: 35,
        gender: 'M',
        baseLifeExpectancyYears: 42.5,
        dynamicBonusYears: 1.5,
        nextClinicDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        nextClinicDepartment: '家醫科 / 預防醫學',
        nextClinicDoctor: '陳建國 主治醫師',
        companionNotes: '新註冊會員，建議預約初診建立基線健檢資料。',
        sleepHoursDaily: 7.0,
        dailySteps: 6000,
        spo2: 98,
        restingHeartRate: 72,
        healthScore: 75,
      };

      setActiveMemberId(newMember.id);
      return [newMember, ...currentMembers];
    });

    refreshMembers();
  }, [user?.id, user?.name]);

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

  // 初次載入 SQLite 數據
  useEffect(() => {
    refreshMembers();

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
        isUserManagementOpen,
        setIsUserManagementOpen,
        refreshMembers,
        toggleTaskCheckin,
        addRecord,
        updateRecord,
        deleteRecord,
        purgeAccount,
        addLifeEvent,
        loadGoldenCase,
        exportCsv,
        dietRecords,
        addDietRecord,
        deleteDietRecord,
        todayDietCalories,
        dietGoalCalories,
        dietRingPercent,
        exerciseRecords,
        addExerciseRecord,
        todayExerciseMinutes,
        exerciseGoalMinutes,
        exerciseRingPercent,
        wearableDevice,
        syncWearable,
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
