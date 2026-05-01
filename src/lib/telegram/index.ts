import type { AnyNode, Cheerio, CheerioAPI } from 'cheerio'
import type { ChannelInfo, EnvCapableAstro, GetChannelInfoParams, Post, Reaction } from '../../types'
import * as cheerio from 'cheerio'
import flourite from 'flourite'
import { LRUCache } from 'lru-cache'
import { $fetch } from 'ofetch'
import { getEnv } from '../env'
import prism from '../prism'

const STYLE_URL_REGEX = /url\(["'](.*?)["']/i
const STYLE_DIMENSION_REGEX = {
  width: /width:\s*(\d+(?:\.\d+)?)px/i,
  height: /height:\s*(\d+(?:\.\d+)?)px/i,
} as const
const STYLE_PADDING_TOP_REGEX = /padding-top:\s*(\d+(?:\.\d+)?)%/i
const SYNTHETIC_IMAGE_DIMENSION = 1000
const TITLE_PREVIEW_REGEX = /^.*?(?=[。\n]|http\S)/g
const CONTENT_URL_REGEX = /(url\(["'])((https?:)?\/\/)/g
const UNNECESSARY_HEADERS = new Set(['host', 'cookie', 'origin', 'referer'])

type CacheValue = ChannelInfo | Post
type MessageSelection = Cheerio<AnyNode>
type RequestContext = EnvCapableAstro & { request: Request }

interface StaticProxyOptions {
  staticProxy?: string
}

interface IndexedStaticProxyOptions extends StaticProxyOptions {
  index?: number
}

interface ReplyOptions {
  channel: string
}

interface MessageAssetOptions extends IndexedStaticProxyOptions {
  id?: string
  title?: string
}

interface ExtractPostOptions {
  channel: string
  staticProxy: string
  index?: number
  reactionsEnabled?: string
}

interface LoadedChannelDocument {
  $: CheerioAPI
  channel: string
  staticProxy: string
  reactionsEnabled?: string
}

const cache = new LRUCache<string, CacheValue>({
  ttl: 1000 * 60 * 5,
  maxSize: 50 * 1024 * 1024,
  sizeCalculation: item => JSON.stringify(item).length,
})

function cloneCacheValue<T extends CacheValue>(value: T): T {
  return structuredClone(value)
}

function isChannelInfo(value: CacheValue): value is ChannelInfo {
  return 'posts' in value
}

function getRequiredEnv(context: RequestContext, name: string): string {
  const value = getEnv(import.meta.env, context, name)
  if (!value) {
    throw new Error(`Missing required env: ${name}`)
  }
  return value
}

function normalizeEmoji(emoji: string): string {
  const emojiMap: Record<string, string> = {
    '\u2764': '\u2764\uFE0F',
    '\u263A': '\u263A\uFE0F',
    '\u2639': '\u2639\uFE0F',
    '\u2665': '\u2764\uFE0F',
  }

  return emojiMap[emoji] ?? emoji
}

function getCustomEmojiImage(emojiId: string | undefined, staticProxy = ''): string | null {
  if (!emojiId) {
    return null
  }

  const imageUrl = `https://t.me/i/emoji/${emojiId}.webp`
  return `${staticProxy}${imageUrl}`
}

function isNonEmptyString(value: string | null | undefined): value is string {
  return Boolean(value)
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function getImageLoading(index: number): 'eager' | 'lazy' {
  return index > 15 ? 'lazy' : 'eager'
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
function inferImageDimensions(
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

function getRequestHeaders(request: Request): Record<string, string> {
  const headers = Object.fromEntries(request.headers.entries())

  for (const key of Object.keys(headers)) {
    if (UNNECESSARY_HEADERS.has(key)) {
      delete headers[key]
    }
  }

  return headers
}

async function hydrateTgEmoji($: CheerioAPI, content: MessageSelection, options: StaticProxyOptions = {}): Promise<void> {
  const { staticProxy = '' } = options

  for (const emojiNode of content.find('tg-emoji').toArray()) {
    const emojiId = $(emojiNode).attr('emoji-id')
    const imageUrl = getCustomEmojiImage(emojiId, staticProxy)

    if (imageUrl) {
      $(emojiNode).replaceWith(`<img class="tg-emoji" src="${imageUrl}" alt="" loading="lazy" width="20" height="20" />`)
    }
  }
}

function getVideoStickers($: CheerioAPI, message: MessageSelection, options: IndexedStaticProxyOptions): string {
  const { staticProxy = '', index = 0 } = options
  const fragments: string[] = []
  const loading = getImageLoading(index)

  for (const videoNode of message.find('.js-videosticker_video').toArray()) {
    const videoSrc = $(videoNode).attr('src')
    const imageSrc = $(videoNode).find('img').attr('src')

    fragments.push(`
    <div style="background-image: none; width: 256px;">
      <video src="${videoSrc ? staticProxy + videoSrc : ''}" width="256" height="256" aria-label="Video sticker" preload muted autoplay loop playsinline disablepictureinpicture>
        <img class="sticker" src="${imageSrc ? staticProxy + imageSrc : ''}" alt="Video sticker" width="256" height="256" loading="${loading}" />
      </video>
    </div>
    `)
  }

  return fragments.join('')
}

function getImageStickers($: CheerioAPI, message: MessageSelection, options: IndexedStaticProxyOptions): string {
  const { staticProxy = '', index = 0 } = options
  const fragments: string[] = []
  const loading = getImageLoading(index)

  for (const imageNode of message.find('.tgme_widget_message_sticker').toArray()) {
    const imageSrc = $(imageNode).attr('data-webp')

    fragments.push(
      `<img class="sticker" src="${imageSrc ? staticProxy + imageSrc : ''}" style="width: 256px;" alt="Sticker" width="256" height="256" loading="${loading}" />`,
    )
  }

  return fragments.join('')
}

function getImages($: CheerioAPI, message: MessageSelection, options: MessageAssetOptions): string {
  const { staticProxy = '', id = '', index = 0, title = '' } = options
  const fragments: string[] = []
  const loading = getImageLoading(index)
  const safeTitle = escapeHtmlAttribute(title || 'Image from post')
  const safePreviewLabel = escapeHtmlAttribute(title ? `Open image preview: ${title}` : 'Open image preview')
  const safeCloseLabel = 'Close image preview'

  for (const [photoIndex, photoNode] of message.find('.tgme_widget_message_photo_wrap').toArray().entries()) {
    const imageUrl = $(photoNode).attr('style')?.match(STYLE_URL_REGEX)?.[1]

    if (!imageUrl) {
      continue
    }

    const popoverId = `modal-${id}-${photoIndex}`
    const { width, height } = inferImageDimensions($, photoNode)
    fragments.push(`
      <button
        type="button"
        class="image-preview-button image-preview-wrap"
        popovertarget="${popoverId}"
        popovertargetaction="show"
        aria-label="${safePreviewLabel}"
      >
        <img src="${staticProxy + imageUrl}" alt="${safeTitle}" width="${width}" height="${height}" loading="${loading}" />
      </button>
      <div class="modal" id="${popoverId}" popover aria-label="Image preview">
        <button
          type="button"
          class="modal__backdrop"
          popovertarget="${popoverId}"
          popovertargetaction="hide"
          aria-label="${safeCloseLabel}"
        ></button>
        <button
          type="button"
          class="modal__close"
          popovertarget="${popoverId}"
          popovertargetaction="hide"
          aria-label="${safeCloseLabel}"
        >&times;</button>
        <div class="modal__surface">
          <img class="modal-img" src="${staticProxy + imageUrl}" alt="${safeTitle}" width="${width}" height="${height}" loading="lazy" />
        </div>
      </div>
    `)
  }

  if (!fragments.length) {
    return ''
  }

  const layoutClass = fragments.length % 2 === 0 ? 'image-list-even' : 'image-list-odd'
  return `<div class="image-list-container ${layoutClass}">${fragments.join('')}</div>`
}

function getVideo($: CheerioAPI, message: MessageSelection, options: IndexedStaticProxyOptions): string {
  const { staticProxy = '', index = 0 } = options
  const video = message.find('.tgme_widget_message_video_wrap video')
  const videoSrc = video.attr('src')

  if (videoSrc) {
    video.attr('src', staticProxy + videoSrc)
  }

  video
    .attr('controls', '')
    .attr('preload', index > 15 ? 'metadata' : 'auto')
    .attr('playsinline', '')
    .attr('webkit-playsinline', '')

  const roundVideo = message.find('.tgme_widget_message_roundvideo_wrap video')
  const roundVideoSrc = roundVideo.attr('src')

  if (roundVideoSrc) {
    roundVideo.attr('src', staticProxy + roundVideoSrc)
  }

  roundVideo
    .attr('controls', '')
    .attr('preload', index > 15 ? 'metadata' : 'auto')
    .attr('playsinline', '')
    .attr('webkit-playsinline', '')

  return $.html(video) + $.html(roundVideo)
}

function getAudio($: CheerioAPI, message: MessageSelection, options: StaticProxyOptions): string {
  const { staticProxy = '' } = options
  const audio = message.find('.tgme_widget_message_voice')
  const audioSrc = audio.attr('src')

  if (audioSrc) {
    audio.attr('src', staticProxy + audioSrc)
  }

  audio.attr('controls', '')
  return $.html(audio)
}

function getLinkPreview($: CheerioAPI, message: MessageSelection, options: IndexedStaticProxyOptions): string {
  const { staticProxy = '', index = 0 } = options
  const link = message.find('.tgme_widget_message_link_preview')
  const title = message.find('.link_preview_title').text() || message.find('.link_preview_site_name').text()
  const description = message.find('.link_preview_description').text()
  const loading = getImageLoading(index)
  const safeTitle = escapeHtmlAttribute(title || 'Link preview image')

  link.attr('target', '_blank').attr('rel', 'noopener').attr('title', description)

  const image = message.find('.link_preview_image')
  const previewUrl = image.attr('style')?.match(STYLE_URL_REGEX)?.[1]
  const imageSrc = previewUrl ? staticProxy + previewUrl : ''

  image.replaceWith(
    `<img class="link_preview_image" alt="${safeTitle}" src="${imageSrc}" width="1200" height="630" loading="${loading}" />`,
  )

  return $.html(link)
}

function getReply($: CheerioAPI, message: MessageSelection, options: ReplyOptions): string {
  const { channel } = options
  const reply = message.find('.tgme_widget_message_reply')

  reply.wrapInner('<small></small>').wrapInner('<blockquote></blockquote>')

  const href = reply.attr('href')
  if (href) {
    const replyUrl = new URL(href, 'https://t.me')
    reply.attr('href', replyUrl.pathname.replace(new RegExp(`/${channel}/`, 'i'), '/posts/'))
  }

  return $.html(reply)
}

async function modifyHTMLContent($: CheerioAPI, content: MessageSelection, options: IndexedStaticProxyOptions = {}): Promise<MessageSelection> {
  const { index = 0, staticProxy = '' } = options

  await hydrateTgEmoji($, content, { staticProxy })
  content.find('.emoji').removeAttr('style')

  for (const linkNode of content.find('a').toArray()) {
    const link = $(linkNode)
    link.attr('title', link.text()).removeAttr('onclick')
  }

  for (const [blockquoteIndex, blockquoteNode] of content.find('blockquote[expandable]').toArray().entries()) {
    const innerHTML = $(blockquoteNode).html() ?? ''
    const expandId = `expand-${index}-${blockquoteIndex}`
    const expandContentId = `${expandId}-content`
    const expandable = `<div class="tg-expandable">
      <input type="checkbox" id="${expandId}" class="tg-expandable__checkbox" aria-label="Expand hidden content" aria-controls="${expandContentId}">
      <div id="${expandContentId}" class="tg-expandable__content">${innerHTML}</div>
      <label for="${expandId}" class="tg-expandable__toggle"><span class="sr-only">Expand hidden content</span></label>
    </div>`

    $(blockquoteNode).replaceWith(expandable)
  }

  for (const [spoilerIndex, spoilerNode] of content.find('tg-spoiler').toArray().entries()) {
    const spoiler = $(spoilerNode)
    const spoilerId = `spoiler-${index}-${spoilerIndex}`
    const spoilerInput = `<input type="checkbox" aria-label="Reveal spoiler" aria-controls="${spoilerId}" />`

    spoiler.attr('id', spoilerId).wrap('<label class="spoiler-button"></label>').before(spoilerInput)
  }

  for (const preNode of content.find('pre').toArray()) {
    try {
      const pre = $(preNode)
      pre.find('br').replaceWith('\n')

      const code = pre.text()
      const language = flourite(code, { shiki: true, noUnknown: true }).language || 'text'
      const highlightedCode = prism.highlight(code, prism.languages[language], language)
      pre.html(`<code class="language-${language}">${highlightedCode}</code>`)
    }
    catch (error) {
      console.error(error)
    }
  }

  return content
}

function getReactions($: CheerioAPI, message: MessageSelection, staticProxy: string): Reaction[] {
  const reactions: Reaction[] = []

  for (const reactionNode of message.find('.tgme_widget_message_reactions .tgme_reaction').toArray()) {
    const reaction = $(reactionNode)
    const isPaid = reaction.hasClass('tgme_reaction_paid')
    let emoji = ''
    let emojiId: string | undefined
    let emojiImage: string | undefined

    const standardEmoji = reaction.find('.emoji b')
    if (standardEmoji.length) {
      emoji = normalizeEmoji(standardEmoji.text().trim())
    }

    const tgEmoji = reaction.find('tg-emoji')
    if (tgEmoji.length && !emoji) {
      emojiId = tgEmoji.attr('emoji-id')
      const customEmojiImage = getCustomEmojiImage(emojiId, staticProxy)
      if (customEmojiImage) {
        emojiImage = customEmojiImage
      }
    }

    if (isPaid && !emoji && !emojiImage) {
      emoji = '\u2B50'
    }

    const clone = reaction.clone()
    clone.find('.emoji, tg-emoji, i').remove()
    const count = clone.text().trim()

    if (count) {
      reactions.push({
        emoji,
        emojiId,
        emojiImage,
        count,
        isPaid,
      })
    }
  }

  return reactions
}

async function extractPost($: CheerioAPI, item: AnyNode | null, options: ExtractPostOptions): Promise<Post> {
  const { channel, staticProxy, index = 0, reactionsEnabled } = options
  const message = item ? $(item).find('.tgme_widget_message') : $('.tgme_widget_message')
  const hasReplyText = message.find('.js-message_reply_text').length > 0
  const content = await modifyHTMLContent(
    $,
    message.find(hasReplyText ? '.tgme_widget_message_text.js-message_text' : '.tgme_widget_message_text'),
    { index, staticProxy },
  )
  const contentText = content.text()
  const title = contentText.match(TITLE_PREVIEW_REGEX)?.[0] ?? contentText
  const id = message.attr('data-post')?.replace(new RegExp(`${channel}/`, 'i'), '') ?? ''
  const tags: string[] = []

  for (const tagNode of content.find('a[href^="?q="]').toArray()) {
    const tagLink = $(tagNode)
    const tagText = tagLink.text()

    tagLink.attr('href', `/search/result?q=${encodeURIComponent(tagText)}`)

    const normalizedTag = tagText.replace('#', '')
    if (normalizedTag) {
      tags.push(normalizedTag)
    }
  }

  const contentHtml = [
    getReply($, message, { channel }),
    getImages($, message, { staticProxy, id, index, title }),
    getVideo($, message, { staticProxy, index }),
    getAudio($, message, { staticProxy }),
    content.html(),
    getImageStickers($, message, { staticProxy, index }),
    getVideoStickers($, message, { staticProxy, index }),
    message.find('.tgme_widget_message_poll').html(),
    $.html(message.find('.tgme_widget_message_document_wrap')),
    $.html(message.find('.tgme_widget_message_video_player.not_supported')),
    $.html(message.find('.tgme_widget_message_location_wrap')),
    getLinkPreview($, message, { staticProxy, index }),
  ]
    .filter(isNonEmptyString)
    .join('')
    .replace(CONTENT_URL_REGEX, (_match, prefix: string, protocol: string) => {
      const normalizedProtocol = protocol === '//' ? 'https://' : protocol
      return `${prefix}${staticProxy}${normalizedProtocol}`
    })

  return {
    id,
    title,
    type: message.attr('class')?.includes('service_message') ? 'service' : 'text',
    datetime: message.find('.tgme_widget_message_date time').attr('datetime') ?? '',
    tags,
    text: contentText,
    content: contentHtml,
    reactions: reactionsEnabled ? getReactions($, message, staticProxy) : [],
  }
}

async function loadChannelDocument(
  context: RequestContext,
  params: GetChannelInfoParams & { id?: string } = {},
): Promise<LoadedChannelDocument> {
  const { before, after, q, id } = params
  const host = getEnv(import.meta.env, context, 'TELEGRAM_HOST') ?? 't.me'
  const channel = getRequiredEnv(context, 'CHANNEL')
  const staticProxy = getEnv(import.meta.env, context, 'STATIC_PROXY') ?? '/static/'
  const reactionsEnabled = getEnv(import.meta.env, context, 'REACTIONS')
  const requestUrl = id
    ? `https://${host}/${channel}/${id}?embed=1&mode=tme`
    : `https://${host}/s/${channel}`

  console.info('Fetching', requestUrl, { before, after, q, id })

  const html = await $fetch<string>(requestUrl, {
    headers: getRequestHeaders(context.request),
    query: {
      before: before || undefined,
      after: after || undefined,
      q: q || undefined,
    },
    retry: 3,
    retryDelay: 100,
  })

  return {
    $: cheerio.load(html, {}, false),
    channel,
    staticProxy,
    reactionsEnabled,
  }
}

export async function getChannelPost(context: RequestContext, id: string): Promise<Post> {
  const cacheKey = JSON.stringify({ scope: 'post', id })
  const cachedResult = cache.get(cacheKey)

  if (cachedResult && !isChannelInfo(cachedResult)) {
    console.info('Match Cache', { id })
    return cloneCacheValue(cachedResult)
  }

  const { $, channel, staticProxy, reactionsEnabled } = await loadChannelDocument(context, { id })
  const post = await extractPost($, null, { channel, staticProxy, reactionsEnabled })

  cache.set(cacheKey, post)
  return cloneCacheValue(post)
}

export async function getChannelInfo(context: RequestContext, params: GetChannelInfoParams = {}): Promise<ChannelInfo> {
  const { before = '', after = '', q = '' } = params
  const cacheKey = JSON.stringify({ scope: 'channel', before, after, q })
  const cachedResult = cache.get(cacheKey)

  if (cachedResult && isChannelInfo(cachedResult)) {
    console.info('Match Cache', { before, after, q })
    return cloneCacheValue(cachedResult)
  }

  const { $, channel, staticProxy, reactionsEnabled } = await loadChannelDocument(context, { before, after, q })
  const postNodes = $('.tgme_channel_history .tgme_widget_message_wrap').toArray()
  const posts = (await Promise.all(
    postNodes.map((item, index) => extractPost($, item, { channel, staticProxy, index, reactionsEnabled })),
  ))
    .reverse()
    .filter(post => post.type === 'text' && Boolean(post.id) && Boolean(post.content))

  const channelInfo: ChannelInfo = {
    posts,
    title: $('.tgme_channel_info_header_title').text(),
    description: $('.tgme_channel_info_description').text(),
    descriptionHTML: (await modifyHTMLContent($, $('.tgme_channel_info_description'), { staticProxy })).html(),
    avatar: $('.tgme_page_photo_image img').attr('src'),
  }

  cache.set(cacheKey, channelInfo)
  return cloneCacheValue(channelInfo)
}
