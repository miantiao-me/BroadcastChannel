import type { EnvCapableAstro } from '../types'

/**
 * Reads an env variable from Vite's import.meta.env first, then falls back to
 * the Cloudflare/runtime env bindings exposed via Astro.locals.runtime.env,
 * then process.env as a last resort (covers Cloudflare Pages where Vite
 * static-replaces import.meta.env at build time and the runtime object may
 * not carry every binding).
 *
 * Boolean strings ("true" / "false") are normalized to actual booleans so
 * callers can use simple truthy checks.
 */
export function getEnv(
  env: Record<string, string | undefined>,
  Astro: EnvCapableAstro,
  name: string,
): string | boolean | undefined {
  const value = env[name]
    ?? Astro.locals?.runtime?.env?.[name]
    ?? (typeof process !== 'undefined' ? process.env[name] : undefined)
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}
