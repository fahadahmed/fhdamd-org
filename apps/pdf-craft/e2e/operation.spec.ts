import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_PDF = path.join(__dirname, 'fixtures', 'sample.pdf');

test('encrypt a PDF end to end through pdf-processor', async ({ page }) => {
  await page.goto('/encryptpdf');
  await expect(page).toHaveURL('/encryptpdf');

  await page.getByLabel('Upload PDF').setInputFiles(SAMPLE_PDF);
  await page.locator('#userPassword').fill('e2e-test-password');

  await page.getByRole('button', { name: /protect pdf/i }).click();

  await expect(page.getByText(/your pdf is protected/i)).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('link', { name: /download protected pdf/i })).toBeVisible();
});
