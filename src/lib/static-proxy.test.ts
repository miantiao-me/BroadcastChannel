import { afterEach, describe, expect, it, vi } from 'vitest'
import { isStaticProxyWhitelisted, resolveStaticProxyTarget } from './static-proxy'

describe('static proxy target handling', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('accepts whitelisted Telegram CDN targets', () => {
    vi.stubEnv('TARGET_WHITELIST', undefined)

    expect(isStaticProxyWhitelisted(new URL('https://cdn-telegram.org/a.png'))).toBe(true)
  })

  it('continues to accept t.me and telegram.me targets', () => {
    expect(isStaticProxyWhitelisted(new URL('https://t.me/i/emoji/1.webp'))).toBe(true)
    expect(isStaticProxyWhitelisted(new URL('https://telegram.me/i/emoji/1.webp'))).toBe(true)
  })

  it('rejects lookalike domains', () => {
    expect(isStaticProxyWhitelisted(new URL('https://eviltelegram.org/a.png'))).toBe(false)
  })

  it('appends configured domains and their subdomains', () => {
    vi.stubEnv('TARGET_WHITELIST', 'a.com,b.com')

    expect(isStaticProxyWhitelisted(new URL('https://a.com/a.png'))).toBe(true)
    expect(isStaticProxyWhitelisted(new URL('http://cdn.a.com/a.png'))).toBe(true)
    expect(isStaticProxyWhitelisted(new URL('https://b.com/a.png'))).toBe(true)
    expect(isStaticProxyWhitelisted(new URL('https://assets.b.com/a.png'))).toBe(true)
    expect(isStaticProxyWhitelisted(new URL('https://t.me/a.png'))).toBe(true)
  })

  it('rejects configured-domain lookalikes and unsupported protocols', () => {
    vi.stubEnv('TARGET_WHITELIST', 'a.com')

    expect(isStaticProxyWhitelisted(new URL('https://evila.com/a.png'))).toBe(false)
    expect(isStaticProxyWhitelisted(new URL('https://a.com.evil.example/a.png'))).toBe(false)
    expect(isStaticProxyWhitelisted(new URL('ftp://a.com/a.png'))).toBe(false)
  })

  it('does not allow invalid configured entries', () => {
    vi.stubEnv('TARGET_WHITELIST', 'https://evil.example,evil.example:443,*.evil.example,127.0.0.1,localhost')

    expect(isStaticProxyWhitelisted(new URL('https://evil.example/a.png'))).toBe(false)
    expect(isStaticProxyWhitelisted(new URL('https://sub.evil.example/a.png'))).toBe(false)
    expect(isStaticProxyWhitelisted(new URL('https://127.0.0.1/a.png'))).toBe(false)
    expect(isStaticProxyWhitelisted(new URL('https://localhost/a.png'))).toBe(false)
    expect(isStaticProxyWhitelisted(new URL('https://telegram.me/a.png'))).toBe(true)
  })

  it('normalizes protocol-relative targets to HTTPS', () => {
    expect(resolveStaticProxyTarget('//cdn-telegram.org/a.png').toString()).toBe('https://cdn-telegram.org/a.png')
  })
})
