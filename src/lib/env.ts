import type { EnvCapableAstro } from '../types'

/**
 * Reads an env variable from Vite's import.meta.env first, then falls back to
 * the Cloudflare/runtime env bindings exposed via Astro.locals.runtime.env.
 */
export function getEnv(
  env: Record<string, string | undefined>,
  Astro: EnvCapableAstro,
  name: string,
): string | undefined {
  return env[name] ?? Astro.locals?.runtime?.env?.[name]
}
