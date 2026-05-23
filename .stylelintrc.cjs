module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-order'],
  ignoreFiles: [
    '**/*.js',
    '**/*.jsx',
    '**/*.ts',
    '**/*.tsx',
    'node_modules/**',
    '.next/**',
    'public/**'
  ],
  rules: {
    // Disable color-no-hex to allow hex in theme variables and simplify migration
    'color-no-hex': null,
    // Keep property ordering consistent
    'order/properties-alphabetical-order': true,
    // Some whitespace/formatting preferences
    'declaration-empty-line-before': ['always', { ignore: ['after-comment', 'first-nested'] }],
    // Allow framework-specific at-rules used in globals
    'at-rule-no-unknown': [true, { ignoreAtRules: ['custom-variant', 'theme', 'apply', 'responsive'] }],
    // Allow duplicate custom properties in globals.css (theme variants)
    'declaration-block-no-duplicate-custom-properties': null,
    // Disable strict number precision checks to avoid noisy errors from color functions
    'number-max-precision': null
  }
}
