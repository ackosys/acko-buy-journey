/**
 * ACKO Health Insurance Journey Explorer
 * Navigates through the purchase flow and captures screenshots at each step
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, stepName, description = '') {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const filename = `${stepName.replace(/\s+/g, '-')}.png`;
  const path = join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path, fullPage: true });
  console.log(`📸 Screenshot: ${filename} - ${description}`);
  return { stepName, filename, path };
}

async function main() {
  const results = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  try {
    // Step 1: Landing/Intro page
    console.log('\n=== Step 1: Landing Page ===');
    await page.goto('https://www.acko.com/gi/p/health/new/landingPage/intro', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await sleep(3000);
    results.push(await takeScreenshot(page, '01-landing-intro', 'Landing/Intro page'));

    // Document what we see
    const pageContent = await page.content();
    const hasWhoFor = pageContent.includes('Who') || pageContent.includes('who');
    const hasAge = pageContent.includes('Age') || pageContent.includes('age');
    const hasCity = pageContent.includes('City') || pageContent.includes('city');
    const hasPincode = pageContent.includes('Pincode') || pageContent.includes('pincode');

    // Look for buttons
    const buttons = await page.$$eval('button, [role="button"], a[href="#"]', els =>
      els.map(e => e.textContent?.trim()).filter(Boolean)
    );
    console.log('Buttons found:', buttons.slice(0, 20));

    // Try to find and click "Continue" or "Get Quote" type buttons
    const continueBtn = await page.$('button:has-text("Continue"), button:has-text("Get Quote"), button:has-text("Check"), a:has-text("Continue"), a:has-text("Get Quote")');
    if (continueBtn) {
      await continueBtn.click();
      await sleep(2000);
      results.push(await takeScreenshot(page, '02-after-first-continue', 'After first continue'));
    }

    // Try filling form if we find input fields
    const inputs = await page.$$('input, select');
    if (inputs.length > 0) {
      console.log(`Found ${inputs.length} form elements`);
      // Try to fill age if present
      const ageInput = await page.$('input[type="number"], input[name*="age"], input[placeholder*="age" i]');
      if (ageInput) {
        await ageInput.fill('30');
        await sleep(500);
      }
    }

    // Take final screenshot of current state
    results.push(await takeScreenshot(page, '03-current-state', 'Current page state'));

    // Save results metadata
    writeFileSync(join(SCREENSHOTS_DIR, 'results.json'), JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
    await takeScreenshot(page, 'error-state', 'Error occurred');
  } finally {
    await browser.close();
  }

  return results;
}

main().then(r => console.log('\nDone. Screenshots in:', SCREENSHOTS_DIR));
