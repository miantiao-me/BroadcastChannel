import { load } from 'cheerio'
import { describe, expect, it } from 'vitest'
import { getTgsStickers, getVideoStickers } from './stickers'

describe('sticker renderers', () => {
  it('marks video stickers as sticker media', () => {
    const $ = load(`
      <div class="message">
        <video class="js-videosticker_video" src="https://cdn-telegram.org/sticker.webm">
          <img src="https://cdn-telegram.org/sticker.webp">
        </video>
      </div>
    `)
    const rendered = load(getVideoStickers($, $('.message'), {}))

    expect(rendered('video').hasClass('sticker')).toBe(true)
    expect(rendered('video img').hasClass('sticker')).toBe(true)
  })

  it('marks all TGS fallback media as stickers while preserving image classes', () => {
    const $ = load(`
      <div class="message">
        <div class="tgme_widget_message_sticker_wrap">
          <div class="tgme_widget_message_tgsticker_wrap">
            <picture>
              <img class="fallback" src="https://cdn-telegram.org/sticker.webp">
              <img src="/sticker-fallback.webp">
            </picture>
            <video src="https://cdn-telegram.org/sticker.webm"></video>
          </div>
        </div>
      </div>
    `)
    const rendered = load(getTgsStickers($, $('.message'), {}))
    const images = rendered('img')

    expect(images).toHaveLength(2)
    expect(images.filter('.sticker')).toHaveLength(2)
    expect(images.first().hasClass('fallback')).toBe(true)
    expect(images.first().attr('alt')).toBe('Sticker')
    expect(images.first().attr('loading')).toBe('eager')
    expect(rendered('video').hasClass('sticker')).toBe(true)
  })
})
