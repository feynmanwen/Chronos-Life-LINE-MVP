import { FittVpTask, LabRecordItem } from '../types/health';

/**
 * 依據檢測結果產出 30 天微習慣計畫，每項任務必須符合 FITT-VP 標準 (PRD 6.1)
 */
export function generateFittVpTask(record: LabRecordItem): FittVpTask {
  const codeUpper = record.code.toUpperCase();

  if (codeUpper.includes('ALT') || codeUpper.includes('GPT') || codeUpper.includes('LIVER')) {
    return {
      id: `task-${Date.now()}-liver`,
      memberId: record.memberId,
      title: '脂肪肝與肝膽修復 30 天微習慣：抗阻有氧與糖分控制',
      relatedMetric: 'ALT',
      system: 'liver',
      f_frequency: '每週 4 次',
      i_intensity: '中等強度（心率區間 115-130 bpm，微喘尚可交談）',
      t_time: '每次 30-40 分鐘',
      t_type: '間歇快走/超慢跑 + 晚餐戒除精緻澱粉與手搖飲',
      v_volume: '每週累積目標 150 分鐘',
      p_progression: '每兩週速度微增 5% 或快走坡度微升 1 段',
      isCompletedToday: false,
      streakDays: 0,
      totalTargetDays: 30,
      completedHistory: [],
    };
  }

  if (codeUpper.includes('T-SCORE') || codeUpper.includes('BONE') || codeUpper.includes('ASMI')) {
    return {
      id: `task-${Date.now()}-bone`,
      memberId: record.memberId,
      title: '骨肌活化 30 天微習慣：坐站肌力與防跌穩定',
      relatedMetric: 'T-SCORE',
      system: 'joints',
      f_frequency: '每週 3 次（做一休一）',
      i_intensity: '自覺強度 RPE 11-13（輕度緊繃，無關節銳痛）',
      t_time: '每次 20 分鐘',
      t_type: '扶椅坐站（3組x10次）+ 彈力帶坐姿划船 + 每日陽光日曬 15 分鐘',
      v_volume: '每週累積 60 分鐘肌力負荷',
      p_progression: '每兩週坐站次數由每組 10 次微增至 12 次',
      restrictionWarning: '【跌倒禁忌限制】：嚴禁高衝擊跳躍動作、深蹲膝過腳尖、急速軀幹前屈搬重物或猛烈扭腰，避免椎體微骨折。',
      isCompletedToday: false,
      streakDays: 0,
      totalTargetDays: 30,
      completedHistory: [],
    };
  }

  if (codeUpper.includes('BI-RADS')) {
    return {
      id: `task-${Date.now()}-birads`,
      memberId: record.memberId,
      title: 'BI-RADS 3 影像追蹤微習慣：定期複檢排程與自覺日誌',
      relatedMetric: 'BI-RADS',
      system: 'gi',
      f_frequency: '每月 1 次經期後自我覺察 / 每半年 1 次專科超音波',
      i_intensity: '無侵入性溫和防護，放鬆心情不焦慮',
      t_time: '每月經期結束後第 7 天自我檢查 10 分鐘',
      t_type: '專科門診預約追蹤 + 乳房外觀與觸感記錄',
      v_volume: '完成第 6 個月超音波複查驗證',
      p_progression: '若連續兩年追蹤穩定無惡化，與醫師討論降級為常規每年檢查',
      isCompletedToday: false,
      streakDays: 0,
      totalTargetDays: 30,
      completedHistory: [],
    };
  }

  // 預設代謝健康 FITT-VP 任務
  return {
    id: `task-${Date.now()}-general`,
    memberId: record.memberId,
    title: `${record.standardName} 代謝改善 30 天微習慣`,
    relatedMetric: record.code,
    system: record.system,
    f_frequency: '每週 3-5 次',
    i_intensity: '中等自覺強度（自覺微熱出汗）',
    t_time: '每次 30 分鐘',
    t_type: '每日 8000 步散步 + 2000ml 充足水分攝取',
    v_volume: '每週累積 150 分鐘日常活動量',
    p_progression: '每兩週每日目標步數提升 500 步',
    isCompletedToday: false,
    streakDays: 0,
    totalTargetDays: 30,
    completedHistory: [],
  };
}
