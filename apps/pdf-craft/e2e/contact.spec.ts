import { test, expect } from '@playwright/test';

test('rejects a too-short message before hitting the network', async ({ page }) => {
  await page.goto('/contact');

  await page.getByLabel('Your name').fill('E2E Test');
  await page.getByLabel('Email address').fill('e2e-test-stg@pdf-craft.app');
  await page.getByLabel('Message').fill('too short');
  await page.getByRole('button', { name: /send message/i }).click();

  await expect(page.getByText(/message must be at least 10 characters/i)).toBeVisible();
  await expect(page.getByText(/send message/i)).toBeVisible();
});

test('submits a valid message end to end through the contact action', async ({ page }) => {
  // Real reCAPTCHA v3 scores headless traffic too low to pass, so this token
  // (only valid outside production) skips the score check server-side.
  const bypassToken = process.env.E2E_CONTACT_BYPASS_TOKEN;
  const query = bypassToken ? `?e2eBypassToken=${encodeURIComponent(bypassToken)}` : '';
  await page.goto(`/contact${query}`);

  await page.getByLabel('Your name').fill('E2E Test');
  await page.getByLabel('Email address').fill('e2e-test-stg@pdf-craft.app');
  await page.getByLabel('Subject').selectOption('general');
  await page.getByLabel('Message').fill(
    `Automated e2e contact form check — ${new Date().toISOString()}`,
  );

  await page.getByRole('button', { name: /send message/i }).click();

  await expect(page.getByText(/message sent!/i)).toBeVisible({ timeout: 30_000 });
});
