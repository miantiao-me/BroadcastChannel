import type { CheerioAPI } from 'cheerio'
import type { IndexedStaticProxyOptions, MessageSelection } from '../types'
import { getProxiedUrl } from '../url'
import { getImageLoading, getMaybeProxiedSrcset, getMaybeProxiedUrl } from './utils'

export function getVideoStickers($: CheerioAPI, message: MessageSelection, options: IndexedStaticProxyOptions): string {
  const { staticProxy = '', index = 0 } = options
  const fragments: string[] = []
  const loading = getImageLoading(index)

  for (const videoNode of message.find('.js-videosticker_video').toArray()) {
    const videoSrc = $(videoNode).attr('src')
    const imageSrc = $(videoNode).find('img').attr('src')

    fragments.push(`
    <div class="w-64 bg-none">
      <video class="sticker" src="${videoSrc ? getProxiedUrl(staticProxy, videoSrc) : ''}" width="256" height="256" aria-label="Video sticker" preload muted autoplay loop playsinline disablepictureinpicture>
        <img class="sticker" src="${imageSrc ? getProxiedUrl(staticProxy, imageSrc) : ''}" alt="Video sticker" width="256" height="256" loading="${loading}" />
      </video>
    </div>
    `)
  }

  return fragments.join('')
}

export function getImageStickers($: CheerioAPI, message: MessageSelection, options: IndexedStaticProxyOptions): string {
  const { staticProxy = '', index = 0 } = options
  const fragments: string[] = []
  const loading = getImageLoading(index)

  for (const imageNode of message.find('.tgme_widget_message_sticker').toArray()) {
    const imageSrc = $(imageNode).attr('data-webp')

    fragments.push(
      `<img class="sticker w-64" src="${imageSrc ? getProxiedUrl(staticProxy, imageSrc) : ''}" alt="Sticker" width="256" height="256" loading="${loading}" />`,
    )
  }

  return fragments.join('')
}

export function getTgsStickers($: CheerioAPI, message: MessageSelection, options: IndexedStaticProxyOptions): string {
  const { staticProxy = '', index = 0 } = options
  const fragments: string[] = []
  const loading = getImageLoading(index)

  for (const stickerNode of message.find('.tgme_widget_message_tgsticker_wrap').toArray()) {
    const sticker = $(stickerNode)
    const wrapper = sticker.parent('.tgme_widget_message_sticker_wrap')
    const root = wrapper.length ? wrapper : sticker

    for (const sourceNode of root.find('[src], [srcset]').toArray()) {
      const source = $(sourceNode)
      const src = source.attr('src')
      const srcset = source.attr('srcset')

      if (src) {
        source.attr('src', getMaybeProxiedUrl(staticProxy, src))
      }

      if (srcset) {
        source.attr('srcset', getMaybeProxiedSrcset(staticProxy, srcset))
      }
    }

    root.find('img').addClass('sticker').attr('alt', 'Sticker').attr('loading', loading)
    root.find('video').addClass('sticker')
    fragments.push($.html(root))
  }

  return fragments.join('')
}
