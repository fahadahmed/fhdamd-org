import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// @fhdamd/threads is swapped for a light mock: the design system has its own
// test suite in packages/threads.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@fhdamd/threads": fileURLToPath(
        new URL("./src/test/mocks/threads.tsx", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "lcov"],
      // Pages, layouts and the copy in src/data are Astro pipeline code or
      // constants with nothing to unit-test.
      include: ["src/components/**/*.{ts,tsx}", "src/utils/**/*.ts"],
      exclude: ["src/**/*.test.{ts,tsx}"],
    },
  },
});
