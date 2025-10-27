import js from '@eslint/js';
import * as tsParserPkg from '@typescript-eslint/parser';
import * as tsPluginPkg from '@typescript-eslint/eslint-plugin';
import * as reactPluginPkg from 'eslint-plugin-react';
import * as reactHooksPkg from 'eslint-plugin-react-hooks';

// Resolve default exports
const tsParser = tsParserPkg.default ?? tsParserPkg;
const tsPlugin = tsPluginPkg.default ?? tsPluginPkg;
const reactPlugin = reactPluginPkg.default ?? reactPluginPkg;
const reactHooks = reactHooksPkg.default ?? reactHooksPkg;

export default [
  // Base JS rules
  js.configs.recommended,

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

  // React files
  {
    files: ['**/*.jsx', '**/*.tsx'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  // Ignore generated folders
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**', 'build/**'],
  },
];
