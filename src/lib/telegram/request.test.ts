import { describe, expect, it } from 'vitest'
import { getTelegramRequestHeaders } from './request'

describe('telegram request headers', () => {
  it('uses deterministic headers without forwarding visitor or platform metadata', () => {
    const headers = getTelegramRequestHeaders()

    expect(headers).toMatchObject({
      'accept': 'text/html,application/xhtml+xml',
      'user-agent': 'BroadcastChannel/0.2.0',
    })

    expect(headers).not.toHaveProperty('cookie')
    expect(headers).not.toHaveProperty('authorization')
    expect(headers).not.toHaveProperty('x-forwarded-for')
    expect(headers).not.toHaveProperty('cf-connecting-ip')
    expect(headers).not.toHaveProperty('vercel-forwarded-for')
    expect(headers).not.toHaveProperty('referer')
  })
})
