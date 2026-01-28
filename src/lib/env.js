export function getEnv(env, Astro, name) {
  const value = env[name] ?? Astro.locals?.runtime?.env?.[name] ?? (typeof process !== 'undefined' ? process.env[name] : undefined)
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}
