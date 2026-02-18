/**
 * Capture Figma Life journey - CLOSE-UP views for readable details
 * Zooms in to ~25-30% and captures each section
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, 'figma-life-captures', 'closeups');
const FIGMA_URL = 'https://www.figma.com/design/e49M9h0d3JjxsNWzR0KvMw/Life---Visual-Update?node-id=16011-20713&m=dev';
const PASSWORD = 'twist-hungry-curve-click';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-features=WebGL,WebGL2', '--ignore-gpu-blocklist', '--use-gl=swiftshader', '--use-angle=swiftshader']
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  try {
    console.log('1. Navigating to Figma...');
    await page.goto(FIGMA_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(4000);

    const passwordInput = await page.$('input[type="password"], input[name*="password" i]');
    if (passwordInput) {
      console.log('2. Entering password...');
      await passwordInput.fill(PASSWORD);
      await sleep(600);
      await page.keyboard.press('Enter');
      await sleep(8000);
    }

    // Dismiss cookie banner
    try {
      const allowBtn = await page.$('button:has-text("Allow all cookies")');
      if (allowBtn) {
        await allowBtn.click({ timeout: 2000 });
        await sleep(500);
      }
    } catch (_) {}

    // Zoom IN to ~25% (start at 4%, need Cmd/Ctrl + = several times)
    // Figma: Cmd++ zooms in. At 4%, we need many zooms to reach 25%
    console.log('3. Zooming in for close-up...');
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Meta+=');
      await sleep(200);
    }
    await sleep(1500);

    // Center on Basic Information (left side - may need to pan left first)
    await page.keyboard.press('Meta+0'); // Fit to screen
    await sleep(1000);
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Meta+=');
      await sleep(150);
    }
    await page.screenshot({ path: join(OUTPUT_DIR, 'basic-info-01.png') });
    console.log('Saved: basic-info-01.png');

    // Pan right through Basic Info
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Shift+ArrowRight');
      await sleep(100);
    }
    await page.screenshot({ path: join(OUTPUT_DIR, 'basic-info-02.png') });
    console.log('Saved: basic-info-02.png');

    // Pan to Lifestyle
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Shift+ArrowRight');
      await sleep(100);
    }
    await page.screenshot({ path: join(OUTPUT_DIR, 'lifestyle-01.png') });
    console.log('Saved: lifestyle-01.png');

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Shift+ArrowRight');
      await sleep(100);
    }
    await page.screenshot({ path: join(OUTPUT_DIR, 'lifestyle-02.png') });
    console.log('Saved: lifestyle-02.png');

    // Pan to Quote
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Shift+ArrowRight');
      await sleep(100);
    }
    await page.screenshot({ path: join(OUTPUT_DIR, 'quote-page.png') });
    console.log('Saved: quote-page.png');

    // Pan to Add-ons
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Shift+ArrowRight');
      await sleep(100);
    }
    await page.screenshot({ path: join(OUTPUT_DIR, 'addons-01.png') });
    console.log('Saved: addons-01.png');

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Shift+ArrowRight');
      await sleep(100);
    }
    await page.screenshot({ path: join(OUTPUT_DIR, 'addons-02.png') });
    console.log('Saved: addons-02.png');

    // Pan to Review
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Shift+ArrowRight');
      await sleep(100);
    }
    await page.screenshot({ path: join(OUTPUT_DIR, 'review.png') });
    console.log('Saved: review.png');

  } catch (err) {
    console.error('Error:', err.message);
    try {
      await page.screenshot({ path: join(OUTPUT_DIR, 'error.png') });
    } catch (_) {}
  } finally {
    await browser.close();
  }
  console.log('\nDone. Close-ups in:', OUTPUT_DIR);
}

main();
