/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Cloudflare Web Analytics site token, from the dashboard's Manage site snippet. Unset: no analytics. */
  readonly VITE_CF_ANALYTICS_TOKEN?: string;
  /** The production hostname, e.g. wristcheck.example. Analytics loads only on exactly this host. */
  readonly VITE_ANALYTICS_HOST?: string;
}
