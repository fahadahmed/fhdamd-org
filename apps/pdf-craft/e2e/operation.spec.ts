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

test('compress a PDF end to end through pdf-processor', async ({ page }) => {
  await page.goto('/compresspdf');
  await expect(page).toHaveURL('/compresspdf');

  await page.getByLabel('Upload PDF').setInputFiles(SAMPLE_PDF);
  await page.getByRole('button', { name: /compress pdf/i }).click();

  // Authenticated users see "Compression complete" callout + download link.
  // Anonymous users see "Your PDF has been compressed" — different text, so check the link.
  await expect(page.getByRole('link', { name: /download compressed pdf/i })).toBeVisible({ timeout: 60_000 });
});

test('split a PDF end to end using extract mode', async ({ page }) => {
  await page.goto('/splitpdf');
  await expect(page).toHaveURL('/splitpdf');

  await page.getByLabel('Upload PDF').setInputFiles(SAMPLE_PDF);

  // Wait for pdfjs to parse the PDF and render at least the first page before switching mode.
  // Without this, selectAll fires against an empty page list and Extract stays disabled.
  await expect(page.getByLabel('Page 1')).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: /extract/i }).click();

  // Select all pages and extract
  await page.getByRole('button', { name: /select all/i }).click();
  await page.getByRole('button', { name: /extract/i, exact: true }).last().click();

  await expect(page.getByText(/your pdf has been processed/i)).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('link', { name: /download pdf/i })).toBeVisible();
});

test('sign pdf page loads and accepts a file upload', async ({ page }) => {
  await page.goto('/signpdf');
  await expect(page).toHaveURL('/signpdf');

  await page.getByLabel('Upload PDF').setInputFiles(SAMPLE_PDF);

  // After upload the signature placement canvas should become visible
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 30_000 });
});
