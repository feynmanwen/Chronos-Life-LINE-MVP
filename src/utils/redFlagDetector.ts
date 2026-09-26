import { EMERGENCY_HOSPITALS } from '../data/medicalKnowledge';
import { RedFlagInterception } from '../types/health';

// PRD 7.1 急症關鍵字清單
export const RED_FLAG_KEYWORDS = [
  '劇烈胸痛',
  '單側肢體麻痺',
  '嚴重呼吸困難',
  '意識不清',
  '大量出血',
  '突發視力模糊',
  // 兼顧常見口語變體以確保零漏失
  '胸痛劇烈',
  '半邊麻痺',
  '喘不過氣',
  '昏迷',
  '大出血',
  '突然看不見'
];

export function checkRedFlagKeywords(userInput: string): RedFlagInterception {
  const normalized = userInput.trim().toLowerCase();
  const matched = RED_FLAG_KEYWORDS.filter(kw => normalized.includes(kw.toLowerCase()));

  if (matched.length > 0) {
    return {
      isTriggered: true,
      matchedKeywords: matched,
      alertTitle: '【系統緊急攔截】偵測到急重症紅旗警訊！',
      alertMessage: `您輸入的內容包含疑似急症警訊關鍵字：「${matched.join('、')}」。根據醫療安全防衛規範，系統已強制終止 AI 生成對話與一般 RAG 檢索，請立即啟動緊急醫療救護！`,
      emergencyPhone: '119',
      nearbyHospitals: EMERGENCY_HOSPITALS.map(h => ({
        name: h.name,
        distance: h.distance,
        phone: h.phone,
        mapsUrl: h.mapsUrl
      }))
    };
  }

  return {
    isTriggered: false,
    matchedKeywords: [],
    alertTitle: '',
    alertMessage: '',
    emergencyPhone: '119',
    nearbyHospitals: []
  };
}

// PRD 7.2 安全 No-Go 檢查：嚴禁 AI 開立處方、調整藥物劑量、或以單一指標宣稱罹癌
export function sanitizeAiResponse(response: string): { safeText: string; hasWarning: boolean } {
  const prescriptionPatterns = [/建議增加.*劑量/, /建議停藥/, /開立.*處方/, /確診為.*癌/];
  let safeText = response;
  let hasWarning = false;

  for (const pattern of prescriptionPatterns) {
    if (pattern.test(safeText)) {
      hasWarning = true;
      safeText = safeText.replace(pattern, '【依醫療安全規範，本系統不提供藥物劑量調整與確診，請務必諮詢主治醫師】');
    }
  }

  return { safeText, hasWarning };
}
