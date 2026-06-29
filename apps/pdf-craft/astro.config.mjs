// @ts-check
import { defineConfig } from 'astro/config';
import node from '@apphosting/astro-adapter';
import react from '@astrojs/react';
import sentry from '@sentry/astro';

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
    sentry({
      org: 'fhdamd',
      project: 'pdf-craft',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
