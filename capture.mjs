import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

// 1. Landing Page
await page.goto('http://localhost:3000/');
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/screenshots/1_landing.png', fullPage: true });
console.log('1. Landing page captured');

// 2. Login Page
await page.click('text=입장하기');
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/screenshots/2_login.png', fullPage: true });
console.log('2. Login page captured');

// 3. Parent Dashboard - login as parent
await page.fill('input[type="email"]', 'parent@test.com');
await page.fill('input[type="password"]', 'password123');
await page.click('button[type="submit"]');
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/screenshots/3_dashboard.png', fullPage: true });
console.log('3. Dashboard captured');

// 4. Discharge Manual
await page.click('text=퇴원 매뉴얼');
await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/screenshots/4_manual.png', fullPage: true });
console.log('4. Manual captured');

// 5. Go back, logout, login as admin
await page.goto('http://localhost:3000/');
await page.waitForTimeout(500);

// Clear localStorage and go to login
await page.evaluate(() => localStorage.clear());
await page.goto('http://localhost:3000/login?role=staff');
await page.waitForTimeout(1000);
await page.fill('input[type="email"]', 'admin@severance.com');
await page.fill('input[type="password"]', 'password123');
await page.click('button[type="submit"]');
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/screenshots/5_admin_editor.png', fullPage: true });
console.log('5. Admin editor captured');

// 6. Admin Notification Center
await page.click('text=알림 센터');
await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/screenshots/6_notifications.png', fullPage: true });
console.log('6. Notification center captured');

await browser.close();
console.log('\nAll screenshots saved to /tmp/screenshots/');
