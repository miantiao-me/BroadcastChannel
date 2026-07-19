import type { CheerioAPI } from 'cheerio'
import type { IndexedStaticProxyOptions, MessageSelection, StaticProxyOptions } from './types'
import flourite from 'flourite'
import prism, { ensurePrismLanguage } from '../prism'
import { getCustomEmojiImage } from './emoji'
import { normalizeUrlAttribute, normalizeUrlAttributes, proxyStyleUrls } from './url'

interface ModifyHTMLContentOptions extends IndexedStaticProxyOptions {
  telegramHost?: string
  normalizeUrls?: boolean
}

interface HydrateTgEmojiOptions extends StaticProxyOptions {
  telegramHost?: string
}

async function hydrateTgEmoji($: CheerioAPI, content: MessageSelection, options: HydrateTgEmojiOptions = {}): Promise<void> {
  const { telegramHost, staticProxy = '' } = options

  for (const emojiNode of content.find('tg-emoji').toArray()) {
    const emojiId = $(emojiNode).attr('emoji-id')
    const imageUrl = getCustomEmojiImage(emojiId, { telegramHost, staticProxy })

    if (imageUrl) {
      $(emojiNode).replaceWith(`<img class="tg-emoji" src="${imageUrl}" alt="" loading="lazy" width="20" height="20" />`)
    }
  }
}

export async function modifyHTMLContent($: CheerioAPI, content: MessageSelection, options: ModifyHTMLContentOptions = {}): Promise<MessageSelection> {
  const { index = 0, telegramHost, staticProxy = '', normalizeUrls = true } = options

  await hydrateTgEmoji($, content, { telegramHost, staticProxy })
  if (normalizeUrls) {
    normalizeUrlAttributes($, content)
  }
  proxyStyleUrls($, content, staticProxy)
  content.find('.emoji').removeAttr('style')

  for (const linkNode of content.find('a').toArray()) {
    const link = $(linkNode)
    const href = link.attr('href')

    if (href && normalizeUrls) {
      link.attr('href', normalizeUrlAttribute(href))
    }

    link.attr('title', link.text()).removeAttr('onclick')
  }

  for (const [blockquoteIndex, blockquoteNode] of content.find('blockquote[expandable]').toArray().entries()) {
    const innerHTML = $(blockquoteNode).html() ?? ''
    const expandId = `expand-${index}-${blockquoteIndex}`
    const expandContentId = `${expandId}-content`
    const expandable = `<div class="tg-expandable">
      <input type="checkbox" id="${expandId}" class="tg-expandable__checkbox" aria-label="Toggle hidden content" aria-controls="${expandContentId}">
      <div id="${expandContentId}" class="tg-expandable__content">${innerHTML}</div>
      <label for="${expandId}" class="tg-expandable__toggle"><span class="sr-only">Toggle hidden content</span></label>
    </div>`

    $(blockquoteNode).replaceWith(expandable)
  }

  for (const [spoilerIndex, spoilerNode] of content.find('tg-spoiler').toArray().entries()) {
    const spoiler = $(spoilerNode)
    const spoilerId = `spoiler-${index}-${spoilerIndex}`
    const spoilerInput = `<input type="checkbox" aria-label="Toggle spoiler" aria-controls="${spoilerId}" />`

    spoiler.attr('id', spoilerId).wrap('<label class="spoiler-button"></label>').before(spoilerInput)
  }

  for (const preNode of content.find('pre').toArray()) {
    const pre = $(preNode)
    pre.addClass('code')

    try {
      pre.find('br').replaceWith('\n')

      const code = pre.text()
      const detectedLanguage = flourite(code, { shiki: true, noUnknown: true }).language || 'text'
      const language = await ensurePrismLanguage(detectedLanguage)
      const grammar = prism.languages[language]

      if (!grammar) {
        const fallbackCode = $('<code class="language-text"></code>')
        fallbackCode.text(code)
        pre.empty().append(fallbackCode)
        continue
      }

      const highlightedCode = prism.highlight(code, grammar, language)
      pre.html(`<code class="language-${language}">${highlightedCode}</code>`)
    }
    catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Code highlighting failed', error)
      }
    }
  }

  return content
}
