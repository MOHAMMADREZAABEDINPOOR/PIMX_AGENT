import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`cookie preferences do not cover chat controls at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/chat');
    await page.getByRole('button', { name: 'Essential only', exact: true }).click();
    await expect(page.locator('#composer-input')).toBeVisible();
    await expect(page.locator('.cookie-banner')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Cookie settings', exact: true })).toHaveCount(0);
    if (width < 1024) await page.getByRole('button', { name: /Connect/ }).click();
    else await page.locator('#btn-open-settings').click();
    await expect(page.locator('#settings-modal')).toBeVisible();
    await page.getByRole('button', { name: 'General & UI Display', exact: true }).click();
    const preferences = page.getByRole('button', { name: 'Cookie settings', exact: true });
    await preferences.click();
    await expect(page.locator('.cookie-banner')).toBeVisible();
    await page.getByRole('button', { name: 'Close cookie settings', exact: true }).click();
    await expect(preferences).toBeFocused();
    expect(await page.evaluate(() => localStorage.getItem('pimx_cookie_consent'))).toBe('rejected');
    await preferences.click();
    await page.getByRole('button', { name: 'Accept optional analytics', exact: true }).click();
    await expect(page.locator('.cookie-banner')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('pimx_cookie_consent'))).toBe('accepted');
    await page.reload();
    await expect(page.locator('#composer-input')).toBeVisible();
    await expect(page.locator('.cookie-banner')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Cookie settings', exact: true })).toHaveCount(0);
    await page.screenshot({ path: `artifacts/qa/cookie-chat-${width}.png` });
  });
}

test('public footer reopens saved choices and allows analytics to be revoked', async ({ page }) => {
  let visits = 0;
  await page.route('**/api/analytics', route => {
    visits++;
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Accept optional analytics', exact: true }).click();
  await expect.poll(() => visits).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Cookie settings', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.cookie-banner')).toHaveCount(0);
  await page.getByRole('button', { name: 'Cookie settings', exact: true }).click();
  await page.getByRole('button', { name: 'Essential only', exact: true }).click();
  const beforeNavigation = visits;
  await page.goto('/privacy');
  await expect(page.getByRole('button', { name: 'Cookie settings', exact: true })).toBeVisible();
  await expect(page.locator('.cookie-banner')).toHaveCount(0);
  expect(visits).toBe(beforeNavigation);
});
