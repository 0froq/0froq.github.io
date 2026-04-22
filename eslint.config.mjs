import antfu from '@antfu/eslint-config'

export default antfu(
  {
    unocss: true,
    vue: true,
    typescript: true,
    formatters: {
      css: true,
      html: true,
      markdown: 'dprint'
    },
  },
  {
    files: [
      '**/*.{vue,ts,tsx,css}',
    ],
    rules: {
      'vue/max-attributes-per-line': ['error', {
        singleline: { max: 1 },
        multiline: { max: 1 },
      }],
      'unused-imports/no-unused-imports': 'off',
    },
  },
  {
    files: [
      '**/*.md',
    ],
    rules: {
      'markdown/no-missing-atx-heading-space': 'off',
    }
  }
)
