// @ts-check
import { defineConfig } from 'astro/config';
import node from '@apphosting/astro-adapter';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import sentry from '@sentry/astro';

// Pages that should not appear in the sitemap:
// - Authenticated-only utility pages (dashboard, buy-credits, payment flow)
// - Auth pages with no useful crawlable content (signin, signup, password reset)
const PRIVATE_PATHS = new Set([
  '/dashboard/',
  '/buy-credits/',
  '/payment-success/',
  '/payment-cancel/',
  '/signin/',
  '/signup/',
  '/forgot-password/',
  '/reset-password/',
]);

async function fetchArticleSlugs() {
  const functionsUrl = process.env.PUBLIC_BASE_FUNCTIONS_URL;
  if (!functionsUrl) return [];
  try {
    const res = await fetch(`${functionsUrl}/cms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryKey: 'resources' }),
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return (data?.allArticles ?? []).map((a) => `https://riqa.app/resources/${a.slug}`);
  } catch {
    return [];
  }
}

const articlePages = await fetchArticleSlugs();

// https://astro.build/config
export default defineConfig({
  site: 'https://riqa.app',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  security: {
    checkOrigin: false,
    // Astro defaults action bodies to 1 MB, which is far too small for
    // multi-file PDF/image uploads (mergePdfs, imageToPdf).
    actionBodySizeLimit: 100 * 1024 * 1024, // 100 MB
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        return !PRIVATE_PATHS.has(path);
      },
      customPages: articlePages,
    }),
    sentry({
      org: 'fhdamd',
      project: 'pdf-craft',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
