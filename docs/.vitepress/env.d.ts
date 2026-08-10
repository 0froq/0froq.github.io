/// <reference types="vitepress/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module '~/*'
declare module '@/*'

declare module 'markdown-it-hashtag'
declare module 'markdown-it-implicit-figures'
declare module 'markdown-it-mark'
declare module 'markdown-it-ruby'
declare module 'markdown-it-bibliography'
declare module '@arothuis/markdown-it-biblatex'

interface ImportMetaEnv {
  readonly VITE_GITHUB_CLIENT_ID?: string
  readonly VITE_GITHUB_READ_TOKEN?: string
  readonly VITE_GITHUB_AUTH_PROXY?: string
  readonly VITE_FROQ_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
