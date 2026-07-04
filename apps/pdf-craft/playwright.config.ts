import { defineConfig, devices } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local for local runs — Playwright doesn't auto-load it the way Astro/Vite does.
// Only handles simple single-line key=value pairs; multi-line values (e.g. the service-account
// JSON block) are skipped — set FIREBASE_SERVICE_ACCOUNT_KEY in your shell for those.
// Never runs in CI/staging (no .env.local present there).
function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const raw = trimmed.slice(eq + 1).trim();
    // Skip multi-line values — they start with an opening quote but don't close on the same line
    if ((raw.startsWith("'") && !raw.endsWith("'")) || (raw.startsWith('"') && !raw.endsWith('"'))) continue;
    const value = raw.replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

const LOCAL_URL = 'http://localhost:4321';
const isLocal = !process.env.CI && (!process.env.BASE_URL || process.env.BASE_URL.includes('localhost'));
if (isLocal) loadEnvLocal();

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global.setup.ts',
  outputDir: 'test-results/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env.BASE_URL ?? (isLocal ? LOCAL_URL : 'https://stg.riqa.app'),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // Auto-start the Astro dev server when running locally (no BASE_URL or localhost BASE_URL)
  webServer: isLocal ? {
    command: 'pnpm --filter pdf-craft dev',
    url: LOCAL_URL,
    reuseExistingServer: true, // attach to an already-running server if present
    timeout: 120_000,
  } : undefined,
  projects: [
    // Unauthenticated — tests auth redirect behaviour, no stored session
    {
      name: 'unauthenticated',
      testMatch: /auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Authenticated — dashboard + operations run with the __session cookie pre-loaded
    {
      name: 'authenticated',
      testIgnore: /auth\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
    },
  ],
});
