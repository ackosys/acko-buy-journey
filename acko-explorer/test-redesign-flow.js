/**
 * Test redesigned ACKO prototype - visual design verification
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots', 'redesign-test');
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

  const report = {};

  try {
    // 1. LANDING PAGE
    console.log('\n=== 1. LANDING PAGE ===');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(2000);
    report.landingVisual = true;
    await screenshot(page, '01-landing');
    await page.getByRole('button', { name: /Explore health plans|Get quote/i }).first().click();
    await sleep(1500);

    // 2. ENTRY SCREEN
    console.log('\n=== 2. ENTRY SCREEN ===');
    const hasCarEmoji = (await page.locator('text=🚗').count()) > 0;
    const hasWaveEmoji = (await page.locator('text=👋').count()) > 0;
    report.entryLargeEmojis = hasCarEmoji && hasWaveEmoji;
    await screenshot(page, '02-entry');
    await page.getByRole('button', { name: /I'm new to ACKO/i }).click();
    await sleep(6000);

    // 3. CHAT - Name
    console.log('\n=== 3. CHAT - Name input ===');
    const botWhite = await page.locator('.chat-bubble-bot.bg-white').count() > 0 || await page.locator('[class*="bg-white"][class*="chat"]').count() > 0;
    const userPurple = await page.locator('.bg-purple-600').count() > 0;
    const ackoAvatar = await page.locator('img[alt="ACKO"]').count() > 0;
    report.botWhiteBoxes = botWhite;
    report.userPurpleBoxes = userPurple;
    report.ackoLogoAvatar = ackoAvatar;
    await screenshot(page, '03-chat-name');
    await page.locator('input[placeholder*="name" i], input[placeholder*="first" i]').fill('Priya');
    await page.locator('button').filter({ hasText: /Continue/ }).first().click();
    await sleep(5000);

    // 4. Name acknowledgment
    const hasThankYou = (await page.locator('text=Nice to meet you').count()) > 0 || (await page.locator('text=Priya').count()) > 0;
    report.nameAcknowledgment = hasThankYou;
    await screenshot(page, '04-name-ack');

    // 5. Readiness - Comparing options
    console.log('\n=== 5. READINESS - Comparing options ===');
    const readinessCards = await page.locator('button').filter({ hasText: /Comparing options|Just exploring|Ready to purchase/i }).count() > 0;
    report.readinessGridCards = readinessCards;
    await screenshot(page, '05-readiness');
    await page.locator('button').filter({ hasText: /Comparing options/i }).click();
    await sleep(4000);

    // 6. Family selection
    console.log('\n=== 6. FAMILY SELECTION ===');
    const familyEmojis = (await page.locator('text=🧑').count()) > 0 || (await page.locator('text=💑').count()) > 0;
    report.familyGridWithEmojis = familyEmojis;
    await screenshot(page, '06-family');
    await page.getByRole('button', { name: /Myself/i }).click();
    await sleep(200);
    await page.getByRole('button', { name: /Spouse/i }).click();
    await sleep(200);
    await page.getByRole('button', { name: /Continue/ }).click();
    await sleep(4000);

    // 7. Ages - YOUR age, then ELDEST
    console.log('\n=== 7. AGES ===');
    await page.locator('input[placeholder*="age" i], input[placeholder*="Your" i]').first().fill('30');
    await page.locator('button').filter({ hasText: /Continue/ }).first().click();
    await sleep(4000);
    await page.locator('input[placeholder*="age" i], input[placeholder*="Eldest" i]').first().fill('28');
    await page.locator('button').filter({ hasText: /Continue/ }).first().click();
    await sleep(5000);
    const ageAck = (await page.locator('text=Perfect').count()) > 0 || (await page.locator('text=member').count()) > 0;
    report.ageAcknowledgment = ageAck;
    await screenshot(page, '07-ages');

    // 8. PINCODE
    console.log('\n=== 8. PINCODE ===');
    await page.locator('input[placeholder*="pincode" i], input[placeholder*="6-digit" i]').fill('560001');
    await page.getByRole('button', { name: /Find hospitals|Continue/i }).click();
    await sleep(6000);
    const hospitalList = await page.locator('text=hospital').count() > 0;
    const hospitalWidget = await page.locator('[class*="HospitalList"], [class*="hospital"]').count() > 0;
    report.hospitalListWidget = hospitalList || hospitalWidget;
    await screenshot(page, '08-pincode-hospital');

    // 9. Coverage, health, needs
    const noneCoverage = page.locator('button').filter({ hasText: /No insurance yet|No, I don't/i });
    if (await noneCoverage.count() > 0) {
      await noneCoverage.click();
      await sleep(5000);
    }
    const noneCondition = page.locator('button').filter({ hasText: /None of the above|none/i }).first();
    if (await noneCondition.count() > 0) {
      await noneCondition.click();
      await sleep(200);
      await page.getByRole('button', { name: /Continue/ }).click();
      await sleep(4000);
    }
    const needsBtn = page.locator('button').filter({ hasText: /Affordable|premium/i }).first();
    if (await needsBtn.count() > 0) {
      await needsBtn.click();
      await sleep(200);
      await page.getByRole('button', { name: /Continue/ }).click();
      await sleep(4000);
    }
    const siBtn = page.locator('button').filter({ hasText: /25 lakh|10 lakh|50 lakh/i }).first();
    if (await siBtn.count() > 0) await siBtn.click();
    await sleep(7000);

    // 10. PLAN RECOMMENDATION
    console.log('\n=== 10. PLAN RECOMMENDATION ===');
    const planTabs = (await page.getByRole('button', { name: /Platinum/i }).count()) > 0;
    const seeAllBenefits = (await page.locator('text=See all benefits').count()) > 0;
    report.planSwitcherTabs = planTabs;
    report.seeAllBenefitsButton = seeAllBenefits;
    await screenshot(page, '09-plan-recommendation');
    if (seeAllBenefits) {
      await page.locator('button').filter({ hasText: /See all benefits/i }).first().click();
      await sleep(1500);
      await screenshot(page, '10-plan-expanded');
    }

    // 11. Frequency
    const continuePlan = page.locator('button').filter({ hasText: /Continue with|Select|Choose/i });
    if (await continuePlan.count() > 0) await continuePlan.first().click();
    await sleep(5000);
    const frequencyGrid = (await page.locator('text=Yearly').count()) > 0;
    const savingsBadge = (await page.locator('text=Save').count()) > 0 || (await page.locator('text=Recommended').count()) > 0;
    report.frequencyGridLayout = frequencyGrid;
    report.savingsBadge = savingsBadge;
    await screenshot(page, '11-frequency');

    // 12. Edit icon on hover
    console.log('\n=== 12. EDIT ICON ON HOVER ===');
    const userBubble = page.locator('.chat-bubble-user, .bg-purple-600').first();
    if (await userBubble.count() > 0) {
      await userBubble.hover();
      await sleep(500);
      const editIcon = await page.locator('button[title="Edit this answer"]').count() > 0;
      report.editIconOnHover = editIcon;
      await screenshot(page, '12-edit-hover');
    }

    // Header ACKO logo
    const headerLogo = await page.locator('header img[alt="ACKO"]').count() > 0;
    report.ackoLogoInHeader = headerLogo;

    // Single merged messages
    const singleBubble = await page.locator('.chat-bubble-bot').count();
    report.botMessageCount = singleBubble;

    console.log('\n========== REPORT ==========');
    console.log(JSON.stringify(report, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    await screenshot(page, 'error').catch(() => {});
  } finally {
    await browser.close();
  }
}

main();
