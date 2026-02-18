/**
 * Capture Figma Life Insurance journey at readable zoom levels
 * Uses "Zoom to Fit" and moderate zoom to get readable screens
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, 'figma-life-captures', 'v2');

const FIGMA_URL = 'https://www.figma.com/design/e49M9h0d3JjxsNWzR0KvMw/Life---Visual-Update?node-id=16011-20713&m=dev';
const PASSWORD = 'twist-hungry-curve-click';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-features=WebGL,WebGL2',
      '--ignore-gpu-blocklist',
      '--use-gl=swiftshader',
      '--use-angle=swiftshader',
      '--no-sandbox'
    ]
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  try {
    console.log('1. Navigating to Figma...');
    await page.goto(FIGMA_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await sleep(5000);

    // Enter password
    const passwordInput = await page.$('input[type="password"], input[name*="password" i], input[placeholder*="password" i]');
    if (passwordInput) {
      console.log('2. Entering password...');
      await passwordInput.fill(PASSWORD);
      await sleep(500);
      await page.keyboard.press('Enter');
      await sleep(10000);
    }

    // Dismiss banners
    try {
      const btn = await page.$('button:has-text("Allow all cookies")');
      if (btn) { await btn.click(); await sleep(1000); }
    } catch (_) {}
    
    try {
      const dismiss = await page.$('[aria-label="Close"]');
      if (dismiss) { await dismiss.click(); await sleep(500); }
    } catch (_) {}

    // Wait for canvas to be ready
    await sleep(5000);
    
    // Zoom to fit the entire design (Shift+1)
    console.log('3. Zoom to fit...');
    await page.keyboard.press('Shift+Digit1');
    await sleep(3000);
    await page.screenshot({ path: join(OUTPUT_DIR, '01-fit-all.png'), fullPage: false });
    console.log('   Saved 01-fit-all.png');

    // Zoom in moderately (2 steps from fit-all, ~8-15% zoom)
    await page.keyboard.press('Meta+=');
    await sleep(500);
    await page.keyboard.press('Meta+=');
    await sleep(2000);
    await page.screenshot({ path: join(OUTPUT_DIR, '02-zoom-moderate.png') });
    console.log('   Saved 02-zoom-moderate.png');

    // One more zoom step
    await page.keyboard.press('Meta+=');
    await sleep(500);
    await page.keyboard.press('Meta+=');
    await sleep(2000);
    await page.screenshot({ path: join(OUTPUT_DIR, '03-zoom-more.png') });
    console.log('   Saved 03-zoom-more.png');

    // Pan right through design sections
    const panSteps = [
      { scrollX: 800, name: '04-pan-1.png' },
      { scrollX: 800, name: '05-pan-2.png' },
      { scrollX: 800, name: '06-pan-3.png' },
      { scrollX: 800, name: '07-pan-4.png' },
      { scrollX: 800, name: '08-pan-5.png' },
      { scrollX: 800, name: '09-pan-6.png' },
      { scrollX: 800, name: '10-pan-7.png' },
      { scrollX: 800, name: '11-pan-8.png' },
      { scrollX: 800, name: '12-pan-9.png' },
      { scrollX: 800, name: '13-pan-10.png' },
    ];

    for (const step of panSteps) {
      // Hold space and drag to pan, or use scroll
      await page.mouse.wheel(step.scrollX, 0);
      await sleep(1500);
      await page.screenshot({ path: join(OUTPUT_DIR, step.name) });
      console.log(`   Saved ${step.name}`);
    }

    console.log('\nDone!');
  } catch (err) {
    console.error('Error:', err.message);
    await page.screenshot({ path: join(OUTPUT_DIR, 'error.png') });
  } finally {
    await browser.close();
  }
}

main();
