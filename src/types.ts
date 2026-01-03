/**
 * Cloudflare Workers Environment Bindings
 */

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AI: any;
}
