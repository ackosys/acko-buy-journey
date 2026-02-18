/**
 * Full flow test for ACKO Health Insurance prototype on localhost:3000
 * Tests: Landing → Entry → Chat (name, intent, family, ages, pincode, coverage, health, needs, SI, recommendation, frequency)
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots', 'flow-3000');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function screenshot(page, name) {
  const path = join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  console.log(`  📸 ${name}.png`);
  return path;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });

  const report = { steps: [], emojis: false, botUsesName: false, pincodePresent: false, planSwitcherTabs: 0, stickyPriceBar: false, beHonestQuestion: false, addonQuestions: false };

  try {
    // ═══ STEP 1: LANDING PAGE ═══
    console.log('\n=== STEP 1: Landing Page ===');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(2000);

    const content = await page.content();
    const hasPurpleGradient = content.includes('gradient-purple') || await page.locator('.gradient-purple').count() > 0;
    const has100 = await page.getByText('100%').count() > 0;
    const has999 = await page.getByText('99.9%').count() > 0;
    const has24x7 = await page.getByText('24x7').count() > 0;
    const hasFAQ = await page.getByText(/Got questions|FAQ/i).count() > 0;
    const hasHospitals = await page.getByText(/AIIMS|hospital|14,000/i).count() > 0;
    const exploreBtn = page.getByRole('button', { name: /Explore health plans/i });
    const getQuoteBtn = page.getByRole('button', { name: /Get quote/i });

    report.steps.push({
      step: 1,
      name: 'Landing',
      purpleGradient: hasPurpleGradient,
      trust100: has100,
      trust99: has999,
      trust24x7: has24x7,
      faqSection: hasFAQ,
      hospitalPartners: hasHospitals,
      exploreBtn: await exploreBtn.count() > 0,
      getQuoteBtn: await getQuoteBtn.count() > 0,
    });
    await screenshot(page, '01-landing');

    await exploreBtn.first().click();
    await sleep(1500);

    // ═══ STEP 2: ENTRY SCREEN ═══
    console.log('\n=== STEP 2: Entry Screen ===');
    const ackoCustomerBtn = page.getByRole('button', { name: /I'm an ACKO customer/i });
    const newToAckoBtn = page.getByRole('button', { name: /I'm new to ACKO/i });
    report.steps.push({
      step: 2,
      name: 'Entry',
      ackoCustomer: await ackoCustomerBtn.count() > 0,
      newToAcko: await newToAckoBtn.count() > 0,
    });
    await screenshot(page, '02-entry');
    await newToAckoBtn.click();
    await sleep(6000); // Wait for welcome + name ask

    // ═══ STEP 3: CHAT - Name ═══
    console.log('\n=== STEP 3: Chat - Name Input ===');
    await screenshot(page, '03-chat-name-ask');
    const nameInput = page.locator('input[placeholder*="name" i], input[placeholder*="Your name" i]');
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput.fill('Priya');
    await page.locator('button').filter({ hasText: /Continue|Submit|→/ }).first().click();
    await sleep(5000);

    // ═══ STEP 4: Intent - What brings you ═══
    console.log('\n=== STEP 4: Intent Selection ===');
    const priyaMention = await page.getByText(/Priya|priya/).count() > 0;
    if (priyaMention) report.botUsesName = true;
    await screenshot(page, '04-intent');
    const whichPlanBtn = page.locator('button').filter({ hasText: /Which plan fits my family/i });
    await whichPlanBtn.waitFor({ state: 'visible', timeout: 8000 });
    await whichPlanBtn.click();
    await sleep(5000);

    // ═══ STEP 5: Family - Who to cover ═══
    console.log('\n=== STEP 5: Family Profiling ===');
    await screenshot(page, '05-family-who');
    await page.getByRole('button', { name: /Myself/i }).click();
    await sleep(300);
    await page.getByRole('button', { name: /Spouse/i }).click();
    await sleep(300);
    await page.getByRole('button', { name: /Continue/i }).click();
    await sleep(4000);

    // ═══ STEP 6: Ages ═══
    console.log('\n=== STEP 6: Age Inputs ===');
    const ageInput = page.locator('input[placeholder*="age" i], input[placeholder*="Your" i]');
    await ageInput.first().waitFor({ state: 'visible', timeout: 10000 });
    await ageInput.first().fill('30');
    await page.locator('button').filter({ hasText: /Continue/ }).first().click();
    await sleep(4000);
    await page.locator('input[placeholder*="age" i], input[placeholder*="Spouse" i]').first().fill('32');
    await page.locator('button').filter({ hasText: /Continue/ }).first().click();
    await sleep(5000);

    // ═══ STEP 7: Pincode ═══
    console.log('\n=== STEP 7: Pincode ===');
    const pincodeInput = page.locator('input[placeholder*="pincode" i], input[placeholder*="6-digit" i]');
    const pincodeFound = await pincodeInput.count() > 0;
    if (pincodeFound) report.pincodePresent = true;
    await screenshot(page, '07-pincode');
    if (pincodeFound) {
      await pincodeInput.fill('560001');
      await page.getByRole('button', { name: /Find hospitals near me|Continue/i }).click();
      await sleep(5000);
    }

    // Nearby hospitals
    await screenshot(page, '08-nearby-hospitals');

    // ═══ STEP 8: Coverage ═══
    console.log('\n=== STEP 8: Coverage ===');
    const noneCoverage = page.locator('button').filter({ hasText: /No, I don't have any|don't have any/i });
    await noneCoverage.waitFor({ state: 'visible', timeout: 8000 });
    await noneCoverage.click();
    await sleep(5000);

    // ═══ STEP 9: Health conditions ═══
    console.log('\n=== STEP 9: Health Conditions ===');
    const beHonest = await page.getByText(/be honest|Be honest/i).count() > 0;
    if (beHonest) report.beHonestQuestion = true;
    await screenshot(page, '09-health');
    const noneCondition = page.locator('button').filter({ hasText: /None of the above|none/i }).first();
    if (await noneCondition.count() > 0) {
      await noneCondition.click();
      await sleep(300);
      await page.getByRole('button', { name: /Continue/i }).click();
    }
    await sleep(5000);

    // ═══ STEP 10: Needs ═══
    console.log('\n=== STEP 10: Needs ===');
    await screenshot(page, '10-needs');
    const affordableBtn = page.locator('button').filter({ hasText: /Affordable premium/i });
    if (await affordableBtn.count() > 0) {
      await affordableBtn.click();
      await sleep(300);
      await page.getByRole('button', { name: /Continue/i }).click();
    }
    await sleep(5000);

    // ═══ STEP 11: Sum Insured ═══
    console.log('\n=== STEP 11: Sum Insured ===');
    await screenshot(page, '11-sum-insured');
    const siOption = page.locator('button').filter({ hasText: /25 lakh|10 lakh|50 lakh/i }).first();
    if (await siOption.count() > 0) {
      await siOption.click();
    }
    await sleep(6000); // Calculation theater

    // ═══ STEP 12: Plan Recommendation / Switcher ═══
    console.log('\n=== STEP 12: Plan Switcher ===');
    await screenshot(page, '12-plan-recommendation');
    const platinumTab = page.getByRole('button', { name: /Platinum/i });
    const platinumLiteTab = page.getByRole('button', { name: /Platinum Lite/i });
    const superTopupTab = page.getByRole('button', { name: /Super Top-up|Super Topup/i });
    report.planSwitcherTabs = (await platinumTab.count() > 0 ? 1 : 0) + (await platinumLiteTab.count() > 0 ? 1 : 0) + (await superTopupTab.count() > 0 ? 1 : 0);
    if (await platinumLiteTab.count() > 0) await platinumLiteTab.click();
    await sleep(1000);
    if (await superTopupTab.count() > 0) await superTopupTab.click();
    await sleep(2000);
    await screenshot(page, '13-plan-tabs-clicked');

    // ═══ STEP 13: Payment Frequency ═══
    console.log('\n=== STEP 13: Payment Frequency ===');
    const continuePlanBtn = page.locator('button').filter({ hasText: /Continue|Select|Choose/i });
    if (await continuePlanBtn.count() > 0) await continuePlanBtn.first().click();
    await sleep(5000);
    await screenshot(page, '14-frequency');
    const recommendedBadge = await page.getByText(/Recommended|Save 8%/i).count() > 0;
    const yearlyOption = await page.getByText(/Yearly|yearly/i).count() > 0;

    // Check for sticky price bar
    const priceBar = page.locator('[class*="sticky"][class*="price"], [class*="price"][class*="sticky"], [class*="PriceBar"]');
    report.stickyPriceBar = await priceBar.count() > 0;

    // Check for add-on questions
    const opdQuestion = await page.getByText(/OPD|Doctor on Call|add-on/i).count() > 0;
    if (opdQuestion) report.addonQuestions = true;

    // Check for emojis in page
    const bodyText = await page.locator('body').innerText();
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    report.emojis = emojiRegex.test(bodyText);

    // Final report
    console.log('\n========== TEST REPORT ==========');
    console.log(JSON.stringify(report, null, 2));
    console.log('\nKey checks:');
    console.log('  Emojis present?', report.emojis ? 'YES (should be NO)' : 'NO ✓');
    console.log('  Bot uses name (Priya)?', report.botUsesName ? 'YES ✓' : 'NO (should be YES)');
    console.log('  Pincode step present?', report.pincodePresent ? 'YES ✓' : 'NO (should be YES)');
    console.log('  Plan switcher tabs (3)?', report.planSwitcherTabs, report.planSwitcherTabs >= 3 ? '✓' : '(expected 3)');
    console.log('  Sticky price bar?', report.stickyPriceBar ? 'YES (should be NO)' : 'NO ✓');
    console.log('  "Be honest" question?', report.beHonestQuestion ? 'YES (should be NO)' : 'NO ✓');
    console.log('  Add-on questions?', report.addonQuestions ? 'YES (should be NO)' : 'NO ✓');
  } catch (err) {
    console.error('Error:', err.message);
    await screenshot(page, 'error').catch(() => {});
  } finally {
    await browser.close();
  }
}

main();
