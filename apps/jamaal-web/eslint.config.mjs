import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    // env.d.ts is the Astro-generated triple-slash type reference.
    ignores: ["dist/**", ".astro/**", "coverage/**", "test-results/**", "src/env.d.ts"],
  },
];
