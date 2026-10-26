import { liangmi } from '@liangmi/vp-config'

// Vite+ loads lint, fmt and test from this root file. Nuxt ignores it and owns
// application Vite via `nuxt.config.ts` (the B5004 warning is expected).
const siteLintIgnores = ['.nuxt/**', '.output/**', '.data/**', 'docs/**', 'public/**', '.agents/**']

const siteFmtIgnores = [
  ...siteLintIgnores,
  '**/generated/**',
  'AGENTS.md',
  'pnpm-lock.yaml',
  'skills-lock.json',
]

export default liangmi({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.{test,spec}.{js,ts}'],
  },
  lint: [
    {
      name: 'froq/ignores',
      ignores: siteLintIgnores,
    },
    {
      // Preset rules that do not match this Nuxt site's existing source.
      // Keep the PR on the toolchain; do not rewrite application code to the
      // style/restriction allowlist in one step.
      name: 'froq/compat',
      rules: {
        'eqeqeq': 'off',
        'eslint/class-methods-use-this': 'off',
        'eslint/default-case': 'off',
        'eslint/max-classes-per-file': 'off',
        'eslint/no-param-reassign': 'off',
        'import/extensions': 'off',
        'import/no-cycle': 'off',
        'import/no-default-export': 'off',
        'import/no-unassigned-import': 'off',
        'no-array-for-each': 'off',
        'no-negated-condition': 'off',
        'no-underscore-dangle': 'off',
        'no-useless-assignment': 'off',
        'node/no-sync': 'off',
        'oxc/approx-constant': 'off',
        'oxc/no-map-spread': 'off',
        'prefer-import-meta-properties': 'off',
        'promise/always-return': 'off',
        'promise/no-callback-in-promise': 'off',
        'unicorn/consistent-function-scoping': 'off',
        'unicorn/explicit-length-check': 'off',
        'unicorn/no-array-reduce': 'off',
        'unicorn/no-array-reverse': 'off',
        'unicorn/no-array-sort': 'off',
        'unicorn/no-useless-undefined': 'off',
        'unicorn/prefer-array-find': 'off',
        'unicorn/prefer-array-some': 'off',
        'unicorn/prefer-code-point': 'off',
        'unicorn/prefer-dom-node-append': 'off',
        'unicorn/prefer-dom-node-dataset': 'off',
        'unicorn/prefer-query-selector': 'off',
        'unicorn/prefer-string-replace-all': 'off',
      },
    },
    {
      name: 'froq/scripts',
      files: ['**/scripts/**'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      name: 'froq/workers',
      files: ['workers/**'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
  fmt: {
    quoteProps: 'consistent',
    singleAttributePerLine: true,
    htmlWhitespaceSensitivity: 'strict',
    trailingComma: 'all',
    sortImports: false,
    sortPackageJson: false,
    ignorePatterns: siteFmtIgnores,
  },
})
  .exclude(['pack', 'staged'])
  .option([
    {
      path: '.',
      node: true,
      browser: true,
      vue: true,
      react: false,
    },
    {
      path: 'workers/froq-api',
      node: true,
      browser: false,
      vue: false,
      react: false,
    },
  ])
  .remove('liangmi/style')
  .override('liangmi/options', {
    options: {
      typeAware: false,
      typeCheck: false,
    },
  })
