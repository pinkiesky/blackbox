/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly API_KEY: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
