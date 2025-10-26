import baseConfig from '@fhdamd/tooling/eslint/react';

export default [
  ...baseConfig,

  // App-specific ignores
  {
    ignores: [
      'dist/**',
      '.astro/**',
      'build/**',
      'node_modules/**',
    ],
  },

  // App-specific file extensions / rules if needed
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    rules: {
      // override rules for Astro files if needed
    },
  },
];