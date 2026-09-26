import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function run() {
  const recordingsDir = path.resolve('./recordings');
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }

  console.log('Launching browser with recording enabled...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: recordingsDir,
      size: { width: 1280, height: 800 },
    },
  });

  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. 首頁截圖 (儀表板)
  console.log('Taking screenshot: 01_dashboard.png');
  await page.screenshot({ path: path.join(recordingsDir, '01_dashboard.png'), fullPage: false });

  // 2. 測試 3D 器官切換
  console.log('Testing 3D organ tabs interaction...');
  const heartTab = page.locator('button:has-text("心")').first();
  if (await heartTab.isVisible()) {
    await heartTab.click();
    await page.waitForTimeout(1000);
  }
  const liverTab = page.locator('button:has-text("肝")').first();
  if (await liverTab.isVisible()) {
    await liverTab.click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: path.join(recordingsDir, '02_organ_selected.png') });

  // 3. 測試黃金案例 A (肝膽趨勢)
  console.log('Testing Golden Case A (Liver ALT trend)...');
  const caseABtn = page.locator('text=情境 A：肝膽趨勢').first();
  if (await caseABtn.isVisible()) {
    await caseABtn.click();
    await page.waitForTimeout(1200);
  }
  await page.screenshot({ path: path.join(recordingsDir, '03_golden_case_a.png') });

  // 4. 測試來源優先截圖溯源 (Source Trace Modal)
  console.log('Testing Source Trace Modal...');
  const traceBtn = page.locator('button:has-text("檢視報告切片")').first();
  if (await traceBtn.isVisible()) {
    await traceBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(recordingsDir, '04_source_trace.png') });
    // 關閉視窗
    await page.click('button:has-text("關閉視窗")');
    await page.waitForTimeout(500);
  }

  // 5. 測試數據核對工作台 (Audit Workbench)
  console.log('Testing Audit Workbench...');
  const auditBtn = page.locator('button:has-text("核對工作台")').first();
  if (await auditBtn.isVisible()) {
    await auditBtn.click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(recordingsDir, '05_audit_workbench.png') });
    // 點擊確認核對
    const confirmAuditBtn = page.locator('button:has-text("確認無誤並完成核對")').first();
    if (await confirmAuditBtn.isVisible()) {
      await confirmAuditBtn.click();
      await page.waitForTimeout(800);
    }
  }

  // 6. 測試黃金案例 B (骨肌流失) 與 FITT-VP 任務打卡
  console.log('Testing Golden Case B (Osteo-sarcopenia) & FITT-VP...');
  const caseBBtn = page.locator('text=情境 B：骨肌流失').first();
  if (await caseBBtn.isVisible()) {
    await caseBBtn.click();
    await page.waitForTimeout(1000);
  }
  // 切換至 FITT-VP 頁籤
  const fittTab = page.locator('button:has-text("FITT-VP任務")').first();
  if (await fittTab.isVisible()) {
    await fittTab.click();
    await page.waitForTimeout(1000);
  }
  // 進行打卡簽到
  const checkinBtn = page.locator('button:has-text("今日打卡簽到"), button:has-text("今日已打卡")').first();
  if (await checkinBtn.isVisible()) {
    await checkinBtn.click();
    await page.waitForTimeout(1200); // 讓撒花特效撥放
  }
  await page.screenshot({ path: path.join(recordingsDir, '06_fitt_vp_task.png') });

  // 7. 測試黃金案例 C (BI-RADS 衝突) 與 醫病溝通摘要
  console.log('Testing Golden Case C (BI-RADS) & Doctor Summary...');
  const caseCBtn = page.locator('text=情境 C：BI-RADS 衝突').first();
  if (await caseCBtn.isVisible()) {
    await caseCBtn.click();
    await page.waitForTimeout(1000);
  }
  const summaryBtn = page.locator('button:has-text("醫病摘要")').first();
  if (await summaryBtn.isVisible()) {
    await summaryBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(recordingsDir, '07_doctor_summary.png') });
    // 關閉摘要
    const closeBtn = page.locator('button:has(svg.lucide-x)').last();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 8. 測試 LINE 對話與急症紅旗攔截 (PRD 7.1)
  console.log('Testing LINE Chat & Red-Flag Emergency Intercept...');
  const chatTab = page.locator('button:has-text("LINE AI諮詢")').first();
  if (await chatTab.isVisible()) {
    await chatTab.click();
    await page.waitForTimeout(1000);
  }
  const redFlagChip = page.locator('button:has-text("🚨 測試急症紅旗攔截")').first();
  if (await redFlagChip.isVisible()) {
    await redFlagChip.click();
    await page.waitForTimeout(1500); // 等待全螢幕紅色警訊彈出
    await page.screenshot({ path: path.join(recordingsDir, '08_red_flag_intercept.png') });
    // 關閉警訊視窗
    const safeBtn = page.locator('button:has-text("我已安全 / 關閉警訊視窗")').first();
    if (await safeBtn.isVisible()) {
      await safeBtn.click({ force: true });
      await page.waitForTimeout(800);
    }
  }

  // 9. 測試桌面寬螢幕模式切換
  console.log('Testing Desktop Wide-Screen mode...');
  const desktopToggle = page.locator('button[title="桌面寬螢幕工作台模式"]').first();
  if (await desktopToggle.isVisible()) {
    await desktopToggle.click();
    await page.waitForTimeout(1200);
  }
  // 回到儀表板
  const dashTab = page.locator('button:has-text("策略儀表板")').first();
  if (await dashTab.isVisible()) {
    await dashTab.click();
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: path.join(recordingsDir, '09_desktop_mode.png') });

  console.log('Closing page to finalize video recording...');
  await page.close();
  await context.close();
  await browser.close();

  console.log('Recording finalized successfully!');
}

run().catch(err => {
  console.error('Error during recording:', err);
  process.exit(1);
});
