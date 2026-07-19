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

describe('vercel install command', () => {
  // Regression: Vercel defaults to pnpm@9 (based on lockfile v9.0 + project age),
  // which requires a `packages` field in pnpm-workspace.yaml. The project uses
  // pnpm@11 format (no `packages` field), so we must force Corepack to respect
  // the `packageManager` field in package.json. See README "Vercel note".
  it('uses corepack to install with the pinned pnpm version', () => {
    expect(vercelConfig.installCommand).toBe('corepack pnpm install')
  })
})
