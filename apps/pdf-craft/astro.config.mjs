// @ts-check
import { defineConfig } from 'astro/config';
import node from '@apphosting/astro-adapter';
import react from '@astrojs/react';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Walk up from this config file until we find the monorepo root
// (identified by pnpm-workspace.yaml). Works locally AND on Firebase
// App Hosting where the full repo is cloned to /workspace/.
function findRepoRoot(startDir) {
  let dir = startDir;
  while (true) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return startDir; // reached filesystem root, fall back
    dir = parent;
  }
}

const repoRoot    = findRepoRoot(__dirname);
const threadsRoot = resolve(repoRoot, 'packages/threads/src');

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  security: {
    checkOrigin: false,
  },
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        '@fhdamd/threads/tokens': `${threadsRoot}/tokens/tokens.css`,
        '@fhdamd/threads':        `${threadsRoot}/index.ts`,
      },
    },
  },
});
