import type { CheerioAPI } from 'cheerio'
import type { MessageSelection, ReplyOptions } from '../types'
import { normalizeUrlAttribute } from '../url'

export function getReply($: CheerioAPI, message: MessageSelection, options: ReplyOptions): string {
  const { channel } = options
  const reply = message.find('.tgme_widget_message_reply')

  reply.wrapInner('<small></small>').wrapInner('<blockquote></blockquote>')

  const href = reply.attr('href')
  if (href) {
    const replyUrl = new URL(normalizeUrlAttribute(href), 'https://t.me')
    reply.attr('href', replyUrl.pathname.replace(new RegExp(`/${channel}/`, 'i'), '/posts/'))
  }

  return $.html(reply)
}

export function getForwardedFrom($: CheerioAPI, message: MessageSelection): string {
  const forwardedFrom = message.find('.tgme_widget_message_forwarded_from')

  for (const linkNode of forwardedFrom.find('a').toArray()) {
    const link = $(linkNode)
    const href = link.attr('href')

    if (href) {
      link.attr('href', normalizeUrlAttribute(href)).attr('target', '_blank').attr('rel', 'noopener')
    }
  }

  return $.html(forwardedFrom)
}
