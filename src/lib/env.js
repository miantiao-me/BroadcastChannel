// Compatibility shim: re-exports everything from env.ts so that callers
// importing '../lib/env' resolve to a single source of truth regardless of
// whether the bundler picks the .js or .ts file.
//
// env.ts is the authoritative implementation per AGENTS.md:
//   "Shared env helpers are in src/lib/env.ts; runtime process.env wins over
//    build-time import.meta.env, and they do not read Astro.locals.runtime.env."
//
// The legacy 3-arg getEnv(env, Astro, name) signature is preserved by ignoring
// the middle Astro argument and delegating to env.ts's 2-arg getEnv(env, name).

import {
  DEFAULT_TELEGRAM_HOST,
  getBooleanEnv as _getBooleanEnv,
  getEnv as _getEnv,
  getStaticProxy as _getStaticProxy,
  getTargetWhitelist as _getTargetWhitelist,
  getTelegramHost as _getTelegramHost,
  parseCsvList as _parseCsvList,
  parseDelimitedItems as _parseDelimitedItems,
} from './env.ts'

export const DEFAULT_TELEGRAM_HOST = DEFAULT_TELEGRAM_HOST
export const getStaticProxy = _getStaticProxy
export const getTelegramHost = _getTelegramHost
export const getTargetWhitelist = _getTargetWhitelist
export const getBooleanEnv = _getBooleanEnv
export const parseCsvList = _parseCsvList
export const parseDelimitedItems = _parseDelimitedItems

// Supports both 2-arg getEnv(env, name) and legacy 3-arg getEnv(env, Astro, name)
export function getEnv(env, AstroOrName, name) {
  if (name === undefined) {
    return _getEnv(env, AstroOrName)
  }
  return _getEnv(env, name)
}
