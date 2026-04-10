/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Empty or unset = same-origin `/api` (use Vite dev proxy). Set to full origin (e.g. `http://localhost:3001`) to call the API directly. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
