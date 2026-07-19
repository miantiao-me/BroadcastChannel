import type { CheerioAPI } from 'cheerio'
import type { MessageSelection } from './types'

const MAX_ENTITY_DECODE_PASSES = 3
const HTML_ENTITY_REGEX = /&(?:#(\d+)|#x([\da-f]+)|([a-z][\da-z]+));/gi
const STYLE_DOUBLE_QUOTED_URL_REGEX = /url\("([^"]*)"\)/gi
const STYLE_SINGLE_QUOTED_URL_REGEX = /url\('([^']*)'\)/gi
const STYLE_UNQUOTED_URL_REGEX = /url\(([^)"']*)\)/gi
const PROXYABLE_URL_REGEX = /^(?:https?:)?\/\//i
const URL_ATTRIBUTE_NAMES = ['href', 'src', 'poster', 'action', 'formaction', 'data-webp'] as const
const HTML_ENTITY_MAP: Record<string, string> = {
  amp: '&',
  apos: '\'',
  gt: '>',
  lt: '<',
  nbsp: '\u00A0',
  quot: '"',
}

function decodeHtmlEntityReferences(value: string): string {
  return value.replace(HTML_ENTITY_REGEX, (match, decimal: string | undefined, hex: string | undefined, named: string | undefined) => {
    if (decimal || hex) {
      const codePoint = Number.parseInt(decimal ?? hex ?? '', decimal ? 10 : 16)

      if (!Number.isFinite(codePoint)) {
        return match
      }

      try {
        return String.fromCodePoint(codePoint)
      }
      catch {
        return match
      }
    }

    return named ? HTML_ENTITY_MAP[named.toLowerCase()] ?? match : match
  })
}

export function normalizeUrlAttribute(value: string): string {
  let normalized = value

  for (let pass = 0; pass < MAX_ENTITY_DECODE_PASSES; pass += 1) {
    const decoded = decodeHtmlEntityReferences(normalized)

    if (decoded === normalized) {
      break
    }

    normalized = decoded
  }

  return normalized
}

export function getProxiedUrl(staticProxy: string, url: string): string {
  return staticProxy + normalizeUrlAttribute(url)
}

export function isProxyableUrl(url: string): boolean {
  return PROXYABLE_URL_REGEX.test(url)
}

export function mapSrcsetUrls(srcset: string, mapper: (url: string) => string): string {
  return srcset
    .split(',')
    .map((candidate) => {
      const [url, ...descriptors] = candidate.trim().split(/\s+/)

      if (!url) {
        return ''
      }

      return [mapper(url), ...descriptors].join(' ')
    })
    .filter(Boolean)
    .join(', ')
}

export function normalizeSrcsetAttribute(srcset: string): string {
  return mapSrcsetUrls(srcset, normalizeUrlAttribute)
}

export function replaceStyleUrls(style: string, mapper: (url: string) => string): string {
  return style
    .replace(STYLE_DOUBLE_QUOTED_URL_REGEX, (_match, url: string) => `url("${mapper(url)}")`)
    .replace(STYLE_SINGLE_QUOTED_URL_REGEX, (_match, url: string) => `url('${mapper(url)}')`)
    .replace(STYLE_UNQUOTED_URL_REGEX, (_match, url: string) => `url(${mapper(url.trim())})`)
}

function normalizeProxyableStyleUrl(staticProxy: string, url: string): string {
  const normalizedUrl = normalizeUrlAttribute(url.trim())

  if (!isProxyableUrl(normalizedUrl)) {
    return normalizedUrl
  }

  const absoluteUrl = normalizedUrl.startsWith('//') ? `https:${normalizedUrl}` : normalizedUrl
  return getProxiedUrl(staticProxy, absoluteUrl)
}

export function normalizeUrlAttributes($: CheerioAPI, root: MessageSelection): void {
  const nodes = [...root.toArray(), ...root.find('*').toArray()]

  for (const node of nodes) {
    const element = $(node)

    for (const attributeName of URL_ATTRIBUTE_NAMES) {
      const value = element.attr(attributeName)

      if (value) {
        element.attr(attributeName, normalizeUrlAttribute(value))
      }
    }

    const srcset = element.attr('srcset')

    if (srcset) {
      element.attr('srcset', normalizeSrcsetAttribute(srcset))
    }

    const style = element.attr('style')

    if (style) {
      element.attr('style', replaceStyleUrls(style, normalizeUrlAttribute))
    }
  }
}

export function proxyStyleUrls($: CheerioAPI, root: MessageSelection, staticProxy: string): void {
  const nodes = [...root.toArray(), ...root.find('*').toArray()]

  for (const node of nodes) {
    const element = $(node)
    const style = element.attr('style')

    if (style) {
      element.attr('style', replaceStyleUrls(style, url => normalizeProxyableStyleUrl(staticProxy, url)))
    }
  }
}

export function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
