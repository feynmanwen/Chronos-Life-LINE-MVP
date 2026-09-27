export type HealthSystem = 
  | 'heart'       // 心 (心血管循環)
  | 'lung'        // 肺 (呼吸系統)
  | 'kidney'      // 腎 (腎臟過濾)
  | 'liver'       // 肝 (肝膽代謝)
  | 'vascular'    // 血管 (血壓與管壁)
  | 'joints'      // 關節 (骨骼肌力)
  | 'gi';         // 腸胃 (消化吸收)

export type HealthStatusLevel = 'normal' | 'warning' | 'critical';

export interface OrganSystemInfo {
  id: HealthSystem;
  name: string;
  chineseName: string;
  score: number; // 0 - 100
  status: HealthStatusLevel;
  bioAgingMultiplier: number; // 生物老化倍數，例如 1.25x
  keyMetrics: string[];
  findings: string;
  riskDescription: string;
  doctorSummaryTip: string;
}

export type TrendDirection = 
  | 'abnormal_worsening'  // 優先級 1: 異常且持續惡化 (高危險警訊，需引導至就醫溝通摘要)
  | 'normal_worsening'    // 優先級 2: 正常但持續惡化 (早期預警，觸發生活型態調整任務)
  | 'abnormal_improving'  // 優先級 3: 異常但已改善 (激勵回饋，顯示健康資產增值)
  | 'stable_normal';      // 穩定正常

export interface LabRecordItem {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  hospital: string;
  system: HealthSystem;
  code: string; // e.g. 'ALT', 'T-SCORE', 'BI-RADS', 'HbA1c', 'LDL-C'
  standardName: string; // 統一標準名: 丙胺酸轉胺酶 (ALT)
  originalReportName: string; // PRD 3.2: 必須保留原始報告名稱以供溯源 (例如 'GPT', '飯前血糖')
  value: number | string;
  numericValue?: number;
  unit: string;
  referenceInterval: string; // PRD 3.2 參考區間金律: 嚴禁套用單一標準值，保留原始報告參考區間
  isAbnormal: boolean;
  trendClassification: TrendDirection;
  isPendingAudit: boolean; // 數據核對工作台: 若信心度低則標記待核對
  confidenceScore: number; // 0.0 - 1.0 (例如 0.65 標為待核對)
  reportPage: number; // 原始報告頁碼
  cropCoordinates?: { x: number; y: number; width: number; height: number };
  cropImageLabel: string;
  examModality?: string; // e.g. '乳房 X 光攝影', '乳房超音波', 'DXA 骨密度掃描'
  auditNotes?: string;
}

export interface LifeEvent {
  id: string;
  memberId: string;
  date: string;
  title: string;
  type: 'medication' | 'surgery' | 'lifestyle' | 'milestone';
  description: string;
  aiCorrelationInsight: string; // AI 自動分析行為變更與指標波動之關聯性
}

export interface FittVpTask {
  id: string;
  memberId: string;
  title: string;
  relatedMetric: string;
  system: HealthSystem;
  f_frequency: string; // F (Frequency)
  i_intensity: string; // I (Intensity)
  t_time: string;      // T (Time)
  t_type: string;      // T (Type)
  v_volume: string;    // V (Volume)
  p_progression: string; // P (Progression)
  restrictionWarning?: string; // 跌倒或運動禁忌說明 (如骨質疏鬆禁高衝擊)
  isCompletedToday: boolean;
  streakDays: number;
  totalTargetDays: number; // 30 天微習慣
  completedHistory: string[]; // YYYY-MM-DD[]
}

export interface CommunityResource {
  id: string;
  name: string;
  type: 'sports' | 'nutrition' | 'screening';
  categoryLabel: string;
  distance: string;
  address: string;
  feeInfo: string;
  description: string;
  phone: string;
  tags: string[];
  eligibilityNote?: string; // 例如: 符合 40 歲以上成人預防保健免費資格
}

export interface FamilyMember {
  id: string;
  name: string;
  role: '本人' | '父親' | '母親' | '配偶' | '子女' | '照護者' | '醫師 / 管理員' | string;
  age: number;
  gender: 'M' | 'F';
  baseLifeExpectancyYears: number; // 預估基準餘命年數
  dynamicBonusYears: number; // 良好生活型態獎勵額外年數
  nextClinicDate: string; // 下次陪診/複檢日期 YYYY-MM-DD
  nextClinicDepartment: string;
  nextClinicDoctor?: string;
  companionNotes: string;
  sleepHoursDaily: number;
  dailySteps: number;
  spo2: number;
  restingHeartRate: number;
  healthScore: number;
}

export type GoldenCaseId = 'caseA' | 'caseB' | 'caseC';

export interface OCRResultItem {
  itemName: string;
  rawValue: string;
  unit: string;
  referenceRange: string;
  confidence: number;
  isAbnormal: boolean;
  cropImageLabel: string;
}

export interface RedFlagInterception {
  isTriggered: boolean;
  matchedKeywords: string[];
  alertTitle: string;
  alertMessage: string;
  emergencyPhone: string;
  nearbyHospitals: { name: string; distance: string; phone: string; mapsUrl: string }[];
}
