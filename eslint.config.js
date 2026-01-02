import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import parserTs from '@typescript-eslint/parser'
import parserVue from 'vue-eslint-parser'
import pluginTs from '@typescript-eslint/eslint-plugin'

export default [
  {
    ignores: ['dist/', 'node_modules/', '.vite/']
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        parser: parserTs,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue']
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        Response: 'readonly',
        RequestInit: 'readonly',
        URLSearchParams: 'readonly',
        global: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': pluginTs,
      vue: pluginVue
    },
    rules: {
      'no-console': 'warn',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'semi': ['error', 'never'],
      'quotes': ['error', 'single'],
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'vue/no-setup-props-destructure': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        Response: 'readonly',
        RequestInit: 'readonly',
        URLSearchParams: 'readonly',
        global: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': pluginTs
    },
    rules: {
      'no-console': 'warn',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'semi': ['error', 'never'],
      'quotes': ['error', 'single'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  }
]
