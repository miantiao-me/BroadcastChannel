import type { CheerioAPI } from 'cheerio'
import type { IndexedStaticProxyOptions, MessageSelection } from '../types'
import { escapeHtmlAttribute, getProxiedUrl, normalizeUrlAttribute } from '../url'
import { getImageLoading, STYLE_URL_REGEX } from './utils'

export function getLinkPreview($: CheerioAPI, message: MessageSelection, options: IndexedStaticProxyOptions): string {
  const { staticProxy = '', index = 0 } = options
  const link = message.find('.tgme_widget_message_link_preview')
  const href = link.attr('href')
  const title = message.find('.link_preview_title').text() || message.find('.link_preview_site_name').text()
  const description = message.find('.link_preview_description').text()
  const loading = getImageLoading(index)
  const safeTitle = escapeHtmlAttribute(title || 'Link preview image')

  if (href) {
    link.attr('href', normalizeUrlAttribute(href))
  }

  link.attr('target', '_blank').attr('rel', 'noopener').attr('title', description)

  const image = message.find('.link_preview_image')
  const previewUrl = image.attr('style')?.match(STYLE_URL_REGEX)?.[1]
  const imageSrc = previewUrl ? getProxiedUrl(staticProxy, previewUrl) : ''

  image.replaceWith(
    `<img class="link_preview_image" alt="${safeTitle}" src="${imageSrc}" width="1200" height="630" loading="${loading}" />`,
  )

  return $.html(link)
}
