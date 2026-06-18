import { test, expect } from '@playwright/test';

test('dashboard loads for authenticated user', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('main')).toBeVisible();
});

test('authenticated user on /signin is redirected to /dashboard', async ({ page }) => {
  await page.goto('/signin');
  await expect(page).toHaveURL('/dashboard');
});
