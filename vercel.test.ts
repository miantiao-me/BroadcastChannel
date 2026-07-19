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
