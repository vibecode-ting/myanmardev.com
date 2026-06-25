import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  console.log('=== TEST 1: Homepage ===');
  await page.goto(BASE);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-screenshots/01-homepage.png', fullPage: true });
  console.log('Homepage loaded ✓');

  // Check for console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  console.log('\n=== TEST 2: Subdomain Builder Page ===');
  await page.goto(`${BASE}/products/subdomain`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-screenshots/02-subdomain-builder.png', fullPage: true });
  console.log('Subdomain builder loaded ✓');

  console.log('\n=== TEST 3: Try Check Availability (should prompt sign-in) ===');
  const subdomainInput = page.locator('input[placeholder="myapp"]');
  if (await subdomainInput.isVisible()) {
    await subdomainInput.fill('testapp');
    await page.screenshot({ path: 'test-screenshots/03-subdomain-entered.png' });

    // Click check button
    const checkBtn = page.locator('button:has-text("SIGN IN TO CHECK")');
    if (await checkBtn.isVisible()) {
      await checkBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-screenshots/04-signin-modal.png' });
      console.log('Sign-in modal appeared ✓');

      // Check for Google sign-in button
      const googleBtn = page.locator('button:has-text("Continue with Google")');
      const githubBtn = page.locator('button:has-text("Continue with GitHub")');
      console.log(`Google button visible: ${await googleBtn.isVisible()}`);
      console.log(`GitHub button visible: ${await githubBtn.isVisible()}`);

      // Try clicking Google sign-in
      console.log('\n=== TEST 4: Google Sign-In ===');
      const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
      await googleBtn.click();
      const popup = await popupPromise;
      if (popup) {
        console.log(`Google popup URL: ${popup.url()}`);
        await page.waitForTimeout(2000);
        await popup.screenshot({ path: 'test-screenshots/05-google-popup.png' }).catch(() => {});
        console.log('Google popup opened ✓');
        await popup.close();
      } else {
        console.log('No popup detected - popup may have been blocked');
      }
    }
  }

  // Close modal if still open
  const closeBtn = page.locator('button:has-text("✕")');
  if (await closeBtn.isVisible()) await closeBtn.click();

  console.log('\n=== TEST 5: Test Subdomain API Directly ===');
  // Test the worker API
  try {
    const domainsRes = await page.evaluate(async () => {
      const res = await fetch('https://subdomain-api.myanmardev.com/domains');
      return { ok: res.ok, status: res.status, data: await res.json() };
    });
    console.log('GET /domains:', JSON.stringify(domainsRes));
  } catch (e) {
    console.log('GET /domains FAILED:', e.message);
  }

  try {
    const checkRes = await page.evaluate(async () => {
      const res = await fetch('https://subdomain-api.myanmardev.com/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: 'test123', domain: 'myanmardev.com' }),
      });
      return { ok: res.ok, status: res.status, data: await res.json() };
    });
    console.log('POST /check:', JSON.stringify(checkRes));
  } catch (e) {
    console.log('POST /check FAILED:', e.message);
  }

  console.log('\n=== TEST 6: Dashboard Page ===');
  await page.goto(`${BASE}/en/dashboard`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-screenshots/06-dashboard.png', fullPage: true });
  console.log('Dashboard loaded ✓');

  console.log('\n=== ERRORS ===');
  if (errors.length) {
    errors.forEach(e => console.log('  ❌', e));
  } else {
    console.log('  No console errors detected');
  }

  await browser.close();
  console.log('\n✅ Tests complete. Screenshots saved to test-screenshots/');
})();
