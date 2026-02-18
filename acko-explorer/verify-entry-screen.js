/**
 * Verify ACKO Health Insurance entry screen on localhost:3002
 * 1. Screenshot entry screen (purple gradient, logo, cards, trust indicators)
 * 2. Click "I'm new to ACKO"
 * 3. Screenshot conversation beginning
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
  console.log(`📸 Screenshot saved: ${path}`);
  return path;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  try {
    // Step 1: Load entry screen
    console.log('\n=== Step 1: Loading entry screen ===');
    await page.goto('http://localhost:3002', {
      waitUntil: 'networkidle',
      timeout: 15000
    });
    await sleep(2000); // Wait for animations
    await takeScreenshot(page, '01-entry-screen');

    // Step 2: Click "I'm new to ACKO"
    console.log('\n=== Step 2: Clicking "I\'m new to ACKO" ===');
    const newToAckoBtn = page.getByRole('button', { name: /I'm new to ACKO/i });
    await newToAckoBtn.click();
    await sleep(3000); // Wait for transition and chat to appear

    // Step 3: Screenshot conversation beginning
    await takeScreenshot(page, '02-conversation-beginning');

    console.log('\n✅ Done. Screenshots in:', SCREENSHOTS_DIR);
  } catch (error) {
    console.error('Error:', error.message);
    await takeScreenshot(page, 'error-state').catch(() => {});
  } finally {
    await browser.close();
  }
}

main();
