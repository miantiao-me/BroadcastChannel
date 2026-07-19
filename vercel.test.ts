import { describe, expect, it } from 'vitest'
import vercelConfig from './vercel.json'

describe('vercel rewrites', () => {
  it('passes static proxy wildcard targets to the edge function', () => {
    expect(vercelConfig.rewrites).toContainEqual({
      source: '/static/:path*',
      destination: '/api/static?path=:path*',
    })
  })
})

describe('vercel corepack commands', () => {
  // Regression: Vercel defaults to pnpm@9 (based on lockfile v9.0 + project age),
  // which requires a `packages` field in pnpm-workspace.yaml. The project uses
  // pnpm@11 format (no `packages` field), so EVERY pnpm command must go through
  // corepack to use the pinned pnpm@11.13.0 from package.json's packageManager.
  // If either install or build bypasses corepack, pnpm@9 fails with
  // "packages field missing or empty".
  it('uses corepack for install', () => {
    expect(vercelConfig.installCommand).toBe('corepack pnpm install')
  })

  it('uses corepack for build', () => {
    expect(vercelConfig.buildCommand).toBe('corepack pnpm run build')
  })
})
