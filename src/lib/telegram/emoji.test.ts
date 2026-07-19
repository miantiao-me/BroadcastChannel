import { describe, expect, it } from 'vitest'
import { getCustomEmojiImage } from './emoji'

describe('custom emoji images', () => {
  it('uses telegram.me by default', () => {
    expect(getCustomEmojiImage('123')).toBe('https://telegram.me/i/emoji/123.webp')
  })

  it('uses the configured Telegram host and preserves static proxying', () => {
    expect(getCustomEmojiImage('123', {
      telegramHost: 'telegram.dog',
      staticProxy: '/static/',
    })).toBe('/static/https://telegram.dog/i/emoji/123.webp')
  })
})
