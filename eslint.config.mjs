import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: {
    tsconfigPath: './tsconfig.json',
    overrides: {
      'ts/no-floating-promises': 'error',
      'ts/consistent-type-imports': 'error',

    },
  },
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
  ],

  rules: {
    'style/quotes': ['error', 'single'],
    'antfu/if-newline': 'off',
    'node/prefer-global/process': 'off',
    'perfectionist/sort-imports': 'error',
    'style/multiline-ternary': ['error', 'always-multiline'],
    'style/padding-line-between-statements': ['error', {
      blankLine: 'always',
      prev: 'var',
      next: 'return',
    }],
    'style/object-curly-newline': ['error', {
      ObjectExpression: 'always',
      ObjectPattern: {
        multiline: true,
      },
      ImportDeclaration: 'never',
      ExportDeclaration: {
        multiline: true,
        minProperties: 3,
      },
    }],
    'style/indent': ['error', 2],
    'style/no-multiple-empty-lines': ['error', {
      max: 1,
      maxBOF: 0,
    }],
    'style/space-in-parens': ['error', 'never'],
    'style/function-paren-newline': ['error', 'multiline'],
    'arrow-body-style': ['warn', 'as-needed', {
      requireReturnForObjectLiteral: true,
    }],
    'object-shorthand': ['warn', 'always'],
    'ts/strict-boolean-expressions': 'off',
    'unicorn/throw-new-error': 'off',
  },

})
