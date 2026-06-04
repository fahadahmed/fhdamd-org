import * as tsParserPkg from '@typescript-eslint/parser';
import * as tsPluginPkg from '@typescript-eslint/eslint-plugin';
import eslintPluginAstro from 'eslint-plugin-astro';

const tsParser = tsParserPkg.default ?? tsParserPkg;
const tsPlugin = tsPluginPkg.default ?? tsPluginPkg;

export default [
  // Astro recommended rules
  ...eslintPluginAstro.configs.recommended,

  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.d.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },

  // Ignore generated folders
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**', 'build/**'],
  },
];
