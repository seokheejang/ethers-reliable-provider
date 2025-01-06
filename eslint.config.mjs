import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: globals.browser,
      parser: parser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  pluginJs.configs.recommended,
  tseslint.configs.recommended,
];
