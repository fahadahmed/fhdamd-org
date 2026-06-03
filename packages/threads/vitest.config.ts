import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      // Unit tests — fast, jsdom-like environment via happy-dom
      {
        test: {
          name: "unit",
          environment: "happy-dom",
          globals: true,
          include: ["src/**/*.test.tsx", "src/**/*.test.ts"],
          setupFiles: ["src/test-setup.ts"],
          css: true,
          coverage: {
            provider: "v8",
            thresholds: {
              lines: 80,
              functions: 80,
              branches: 80,
              statements: 80,
            },
          },
        },
      },
      // Storybook tests — run stories in real Chromium via Playwright
      // @storybook/addon-vitest auto-provisions the React renderer in Storybook 10.3+
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
