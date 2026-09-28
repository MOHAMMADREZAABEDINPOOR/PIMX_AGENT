import { test, expect } from '@playwright/test';

test('all provider logos decode in light and dark settings', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pimx_cookie_consent', 'rejected'));
  await page.goto('/chat');
  await expect(page.locator('#composer-input')).toBeVisible();
  await page.locator('#btn-composer-model').click();
  for (const theme of ['Light Mode', 'Dark Mode']) {
    await page.getByRole('button', { name: 'Theme & Styling', exact: true }).click();
    await page.getByRole('button', { name: theme }).click();
    await page.getByRole('button', { name: 'Providers & API Keys', exact: true }).click();
    const logos = page.locator('#settings-modal img');
    await expect(logos).toHaveCount(16);
    await expect.poll(() => logos.evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    await expect(page.locator('#settings-modal img[alt="minimax"]')).toHaveAttribute('src', '/logos/minimax.webp');
    await expect.poll(() => page.locator('#settings-modal img[alt="openai"]').evaluate(image => getComputedStyle(image).filter)).toBe(theme === 'Dark Mode' ? 'invert(1)' : 'none');
    await page.screenshot({ path: `artifacts/qa/provider-logos/${theme.split(' ')[0].toLowerCase()}.png` });
  }
});
