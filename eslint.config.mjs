import typescriptEslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import js from '@eslint/js';

export default [
  
  {
    ignores: [
      'node_modules/',
      'dist/',
      '.nest/',
      '.husky/',
      'coverage/',
      '.eslintignore'
    ]
  },
  
  js.configs.recommended,

  ...typescriptEslint.configs.recommended,
  
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptEslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ]
    }
  },
  prettier
];
