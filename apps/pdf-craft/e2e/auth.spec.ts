import { test, expect } from '@playwright/test';

test('sign-in page renders', async ({ page }) => {
  await page.goto('/signin');
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
});

test('unauthenticated user is redirected from /dashboard to /signin', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/signin/);
});

test('unauthenticated user is redirected from /encryptpdf to /signin', async ({ page }) => {
  await page.goto('/encryptpdf');
  await expect(page).toHaveURL(/\/signin/);
});
