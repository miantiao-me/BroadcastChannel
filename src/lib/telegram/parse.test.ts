import { load } from 'cheerio'
import { describe, expect, it } from 'vitest'
import { extractPost } from './parse'

const TELEGRAM_POST_HTML = `
  <div class="tgme_widget_message_wrap">
    <div class="tgme_widget_message" data-post="ExampleChannel/42">
      <div class="tgme_widget_message_text js-message_text">Release notes。Details for <a href="?q=%23release">#release</a> and <a href="?q=%23astro">#astro</a></div>
      <a class="tgme_widget_message_date"><time datetime="2026-07-14T08:30:00+00:00"></time></a>
      <div class="tgme_widget_message_reactions"><span class="tgme_reaction"><span class="emoji"><b>👍</b></span>7</span></div>
    </div>
  </div>
`

describe('extractPost', () => {
  it('extracts stable Telegram post fields and rewrites tag links', async () => {
    const $ = load(TELEGRAM_POST_HTML)
    const item = $('.tgme_widget_message_wrap').get(0) ?? null

    const post = await extractPost($, item, {
      channel: 'ExampleChannel',
      telegramHost: 'telegram.me',
      staticProxy: '/static/',
      reactionsEnabled: false,
    })

    expect(post.id).toBe('42')
    expect(post.title).toBe('Release notes')
    expect(post.datetime).toBe('2026-07-14T08:30:00+00:00')
    expect(post.tags).toEqual(['release', 'astro'])
    expect(post.text).toBe('Release notes。Details for #release and #astro')
    expect(post.content).toBe('Release notes。Details for <a href="/search/result?q=%23release" title="#release">#release</a> and <a href="/search/result?q=%23astro" title="#astro">#astro</a>')
    expect(post.reactions).toEqual([])
  })
})
