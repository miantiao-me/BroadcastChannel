import type { CheerioAPI } from 'cheerio'
import type { MessageSelection, StaticProxyOptions } from '../types'
import { proxyStyleUrls } from '../url'

const RAW_CONTENT_SELECTORS = [
  '.tgme_widget_message_poll',
  '.tgme_widget_message_document_wrap',
  '.tgme_widget_message_video_player.not_supported',
  '.tgme_widget_message_location_wrap',
] as const

export function renderRawContent($: CheerioAPI, message: MessageSelection, options: StaticProxyOptions): string[] {
  const { staticProxy = '' } = options

  return RAW_CONTENT_SELECTORS.map((selector) => {
    const content = message.find(selector)
    proxyStyleUrls($, content, staticProxy)
    return $.html(content)
  })
}
