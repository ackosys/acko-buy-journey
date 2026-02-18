/**
 * Continue verification flow from entry screen:
 * 1. Load, click "I'm new to ACKO", wait 3s for typing → screenshot
 * 2. Click "Which plan fits my family?" → wait 3s → screenshot
 * 3. Click Myself + Spouse, Continue → wait 3s → screenshot (age input)
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const path = join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  console.log(`📸 Screenshot: ${name}.png`);
  return path;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  try {
    // 1. Load and click "I'm new to ACKO"
    console.log('\n=== Loading entry screen ===');
    await page.goto('http://localhost:3002', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    await sleep(1500);

    const newToAckoBtn = page.getByRole('button', { name: /I'm new to ACKO/i });
    await newToAckoBtn.click();

    // Wait for intent options to appear (typing: ~600+length*8 per msg, 2 welcome msgs + intent msg)
    console.log('Waiting for typing animations (8s)...');
    await sleep(8000);

    await takeScreenshot(page, '03-welcome-and-intent');

    // 2. Click "Which plan fits my family?" - use getByText for button containing this label
    console.log('\n=== Clicking "Which plan fits my family?" ===');
    const whichPlanBtn = page.locator('button').filter({ hasText: /Which plan fits my family/i });
    await whichPlanBtn.waitFor({ state: 'visible', timeout: 10000 });
    await whichPlanBtn.click();
    await sleep(6000); // Wait for family profiling messages + widget

    await takeScreenshot(page, '04-family-who-to-cover');

    // 3. Click Myself and Spouse, then Continue
    console.log('\n=== Selecting Myself and Spouse ===');
    const myselfBtn = page.getByRole('button', { name: /Myself/i });
    await myselfBtn.click();
    await sleep(300);

    const spouseBtn = page.getByRole('button', { name: /Spouse/i });
    await spouseBtn.click();
    await sleep(300);

    const continueBtn = page.getByRole('button', { name: /Continue/i });
    await continueBtn.click();
    await sleep(5000); // Wait for age input to appear

    await takeScreenshot(page, '05-age-input');

    console.log('\n✅ Done. Screenshots in:', SCREENSHOTS_DIR);
  } catch (error) {
    console.error('Error:', error.message);
    await takeScreenshot(page, 'error-state').catch(() => {});
  } finally {
    await browser.close();
  }
}

main();
