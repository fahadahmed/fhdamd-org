import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/**/*.test.{ts,tsx}",
        // Astro virtual modules / full-pipeline dependencies
        "src/actions/**",
        "src/pages/**",
        "src/layouts/**",
        // Firebase init and Pub/Sub — integration concerns
        "src/firebase/**",
        "src/server/**",
        "src/env.d.ts",
        "src/types.d.ts",
      ],
    },
  },
  define: {
    "import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY": JSON.stringify("test-site-key"),
    "import.meta.env.PUBLIC_BASE_FUNCTIONS_URL": JSON.stringify("https://functions.test"),
  },
  resolve: {
    alias: [
      // Design system — swap real package for a lightweight test mock
      { find: "@fhdamd/threads", replacement: resolve(__dirname, "src/test/mocks/threads.tsx") },
      // Sentry — no-op in tests
      { find: "@sentry/astro", replacement: resolve(__dirname, "src/test/mocks/sentry.ts") },
      // Astro virtual modules
      { find: "astro:actions", replacement: resolve(__dirname, "src/test/mocks/astro-actions.ts") },
      { find: "astro:schema", replacement: resolve(__dirname, "src/test/mocks/astro-schema.ts") },
      // Local Firebase client (matches relative imports that resolve to this file)
      {
        find: /.*\/firebase\/client$/,
        replacement: resolve(__dirname, "src/test/mocks/firebase-client.ts"),
      },
    ],
  },
});
