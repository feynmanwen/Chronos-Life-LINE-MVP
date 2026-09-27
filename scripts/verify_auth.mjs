import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge' });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5173');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(1000);

  // 1. Capture Login View
  await page.screenshot({ path: 'scripts/screenshots/01_login_view.png' });
  console.log('Saved 01_login_view.png');

  // 2. Click Register
  await page.click('text=立即新增註冊');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scripts/screenshots/02_register_view.png' });
  console.log('Saved 02_register_view.png');

  // 3. Register a new user
  const testUser = 'user_grace_' + Date.now();
  await page.locator('input').nth(0).fill(testUser);
  await page.locator('input').nth(1).fill('Grace Chen');
  await page.locator('input').nth(2).fill('32');
  await page.locator('input').nth(3).fill('grace1234');
  await page.locator('input').nth(4).fill('grace1234');
  await page.click('button:has-text("建立健康資產帳號並登入")');
  await page.waitForTimeout(2000);

  // 4. Capture Dashboard for Grace Chen
  await page.screenshot({ path: 'scripts/screenshots/03_dashboard_after_register.png' });
  console.log('Saved 03_dashboard_after_register.png');

  // 5. Logout
  await page.click('button[title*="登出"]');
  await page.waitForTimeout(1000);

  // 6. Click Forgot Password
  await page.click('text=忘記密碼？');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scripts/screenshots/04_forgot_password_view.png' });
  console.log('Saved 04_forgot_password_view.png');

  // 7. Reset password for testUser
  await page.locator('input').nth(0).fill(testUser);
  await page.locator('input').nth(1).fill('grace8888');
  await page.locator('input').nth(2).fill('grace8888');
  await page.click('button:has-text("確認重設密碼")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/screenshots/05_forgot_password_success.png' });
  console.log('Saved 05_forgot_password_success.png');

  // 8. Click login with new password
  await page.click('text=立即以新密碼登入');
  await page.waitForTimeout(500);
  await page.click('button:has-text("登入健康資產系統")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'scripts/screenshots/06_logged_in_with_new_password.png' });
  console.log('Saved 06_logged_in_with_new_password.png');

  await browser.close();
  console.log('All tests passed successfully!');
}

run().catch(console.error);
