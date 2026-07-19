import { load } from 'cheerio'
import { describe, expect, it } from 'vitest'
import { escapeHtmlAttribute, getProxiedUrl, isProxyableUrl, mapSrcsetUrls, normalizeSrcsetAttribute, normalizeUrlAttribute, normalizeUrlAttributes, proxyStyleUrls, replaceStyleUrls } from './url'

function proxyStyle(style: string, staticProxy = '/static/'): string | undefined {
  const $ = load('<div id="root"></div>')
  const root = $('#root').attr('style', style)

  proxyStyleUrls($, root, staticProxy)

  return root.attr('style')
}

describe('telegram URL normalization', () => {
  it('decodes only the supported named entity references', () => {
    expect(normalizeUrlAttribute('&amp;&apos;&gt;&lt;&nbsp;&quot; &copy; &unknown;'))
      .toBe('&\'><\u00A0" &copy; &unknown;')
  })

  it('decodes decimal and hexadecimal entity references', () => {
    expect(normalizeUrlAttribute('&#38;&#x26;&#X2F;&#128640;'))
      .toBe('&&/🚀')
  })

  it('decodes at most three nested entity layers', () => {
    expect(normalizeUrlAttribute('&amp;amp;amp;')).toBe('&')
    expect(normalizeUrlAttribute('&amp;amp;amp;amp;')).toBe('&amp;')
  })

  it('escapes HTML attribute delimiters without escaping apostrophes', () => {
    expect(escapeHtmlAttribute('&"<>\''))
      .toBe('&amp;&quot;&lt;&gt;\'')
  })

  it('prefixes and normalizes proxied URLs', () => {
    expect(getProxiedUrl('/static/', 'https://cdn-telegram.org/a.webp?x=1&amp;y=2'))
      .toBe('/static/https://cdn-telegram.org/a.webp?x=1&y=2')
    expect(getProxiedUrl('', '//cdn-telegram.org/a.webp'))
      .toBe('//cdn-telegram.org/a.webp')
  })

  it('identifies only absolute and protocol-relative proxyable URLs', () => {
    expect(isProxyableUrl('https://cdn-telegram.org/a.webp')).toBe(true)
    expect(isProxyableUrl('http://cdn-telegram.org/a.webp')).toBe(true)
    expect(isProxyableUrl('//cdn-telegram.org/a.webp')).toBe(true)
    expect(isProxyableUrl('/images/a.webp')).toBe(false)
  })

  it('maps each srcset URL while preserving descriptors', () => {
    expect(mapSrcsetUrls('https://cdn-telegram.org/a.webp 1x, /b.webp 2x', url => `mapped:${url}`))
      .toBe('mapped:https://cdn-telegram.org/a.webp 1x, mapped:/b.webp 2x')
  })

  it('replaces quoted and unquoted style URLs', () => {
    expect(replaceStyleUrls('background:url("a.webp"); mask:url( b.svg )', url => `mapped:${url}`))
      .toBe('background:url("mapped:a.webp"); mask:url(mapped:b.svg)')
  })

  it('decodes entity references inside srcset candidates', () => {
    expect(normalizeSrcsetAttribute('https://cdn-telegram.org/a.webp?x=1&amp;y=2 1x, /b.webp?x=3&amp;y=4 2x'))
      .toBe('https://cdn-telegram.org/a.webp?x=1&y=2 1x, /b.webp?x=3&y=4 2x')
  })

  it('normalizes href, srcset, and style URLs on the root and descendants', () => {
    const $ = load('<a id="root"><img></a>')
    const root = $('#root')
    const image = root.find('img')
    root.attr('href', 'https://example.com/?x=1&amp;y=2')
    image.attr('srcset', 'https://cdn-telegram.org/a.webp?x=1&amp;y=2 1x, /b.webp 2x')
    image.attr('style', 'background:url("https://cdn-telegram.org/a.webp?x=1&amp;y=2"); mask:url( /icons/a.svg?x=1&amp;y=2 )')

    normalizeUrlAttributes($, root)

    expect(root.attr('href')).toBe('https://example.com/?x=1&y=2')
    expect(image.attr('srcset')).toBe('https://cdn-telegram.org/a.webp?x=1&y=2 1x, /b.webp 2x')
    expect(image.attr('style')).toBe('background:url("https://cdn-telegram.org/a.webp?x=1&y=2"); mask:url(/icons/a.svg?x=1&y=2)')
  })
})

describe('style URL proxying', () => {
  it('proxies double-quoted, single-quoted, and unquoted absolute URLs', () => {
    expect(proxyStyle('background:url("https://cdn-telegram.org/a.webp"); mask:url(\'https://cdn-telegram.org/b.svg\'); content:url( https://cdn-telegram.org/c.webp )'))
      .toBe('background:url("/static/https://cdn-telegram.org/a.webp"); mask:url(\'/static/https://cdn-telegram.org/b.svg\'); content:url(/static/https://cdn-telegram.org/c.webp)')
  })

  it('does not proxy relative style URLs', () => {
    expect(proxyStyle('background:url("/images/a.webp"); mask:url(../icons/a.svg)'))
      .toBe('background:url("/images/a.webp"); mask:url(../icons/a.svg)')
  })

  it('makes protocol-relative URLs HTTPS before proxying', () => {
    expect(proxyStyle('background:url(//cdn-telegram.org/a.webp)'))
      .toBe('background:url(/static/https://cdn-telegram.org/a.webp)')
  })

  it('decodes entities before proxying style URLs', () => {
    expect(proxyStyle('background:url("https://cdn-telegram.org/a.webp?x=1&amp;y=2")'))
      .toBe('background:url("/static/https://cdn-telegram.org/a.webp?x=1&y=2")')
  })

  it('normalizes style URLs without adding a proxy when STATIC_PROXY is empty', () => {
    expect(proxyStyle('background:url("https://cdn-telegram.org/a.webp?x=1&amp;y=2"); mask:url(//cdn-telegram.org/a.svg)', ''))
      .toBe('background:url("https://cdn-telegram.org/a.webp?x=1&y=2"); mask:url(https://cdn-telegram.org/a.svg)')
  })
})
