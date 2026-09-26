export interface SynonymMapping {
  standardCode: string;
  standardName: string;
  aliases: string[];
  unitDefault: string;
  typicalReferenceNotes: string;
}

export const SYNONYM_DICTIONARY: SynonymMapping[] = [
  {
    standardCode: 'ALT',
    standardName: '丙胺酸轉胺酶 (ALT)',
    aliases: ['GPT', 'SGPT', 'ALT', '丙氨酸氨基轉移酶', '麩丙酮酸轉氨基酶'],
    unitDefault: 'U/L',
    typicalReferenceNotes: '各院常落在 0-40 或 0-45 U/L，嚴格遵從檢驗報告原始標示。',
  },
  {
    standardCode: 'AST',
    standardName: '天門冬胺酸轉胺酶 (AST)',
    aliases: ['GOT', 'SGOT', 'AST', '天門冬氨酸氨基轉移酶'],
    unitDefault: 'U/L',
    typicalReferenceNotes: '常見參考值 0-35 或 0-40 U/L。',
  },
  {
    standardCode: 'GLU_AC',
    standardName: '空腹血糖 (AC Glucose)',
    aliases: ['空腹血糖', '飯前血糖', 'GLU AC', 'Fasting Blood Glucose', 'FBS'],
    unitDefault: 'mg/dL',
    typicalReferenceNotes: '正常值一般為 70 - 99 mg/dL；100-125 為糖尿病前期。',
  },
  {
    standardCode: 'T-SCORE',
    standardName: '骨質密度 T 評分 (DXA T-Score)',
    aliases: ['T-Score', '骨密度T值', 'BMD T-Score', 'T評分'],
    unitDefault: 'SD',
    typicalReferenceNotes: '> -1.0 為正常；-1.0 ~ -2.5 為骨質缺乏；<= -2.5 為骨質疏鬆。',
  },
  {
    standardCode: 'BI-RADS',
    standardName: '乳房影像報告與資料系統 (BI-RADS)',
    aliases: ['BI-RADS', 'BIRADS', '乳房分級', '乳腺影像分級'],
    unitDefault: 'Category',
    typicalReferenceNotes: '0:評估未完成; 1:陰性; 2:良性; 3:可能良性(半年追蹤); 4:可疑惡性(切片); 5:高度懷疑。',
  }
];

export const EMERGENCY_HOSPITALS = [
  {
    name: '國立臺灣大學醫學院附設醫院・急診醫學部',
    distance: '2.1 公里 (救護車約 6 分鐘)',
    address: '台北市中正區中山南路 7 號 (兒醫旁急診專用車道)',
    phone: '02-2356-2999',
    mapsUrl: 'https://maps.google.com/?q=國立臺灣大學醫學院附設醫院急診部',
  },
  {
    name: '國泰綜合醫院・急診醫學科',
    distance: '1.4 公里 (救護車約 4 分鐘)',
    address: '台北市大安區仁愛路四段 280 號 (安和路二段側急診入口)',
    phone: '02-2708-2121',
    mapsUrl: 'https://maps.google.com/?q=國泰綜合醫院急診室',
  },
  {
    name: '臺北榮民總醫院・急診醫學中心',
    distance: '8.5 公里 (車程約 20 分鐘)',
    address: '台北市北投區石牌路二段 201 號 中正樓 1 樓',
    phone: '02-2875-7357',
    mapsUrl: 'https://maps.google.com/?q=臺北榮民總醫院急診中心',
  },
  {
    name: '臺北市立聯合醫院仁愛院區・急診科',
    distance: '1.2 公里 (車程約 3 分鐘)',
    address: '台北市大安區仁愛路四段 10 號',
    phone: '02-2709-3600',
    mapsUrl: 'https://maps.google.com/?q=臺北市立聯合醫院仁愛院區急診室',
  }
];

export const RAG_KNOWLEDGE_SNIPPETS = [
  {
    id: 'rag-liver-1',
    system: 'liver',
    title: '台灣消化系醫學會：ALT 跨院判讀與非酒精性脂肪肝 (NAFLD) 指引',
    summary: 'ALT 是肝細胞受損最敏感的酵素。若跨年數值由正常低標 (<30) 上升至正常高標或超過 40 U/L，即便尚在部分院所參考區間邊緣，亦代表脂肪肝有進行性發炎現象。減重 5-10% 搭配每週 150 分鐘中強度運動，可使 80% 早期脂肪肝獲得顯著生化指標改善。',
    citation: 'Taiwan Society of Gastroenterology (TSG) Clinical Guidelines, 2024.',
  },
  {
    id: 'rag-osteoporosis-1',
    system: 'joints',
    title: '中華民國骨質疏鬆症學會 (TOA)：肌少與骨質疏鬆聯合防跌運動處方',
    summary: '當 DXA T-score 低於 -2.5 時，已達臨床骨質疏鬆標準。高齡者合併肌肉量低下 (ASMI < 5.7 kg/m²) 時，跌倒骨折風險提高 4 倍。運動應以抗阻力訓練 (如扶椅坐站) 與平衡訓練為主，絕對禁止高衝擊跳躍與急速彎腰搬重。',
    citation: 'Taiwanese Osteoporosis Association (TOA) Guidelines, 2025 Edition.',
  },
  {
    id: 'rag-breast-1',
    system: 'gi',
    title: '衛生福利部國民健康署：緻密型乳房與超音波互補篩檢共識',
    summary: '乳房 X 光攝影對微小鈣化點最為敏感，但若報告標記為「緻密型乳腺 (Heterogeneously / Extremely Dense)」，腫塊可能被正常乳腺遮蔽造成假陰性。高頻超音波對囊腫與實質結節判別率極高。若超音波評為 BI-RADS 3，其惡性率小於 2%，原則上應遵守 6 個月單側超音波追蹤。',
    citation: 'Health Promotion Administration, Taiwan Breast Cancer Screening Consensus, 2024.',
  }
];
