/**
 * Test emoji presence across ACKO Health Insurance prototype
 * Checks for visual personality via emojis at each step
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots', 'emoji-check');
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

function hasEmojis(text) {
  if (!text) return false;
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{231A}-\u{231B}]|[\u{23F0}-\u{23F3}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/u;
  return emojiRegex.test(text);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });

  const report = { steps: [], emojiCount: 0, overall: false };

  try {
    // STEP 1: LANDING PAGE
    console.log('\n=== STEP 1: Landing Page (emoji check) ===');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(2000);

    const landingBody = await page.locator('body').innerText();
    const landingEmojis = hasEmojis(landingBody);
    report.steps.push({ step: 'Landing', hasEmojis: landingEmojis });
    await screenshot(page, '01-landing');

    await page.getByRole('button', { name: /Explore health plans|Get quote/i }).first().click();
    await sleep(1500);

    // STEP 2: ENTRY SCREEN
    console.log('\n=== STEP 2: Entry Screen (emoji check) ===');
    const entryBody = await page.locator('body').innerText();
    const entryEmojis = hasEmojis(entryBody);
    report.steps.push({ step: 'Entry', hasEmojis: entryEmojis });
    await screenshot(page, '02-entry');

    await page.getByRole('button', { name: /I'm new to ACKO/i }).click();
    await sleep(8000);

    // STEP 3: CHAT - Name, Intent, Family
    console.log('\n=== STEP 3: Chat Flow (emoji check) ===');
    const chatBody1 = await page.locator('body').innerText();
    const chatEmojis1 = hasEmojis(chatBody1);
    report.steps.push({ step: 'Chat (name/intent)', hasEmojis: chatEmojis1 });
    await screenshot(page, '03-chat-name-intent');

    const nameInput = page.locator('input[placeholder*="name" i], input[placeholder*="Your name" i]');
    if (await nameInput.count() > 0) {
      await nameInput.fill('Priya');
      await page.locator('button').filter({ hasText: /Continue/ }).first().click();
      await sleep(5000);
    }

    const whichPlan = page.locator('button').filter({ hasText: /Which plan fits my family/i });
    if (await whichPlan.count() > 0) {
      await whichPlan.click();
      await sleep(4000);
    }

    await page.getByRole('button', { name: /Myself/i }).click();
    await sleep(200);
    await page.getByRole('button', { name: /Spouse/i }).click();
    await sleep(200);
    await page.getByRole('button', { name: /Continue/i }).click();
    await sleep(4000);

    const chatBody2 = await page.locator('body').innerText();
    report.steps.push({ step: 'Chat (family)', hasEmojis: hasEmojis(chatBody2) });
    await screenshot(page, '04-chat-family');

    // Ages
    await page.locator('input[placeholder*="age" i], input[placeholder*="Your" i]').first().fill('30');
    await page.locator('button').filter({ hasText: /Continue/ }).first().click();
    await sleep(3500);
    await page.locator('input[placeholder*="age" i], input[placeholder*="Spouse" i]').first().fill('28');
    await page.locator('button').filter({ hasText: /Continue/ }).first().click();
    await sleep(5000);

    // Pincode
    const pincodeInput = page.locator('input[placeholder*="pincode" i], input[placeholder*="6-digit" i]');
    if (await pincodeInput.count() > 0) {
      await pincodeInput.fill('560001');
      await page.getByRole('button', { name: /Find hospitals near me|Continue/i }).click();
      await sleep(5000);
    }

    const chatBody3 = await page.locator('body').innerText();
    report.steps.push({ step: 'Chat (ages/pincode)', hasEmojis: hasEmojis(chatBody3) });
    await screenshot(page, '05-chat-pincode');

    // Coverage, health, needs
    const noneCoverage = page.locator('button').filter({ hasText: /No, I don't have any|don't have any/i });
    if (await noneCoverage.count() > 0) {
      await noneCoverage.click();
      await sleep(5000);
    }

    const noneCondition = page.locator('button').filter({ hasText: /None of the above|none/i }).first();
    if (await noneCondition.count() > 0) {
      await noneCondition.click();
      await sleep(200);
      await page.getByRole('button', { name: /Continue/i }).click();
      await sleep(4000);
    }

    const affordableBtn = page.locator('button').filter({ hasText: /Affordable premium/i });
    if (await affordableBtn.count() > 0) {
      await affordableBtn.click();
      await sleep(200);
      await page.getByRole('button', { name: /Continue/i }).click();
      await sleep(4000);
    }

    const siOption = page.locator('button').filter({ hasText: /25 lakh|10 lakh|50 lakh/i }).first();
    if (await siOption.count() > 0) {
      await siOption.click();
    }
    await sleep(7000);

    const chatBody4 = await page.locator('body').innerText();
    report.steps.push({ step: 'Chat (health/needs/SI)', hasEmojis: hasEmojis(chatBody4) });
    await screenshot(page, '06-chat-plan-recommendation');

    // Final emoji count
    const fullBody = await page.locator('body').innerText();
    const emojiMatches = fullBody.match(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2705}\u{2714}\u{2B50}]/gu);
    report.emojiCount = emojiMatches ? emojiMatches.length : 0;
    report.overall = report.steps.every(s => s.hasEmojis);

    console.log('\n========== EMOJI REPORT ==========');
    console.log(JSON.stringify(report, null, 2));
    console.log('\nEmojis present throughout?', report.overall ? 'YES' : 'NO');
    console.log('Total emoji count on final page:', report.emojiCount);
  } catch (err) {
    console.error('Error:', err.message);
    await screenshot(page, 'error').catch(() => {});
  } finally {
    await browser.close();
  }
}

main();
