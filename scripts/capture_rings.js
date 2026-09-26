import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click desktop toggle button
  const desktopBtn = page.locator('button[title="桌面寬螢幕工作台模式"]').first();
  if (await desktopBtn.isVisible()) {
    await desktopBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'recordings/11_desktop_rings.png' });
  console.log('Saved recordings/11_desktop_rings.png');
  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
