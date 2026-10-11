import { defineConfig } from "vitest/config";

// Own config so Vitest does not pick up the site's jsdom/React setup one level up.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
