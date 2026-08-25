import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    reporters: ["default", "junit"],
    outputFile: { junit: "./test-results/junit.xml" },
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/**/*.test.{ts,tsx}",
        // Astro pipeline code — not unit-testable in isolation
        "src/pages/**",
        "src/layouts/**",
        "src/content/**",
        "src/content.config.ts",
        "src/components/mdx/**",
        "src/lib/**",
        "src/env.d.ts",
        // Static SVG markup and constant data — no logic to exercise
        "src/components/icons/**",
        "src/data/**",
      ],
    },
  },
  resolve: {
    alias: [
      // Design system — swap real package for a lightweight test mock,
      // matching pdf-craft's own vitest setup.
      {
        find: "@fhdamd/threads",
        replacement: resolve(__dirname, "src/test/mocks/threads.tsx"),
      },
    ],
  },
});
