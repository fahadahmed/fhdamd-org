// @ts-check
import { defineConfig } from 'astro/config';
import node from '@apphosting/astro-adapter';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://pdf-craft.app',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  security: {
    checkOrigin: false,
  },
  integrations: [react()],
});
