import { describe, expect, it } from 'vitest'
import { getMaybeProxiedSrcset, getMaybeProxiedUrl } from './utils'

describe('media URL helpers', () => {
  it('proxies absolute media URLs and decodes their entities', () => {
    expect(getMaybeProxiedUrl('/static/', 'https://cdn-telegram.org/a.webp?x=1&amp;y=2'))
      .toBe('/static/https://cdn-telegram.org/a.webp?x=1&y=2')
  })

  it('keeps direct absolute and protocol-relative URLs when the proxy is empty', () => {
    expect(getMaybeProxiedUrl('', 'https://cdn-telegram.org/a.webp'))
      .toBe('https://cdn-telegram.org/a.webp')
    expect(getMaybeProxiedUrl('', '//cdn-telegram.org/a.webp'))
      .toBe('//cdn-telegram.org/a.webp')
  })

  it('keeps relative media URLs direct while normalizing entities', () => {
    expect(getMaybeProxiedUrl('/static/', '/images/a.webp?x=1&amp;y=2'))
      .toBe('/images/a.webp?x=1&y=2')
  })

  it('proxies each absolute srcset candidate separately', () => {
    expect(getMaybeProxiedSrcset('/static/', 'https://cdn-telegram.org/a.webp 1x, https://cdn-telegram.org/b.webp 2x'))
      .toBe('/static/https://cdn-telegram.org/a.webp 1x, /static/https://cdn-telegram.org/b.webp 2x')
  })

  it('proxies protocol-relative candidates', () => {
    expect(getMaybeProxiedSrcset('/static/', '//cdn-telegram.org/a.webp 2x'))
      .toBe('/static///cdn-telegram.org/a.webp 2x')
  })

  it('keeps protocol-relative srcset candidates direct when the proxy is empty', () => {
    expect(getMaybeProxiedSrcset('', '//cdn-telegram.org/a.webp 1x, https://cdn-telegram.org/b.webp 2x'))
      .toBe('//cdn-telegram.org/a.webp 1x, https://cdn-telegram.org/b.webp 2x')
  })

  it('keeps relative candidates out of the static proxy', () => {
    expect(getMaybeProxiedSrcset('/static/', '/images/a.webp 1x'))
      .toBe('/images/a.webp 1x')
  })

  it('normalizes extra spaces around candidates and descriptors', () => {
    expect(getMaybeProxiedSrcset('/static/', '  https://cdn-telegram.org/a.webp   1x  ,  /images/b.webp   2x '))
      .toBe('/static/https://cdn-telegram.org/a.webp 1x, /images/b.webp 2x')
  })
})
