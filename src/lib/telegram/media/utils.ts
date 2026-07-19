import type { AnyNode, CheerioAPI } from 'cheerio'
import { getProxiedUrl, isProxyableUrl, mapSrcsetUrls, normalizeUrlAttribute } from '../url'

export const STYLE_URL_REGEX = /url\(["'](.*?)["']/i
export const SYNTHETIC_IMAGE_DIMENSION = 1000

const STYLE_DIMENSION_REGEX = {
  width: /width:\s*(\d+(?:\.\d+)?)px/i,
  height: /height:\s*(\d+(?:\.\d+)?)px/i,
} as const
const STYLE_PADDING_TOP_REGEX = /padding-top:\s*(\d+(?:\.\d+)?)%/i

export function getImageLoading(index: number): 'eager' | 'lazy' {
  return index > 15 ? 'lazy' : 'eager'
}

export function getMaybeProxiedUrl(staticProxy: string, url: string): string {
  return isProxyableUrl(url) ? getProxiedUrl(staticProxy, url) : normalizeUrlAttribute(url)
}

export function getMaybeProxiedSrcset(staticProxy: string, srcset: string): string {
  return mapSrcsetUrls(srcset, url => getMaybeProxiedUrl(staticProxy, url))
}

function getStyleDimension(style: string | undefined, property: 'width' | 'height'): number | null {
  const value = style?.match(STYLE_DIMENSION_REGEX[property])?.[1]
  return value ? Math.round(Number(value)) : null
}

function getStylePaddingTop(style: string | undefined): number | null {
  const value = style?.match(STYLE_PADDING_TOP_REGEX)?.[1]
  return value ? Number(value) : null
}

// Telegram widgets encode image ratios in styles, so this returns synthetic
// dimensions for layout reservation rather than real pixel dimensions.
export function inferImageDimensions(
  $: CheerioAPI,
  node: AnyNode,
  fallback = { width: SYNTHETIC_IMAGE_DIMENSION, height: SYNTHETIC_IMAGE_DIMENSION },
): { width: number, height: number } {
  const element = $(node)
  const styles = [
    element.attr('style'),
    element.find('.tgme_widget_message_photo').first().attr('style'),
    element.find('i').attr('style'),
    element.parent().attr('style'),
  ]

  let width: number | null = null
  let height: number | null = null
  let paddingTop: number | null = null

  for (const style of styles) {
    if (width === null) {
      width = getStyleDimension(style, 'width')
    }

    if (height === null) {
      height = getStyleDimension(style, 'height')
    }

    if (paddingTop === null) {
      paddingTop = getStylePaddingTop(style)
    }

    if (width && height) {
      return { width, height }
    }
  }

  // Telegram commonly uses wrap width plus child padding-top to express image
  // ratio instead of returning real pixel dimensions.
  if (paddingTop !== null) {
    const syntheticWidth = width ?? fallback.width
    return {
      width: syntheticWidth,
      height: Math.max(1, Math.round(syntheticWidth * paddingTop / 100)),
    }
  }

  return fallback
}
