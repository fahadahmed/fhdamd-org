import baseConfig from './index.js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  ...baseConfig,
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...Object.assign({}, ...baseConfig.map(cfg => cfg.rules || {})),
      // add react-specific rules here if needed
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];
