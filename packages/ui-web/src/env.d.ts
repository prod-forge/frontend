/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ASSETS_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
