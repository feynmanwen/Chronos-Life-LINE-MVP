import { LabRecordItem, TrendDirection, HealthSystem, OrganSystemInfo } from '../types/health';

/**
 * 判斷檢驗數值之趨勢分類 (符合 PRD 4.2 三級優先權原則)
 */
export function classifyTrend(records: LabRecordItem[]): TrendDirection {
  if (!records || records.length === 0) return 'stable_normal';

  // 排序：由舊到新
  const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latest = sorted[sorted.length - 1];

  if (sorted.length === 1) {
    if (latest.isAbnormal) return 'abnormal_worsening';
    return 'stable_normal';
  }

  const prev = sorted[sorted.length - 2];
  const latestNum = latest.numericValue ?? (typeof latest.value === 'number' ? latest.value : 0);
  const prevNum = prev.numericValue ?? (typeof prev.value === 'number' ? prev.value : 0);

  // 針對 T-Score 這種越小越危險的指標
  const isTScore = latest.code.toUpperCase().includes('T-SCORE');
  const isWorsening = isTScore ? latestNum < prevNum : latestNum > prevNum;
  const isImproving = isTScore ? latestNum > prevNum : latestNum < prevNum;

  // 優先級 1: 異常且持續惡化
  if (latest.isAbnormal && isWorsening) {
    return 'abnormal_worsening';
  }

  // 優先級 2: 正常但持續惡化 (PRD 1.2 早期預警)
  if (!latest.isAbnormal && isWorsening) {
    return 'normal_worsening';
  }

  // 優先級 3: 異常但已改善
  if (prev.isAbnormal && isImproving) {
    return 'abnormal_improving';
  }

  if (latest.isAbnormal) {
    return 'abnormal_worsening';
  }

  return 'stable_normal';
}

/**
 * 計算 7 大系統的健康評估、器官等級與生物老化倍數
 * 基準：以 500 萬華人健康大數據為基線 (PRD 4.1)
 */
export function evaluateOrganSystems(records: LabRecordItem[]): Record<HealthSystem, OrganSystemInfo> {
  const baseSystems: Record<HealthSystem, OrganSystemInfo> = {
    heart: {
      id: 'heart',
      name: '心臟循環系統',
      chineseName: '心',
      score: 85,
      status: 'normal',
      bioAgingMultiplier: 0.95,
      keyMetrics: ['靜息心率', '心電圖', 'BNP', '左心室射出分率'],
      findings: '心肌收縮力良好，微血管循環充沛無缺血跡象。',
      riskDescription: '近一年無心悸或胸悶，心血管風險評級為極低。',
      doctorSummaryTip: '持續維持每週 150 分鐘中強度有氧運動以保持心肌彈性。',
    },
    lung: {
      id: 'lung',
      name: '肺部呼吸系統',
      chineseName: '肺',
      score: 88,
      status: 'normal',
      bioAgingMultiplier: 0.92,
      keyMetrics: ['SpO2 血氧', '肺活量 (FVC)', '第一秒用力呼氣量 (FEV1)'],
      findings: '常態血氧維持 98% 以上，無慢性阻塞或過敏性發炎。',
      riskDescription: '未接觸吸菸或嚴重粉塵環境，肺泡換氣效率維持同齡前 20%。',
      doctorSummaryTip: '定期防範空污 PM2.5，建議春秋換季時施打公費流感疫苗。',
    },
    kidney: {
      id: 'kidney',
      name: '腎臟過濾系統',
      chineseName: '腎',
      score: 82,
      status: 'normal',
      bioAgingMultiplier: 1.02,
      keyMetrics: ['肌酸酐 (Cr)', '腎絲球過濾率 (eGFR)', '尿蛋白', '尿酸'],
      findings: '腎絲球過濾率 eGFR > 95 ml/min，尿蛋白呈陰性反應。',
      riskDescription: '長期血壓與血糖控制良好，腎臟微血管未受高壓破壞。',
      doctorSummaryTip: '每日維持 2000ml 充足飲水，避免長期服用未經處方之止痛消炎藥。',
    },
    liver: {
      id: 'liver',
      name: '肝膽代謝系統',
      chineseName: '肝',
      score: 70,
      status: 'normal',
      bioAgingMultiplier: 1.05,
      keyMetrics: ['ALT (GPT)', 'AST (GOT)', 'γ-GT', '腹部超音波'],
      findings: '近期生化指標偏高，提示肝細胞輕微受損或脂肪沉積。',
      riskDescription: '華人大數據提示：ALT 連續 2 年攀升者，5 年內轉變為中度脂肪肝風險提高 3.2 倍。',
      doctorSummaryTip: '回診時主動出示近三年 ALT 跨院折線圖，討論是否安排肝纖維化超音波掃描。',
    },
    vascular: {
      id: 'vascular',
      name: '血管壁與微循環系統',
      chineseName: '血管',
      score: 75,
      status: 'normal',
      bioAgingMultiplier: 1.08,
      keyMetrics: ['血壓 (收縮/舒張)', '低密度膽固醇 (LDL-C)', '高敏感度 CRP', '脈波傳導速度 (baPWV)'],
      findings: '血管壁彈性輕度緊繃，低密度脂蛋白微幅超標。',
      riskDescription: '動脈內膜動態平穩，但若合併代謝指標異常需提防粥狀硬化。',
      doctorSummaryTip: '減少飽和脂肪酸與油炸類食物，建議每季追蹤血脂四項。',
    },
    joints: {
      id: 'joints',
      name: '關節與骨骼肌力系統',
      chineseName: '關節',
      score: 68,
      status: 'warning',
      bioAgingMultiplier: 1.28, // 老化倍數偏高
      keyMetrics: ['DXA 骨質密度 (T-Score)', '四肢骨骼肌質量指數 (ASMI)', '握力', '坐站速度'],
      findings: 'T-Score 呈現負向偏離，骨質密度流失速度高於同齡均值。',
      riskDescription: '華人女性停經後骨質吸收加速，骨折風險指數 FRAX 需持續監測。',
      doctorSummaryTip: '評估是否需使用骨質疏鬆專用處方，運動務必避免脊椎過度扭轉與跳躍。',
    },
    gi: {
      id: 'gi',
      name: '腸胃消化與腺體系統',
      chineseName: '腸胃',
      score: 80,
      status: 'normal',
      bioAgingMultiplier: 1.00,
      keyMetrics: ['幽門螺旋桿菌', '糞便潛血', '消化道內視鏡', '乳房影像'],
      findings: '消化道粘膜未見潰瘍，影像追蹤需維持特定週期性。',
      riskDescription: '腺體組織定期檢測可發揮最大防癌早期發現價值。',
      doctorSummaryTip: '若有 BI-RADS 3 結節應遵從 6 個月單側超音波追蹤計畫。',
    }
  };

  // 根據實際 records 動態微調系統分數與狀態
  for (const rec of records) {
    const sys = rec.system;
    if (baseSystems[sys]) {
      if (rec.trendClassification === 'abnormal_worsening') {
        baseSystems[sys].status = 'critical';
        baseSystems[sys].score = Math.min(baseSystems[sys].score, 58);
        baseSystems[sys].bioAgingMultiplier = Math.max(baseSystems[sys].bioAgingMultiplier, 1.35);
      } else if (rec.trendClassification === 'normal_worsening' || rec.isAbnormal) {
        if (baseSystems[sys].status !== 'critical') {
          baseSystems[sys].status = 'warning';
          baseSystems[sys].score = Math.min(baseSystems[sys].score, 68);
          baseSystems[sys].bioAgingMultiplier = Math.max(baseSystems[sys].bioAgingMultiplier, 1.18);
        }
      }
    }
  }

  return baseSystems;
}
