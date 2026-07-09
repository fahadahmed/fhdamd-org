import { test, expect } from '@playwright/test';

test('resources listing page loads and shows at least one article', async ({ page }) => {
  await page.goto('/resources');
  await expect(page).toHaveURL('/resources');
  await expect(page.getByRole('heading', { name: /resources/i })).toBeVisible();

  // At least one article card with a "Read article" link should be present
  const articleLinks = page.getByRole('link', { name: /read article/i });
  await expect(articleLinks.first()).toBeVisible();
});

test('clicking an article navigates to the single post and renders the title', async ({ page }) => {
  await page.goto('/resources');

  // Follow the first article link
  const firstLink = page.getByRole('link', { name: /read article/i }).first();
  await firstLink.click();

  // Single post should have an h1 and a back link
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /all articles/i })).toBeVisible();
});
