/**
 * Full flow verification: age input → spouse age → reflection+coverage → health conditions
 * → needs → calculation → recommendation
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
    // === Load and get to age input (reuse previous flow) ===
    console.log('\n=== Loading and navigating to age input ===');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(1500);

    await page.getByRole('button', { name: /I'm new to ACKO/i }).click();
    await sleep(8000);

    await page.locator('button').filter({ hasText: /Which plan fits my family/i }).click();
    await sleep(6000);

    await page.getByRole('button', { name: /Myself/i }).click();
    await sleep(300);
    await page.getByRole('button', { name: /Spouse/i }).click();
    await sleep(300);
    await page.getByRole('button', { name: /Continue/i }).click();
    await sleep(5000);

    // 1. Type "30" in age input, submit
    console.log('\n=== 1. Entering age 30 ===');
    const ageInput = page.getByPlaceholder('Your age');
    await ageInput.fill('30');
    await sleep(300);
    await page.locator('button').filter({ hasText: '→' }).click();
    await sleep(3000);

    // 2. Enter spouse age "28"
    console.log('\n=== 2. Entering spouse age 28 ===');
    const spouseInput = page.getByPlaceholder(/Spouse's age/i);
    await spouseInput.fill('28');
    await sleep(300);
    await page.locator('button').filter({ hasText: '→' }).click();
    await sleep(3000);

    // 3. Screenshot at reflection + coverage question
    console.log('\n=== 3. Screenshot: reflection + coverage ===');
    await takeScreenshot(page, '06-reflection-and-coverage');

    // 4. Select "No, I don't have any" for coverage
    console.log('\n=== 4. Selecting No, I don\'t have any ===');
    await page.locator('button').filter({ hasText: /No, I don't have any/i }).click();
    await sleep(3000);

    // 5. Screenshot at health conditions
    console.log('\n=== 5. Screenshot: health conditions ===');
    await takeScreenshot(page, '07-health-conditions');

    // 6. Select "None of the above", Continue
    console.log('\n=== 6. Selecting None of the above ===');
    await page.locator('button').filter({ hasText: /None of the above/i }).click();
    await sleep(300);
    await page.getByRole('button', { name: /Continue/i }).click();
    await sleep(3000);

    // 7. Screenshot at needs/priorities
    console.log('\n=== 7. Screenshot: needs/priorities ===');
    await takeScreenshot(page, '08-needs-priorities');

    // 8. Select priorities, Continue, wait for calculation
    console.log('\n=== 8. Selecting priorities ===');
    await page.locator('button').filter({ hasText: /Affordable premium/i }).click();
    await sleep(200);
    await page.locator('button').filter({ hasText: /Maximum coverage/i }).click();
    await sleep(300);
    await page.getByRole('button', { name: /Continue/i }).click();
    await sleep(5000); // Calculation theater ~2.5s

    // 9. Screenshot recommendation/plan card
    console.log('\n=== 9. Screenshot: recommendation ===');
    await takeScreenshot(page, '09-recommendation-plan');

    console.log('\n✅ Done. Screenshots in:', SCREENSHOTS_DIR);
  } catch (error) {
    console.error('Error:', error.message);
    await takeScreenshot(page, 'error-state').catch(() => {});
  } finally {
    await browser.close();
  }
}

main();
