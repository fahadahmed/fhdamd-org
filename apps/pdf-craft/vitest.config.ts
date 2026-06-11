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
        // Astro virtual modules / full-pipeline dependencies — not runnable in Vitest
        "src/actions/**",
        "src/pages/**",
        "src/layouts/**",
        // Firebase init and Pub/Sub — integration concerns, not unit testable
        "src/firebase/**",
        "src/server/**",
        "src/env.d.ts",
        "src/types.d.ts",
      ],
    },
  },
  define: {
    "import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY": JSON.stringify("test-site-key"),
  },
  resolve: {
    alias: {
      "@fhdamd/threads": resolve(__dirname, "../../packages/threads/src/index.ts"),
      "astro:actions": resolve(__dirname, "src/test/mocks/astro-actions.ts"),
      "astro:schema": resolve(__dirname, "src/test/mocks/astro-schema.ts"),
    },
  },
});
