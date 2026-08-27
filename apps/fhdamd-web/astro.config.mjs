// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sentry from '@sentry/astro';

// https://astro.build/config
export default defineConfig({
  output: 'static',

  integrations: [
    react(),
    mdx(),
    sentry({
      org: 'fhdamd',
      project: 'fhdamd-web',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
