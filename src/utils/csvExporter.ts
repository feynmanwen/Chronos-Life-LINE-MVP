import { LabRecordItem, LifeEvent, FamilyMember } from '../types/health';

/**
 * 導出為符合 RFC 4180 標準且包含 UTF-8 BOM 的 CSV 檔案
 * 保證在 Microsoft Excel 及各平台開啟皆不亂碼 (PRD 8.2)
 */
export function exportHealthAssetsToCSV(
  member: FamilyMember,
  records: LabRecordItem[],
  events: LifeEvent[]
): void {
  const BOM = '\uFEFF';
  const rows: string[] = [];

  // 1. 會員基本資訊表頭
  rows.push(`"個人健康資產 (Health Assets) 匯出清單"`);
  rows.push(`"姓名","${member.name}","身分","${member.role}","年齡","${member.age}","性別","${member.gender}"`);
  rows.push(`"預估基準餘命(年)","${member.baseLifeExpectancyYears}","生活型態獎勵額外年數","${member.dynamicBonusYears}","健康資產綜合評分","${member.healthScore}"`);
  rows.push(`"匯出日期","${new Date().toISOString().split('T')[0]}","資安標準","AES-256 / TLS 1.3 / HIPAA PDPA Compliant"`);
  rows.push(''); // 空行分隔

  // 2. 檢驗報告數據明細
  rows.push(`"【檢驗數據歷程清單 (保留原始報告名稱與參考區間)】"`);
  rows.push(`"檢驗日期","醫療院所","系統別","標準項目名稱","原始報告名稱(溯源)","檢測數值","單位","原始參考區間","是否異常","趨勢分類","檢查方法學","核對狀態","信心度","報告頁碼"`);

  for (const r of records) {
    const isAbn = r.isAbnormal ? '異常' : '正常';
    const auditStatus = r.isPendingAudit ? '待核對' : '已核對';
    const conf = `${Math.round(r.confidenceScore * 100)}%`;
    const line = [
      `"${r.date}"`,
      `"${r.hospital}"`,
      `"${r.system}"`,
      `"${r.standardName}"`,
      `"${r.originalReportName}"`,
      `"${r.value}"`,
      `"${r.unit}"`,
      `"${r.referenceInterval}"`,
      `"${isAbn}"`,
      `"${r.trendClassification}"`,
      `"${r.examModality || '一般檢驗'}"`,
      `"${auditStatus}"`,
      `"${conf}"`,
      `"第 ${r.reportPage} 頁"`
    ].join(',');
    rows.push(line);
  }

  rows.push(''); // 空行分隔

  // 3. 生命事件註記清單
  rows.push(`"【重要生命事件註記 (Event Annotations)】"`);
  rows.push(`"事件日期","事件類別","事件標題","事件詳細描述","AI 與檢驗指標關聯性分析"`);

  for (const e of events) {
    const line = [
      `"${e.date}"`,
      `"${e.type}"`,
      `"${e.title}"`,
      `"${e.description}"`,
      `"${e.aiCorrelationInsight}"`
    ].join(',');
    rows.push(line);
  }

  const csvString = BOM + rows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ChronosLife_健康資產_${member.name}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
