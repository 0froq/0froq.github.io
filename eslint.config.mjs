import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: ['.nuxt/**', '.output/**', '.data/**'],
    nuxt: true,
    unocss: true,
    vue: true,
    typescript: true,
  },
  {
    files: ['**/*.{vue,ts,tsx}'],
    rules: {
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: { max: 1 },
          multiline: { max: 1 },
        },
      ],
    },
  },
)
