// @ts-check
import { defineConfig } from 'astro/config';
import node from '@apphosting/astro-adapter';
import react from '@astrojs/react';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const threadsRoot = resolve(__dirname, '../../packages/threads/src');

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
        // Map the package to its source so it works without pnpm install
        '@fhdamd/threads/tokens': `${threadsRoot}/tokens/tokens.css`,
        '@fhdamd/threads':        `${threadsRoot}/index.ts`,
      },
    },
  },
});
