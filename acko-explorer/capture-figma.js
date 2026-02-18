/**
 * Capture password-protected Figma design file screenshots
 * Life Insurance buy journey - Visual Update
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, 'figma-life-captures');

const FIGMA_URL = 'https://www.figma.com/design/e49M9h0d3JjxsNWzR0KvMw/Life---Visual-Update?node-id=16011-20713&m=dev';
const PASSWORD = 'twist-hungry-curve-click';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({
  headless: true,
  args: [
    '--enable-features=WebGL,WebGL2',
    '--ignore-gpu-blocklist',
    '--use-gl=swiftshader',
    '--use-angle=swiftshader'
  ]
});
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    console.log('1. Navigating to Figma...');
    await page.goto(FIGMA_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(4000);

    // Check for password prompt
    const passwordInput = await page.$('input[type="password"], input[name*="password" i], input[placeholder*="password" i]');
    if (passwordInput) {
      console.log('2. Password field found - entering password...');
      await passwordInput.fill(PASSWORD);
      await sleep(800);
      await page.keyboard.press('Enter');
      await sleep(8000);
    } else {
      console.log('2. No password field - may already have access');
    }

    // Dismiss cookie banner (optional, don't block)
    try {
      const allowCookies = await page.$('button:has-text("Allow all cookies")');
      if (allowCookies) {
        await allowCookies.click({ timeout: 3000 });
        await sleep(1000);
      }
    } catch (_) {}

    // Dismiss hardware acceleration banner (optional)
    try {
      const dismissBanner = await page.$('[aria-label="Close"], button:has-text("Got it")');
      if (dismissBanner) await dismissBanner.click({ timeout: 2000 });
      await sleep(500);
    } catch (_) {}

    // Zoom out to see overview first
    await page.keyboard.press('Meta+-');
    await sleep(500);
    await page.keyboard.press('Meta+-');
    await sleep(1000);
    await page.screenshot({ path: join(OUTPUT_DIR, '01-overview-zoomed-out.png') });
    console.log('3. Screenshot 01-overview-zoomed-out.png saved');

    // Zoom in significantly (Ctrl/Cmd + + multiple times) to see design details
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Meta+=');
      await sleep(300);
    }
    await sleep(1500);
    await page.screenshot({ path: join(OUTPUT_DIR, '02-zoomed-in-basic.png') });
    console.log('4. Screenshot 02-zoomed-in-basic.png saved');

    // Pan right to see more screens (Figma canvas - arrow keys or shift+scroll)
    await page.keyboard.press('Shift+ArrowRight');
    await sleep(500);
    await page.keyboard.press('Shift+ArrowRight');
    await sleep(500);
    await page.screenshot({ path: join(OUTPUT_DIR, '03-pan-right.png') });
    console.log('5. Screenshot 03-pan-right.png saved');

    // Pan more to see Lifestyle section
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Shift+ArrowRight');
      await sleep(300);
    }
    await sleep(500);
    await page.screenshot({ path: join(OUTPUT_DIR, '04-lifestyle-section.png') });
    console.log('6. Screenshot 04-lifestyle-section.png saved');

    // Pan to Quote section
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Shift+ArrowRight');
      await sleep(300);
    }
    await page.screenshot({ path: join(OUTPUT_DIR, '05-quote-section.png') });
    console.log('7. Screenshot 05-quote-section.png saved');

    // Pan to Add ons
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Shift+ArrowRight');
      await sleep(300);
    }
    await page.screenshot({ path: join(OUTPUT_DIR, '06-addons-section.png') });
    console.log('8. Screenshot 06-addons-section.png saved');

    // Pan to Review
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Shift+ArrowRight');
      await sleep(300);
    }
    await page.screenshot({ path: join(OUTPUT_DIR, '07-review-section.png') });
    console.log('9. Screenshot 07-review-section.png saved');

    // Take a snapshot of page structure for analysis
    const snapshot = await page.evaluate(() => ({
      title: document.title,
      bodyText: document.body?.innerText?.slice(0, 2000) || '',
      hasCanvas: !!document.querySelector('canvas'),
      hasFigma: !!document.querySelector('[data-testid], [class*="figma"]')
    }));
    console.log('Page info:', JSON.stringify(snapshot, null, 2));

  } catch (err) {
    console.error('Error:', err.message);
    try {
      await page.screenshot({ path: join(OUTPUT_DIR, 'error-state.png') });
      console.log('Error screenshot saved');
    } catch (_) {}
  } finally {
    await browser.close();
  }
  console.log('\nDone. Screenshots in:', OUTPUT_DIR);
}

main();
