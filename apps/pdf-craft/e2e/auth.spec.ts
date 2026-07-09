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

// Operation pages are now public — unauthenticated visitors see the tool, not a redirect.
// The file <input> is hidden by CSS inside the FileDropzone — check the visible heading and
// the dropzone button text instead.
test('unauthenticated user can access /encryptpdf without being redirected', async ({ page }) => {
  await page.goto('/encryptpdf');
  await expect(page).toHaveURL('/encryptpdf');
  await expect(page.getByRole('heading', { name: /protect pdf/i })).toBeVisible();
  await expect(page.getByText(/drag and drop or click to browse/i)).toBeVisible();
});

test('unauthenticated user can access /mergepdf without being redirected', async ({ page }) => {
  await page.goto('/mergepdf');
  await expect(page).toHaveURL('/mergepdf');
  await expect(page.getByRole('heading', { name: /merge pdfs/i })).toBeVisible();
  await expect(page.getByText(/drag and drop or click to browse/i)).toBeVisible();
});

test('unauthenticated user can access /splitpdf without being redirected', async ({ page }) => {
  await page.goto('/splitpdf');
  await expect(page).toHaveURL('/splitpdf');
  await expect(page.getByRole('heading', { name: /split pdf/i })).toBeVisible();
  await expect(page.getByText(/drag and drop or click to browse/i)).toBeVisible();
});

test('unauthenticated user can access /compresspdf without being redirected', async ({ page }) => {
  await page.goto('/compresspdf');
  await expect(page).toHaveURL('/compresspdf');
  await expect(page.getByRole('heading', { name: /compress pdf/i })).toBeVisible();
  await expect(page.getByText(/drag and drop or click to browse/i)).toBeVisible();
});

test('unauthenticated user can access /signpdf without being redirected', async ({ page }) => {
  await page.goto('/signpdf');
  await expect(page).toHaveURL('/signpdf');
  await expect(page.getByRole('heading', { name: /sign pdf/i })).toBeVisible();
  await expect(page.getByText(/drag and drop or click to browse/i)).toBeVisible();
});
