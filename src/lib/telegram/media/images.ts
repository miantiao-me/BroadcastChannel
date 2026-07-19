import type { CheerioAPI } from 'cheerio'
import type { MessageAssetOptions, MessageSelection } from '../types'
import { escapeHtmlAttribute, getProxiedUrl } from '../url'
import { getImageLoading, inferImageDimensions, STYLE_URL_REGEX } from './utils'

export function getImages($: CheerioAPI, message: MessageSelection, options: MessageAssetOptions): string {
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
        <img src="${getProxiedUrl(staticProxy, imageUrl)}" alt="${safeTitle}" width="${width}" height="${height}" loading="${loading}" />
      </button>
      <div class="modal" id="${popoverId}" popover="auto" aria-label="Image preview">
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
          <img class="modal-img" src="${getProxiedUrl(staticProxy, imageUrl)}" alt="${safeTitle}" width="${width}" height="${height}" loading="lazy" />
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
