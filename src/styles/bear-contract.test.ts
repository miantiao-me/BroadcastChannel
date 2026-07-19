import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const theme = readFileSync(new URL('./app/theme.css', import.meta.url), 'utf8')
const base = readFileSync(new URL('./app/base.css', import.meta.url), 'utf8')
const feed = readFileSync(new URL('./app/feed.css', import.meta.url), 'utf8')
const typography = readFileSync(new URL('./content/typography.css', import.meta.url), 'utf8')
const syntax = readFileSync(new URL('./content/syntax.css', import.meta.url), 'utf8')
const sepia = readFileSync(new URL('../../public/themes/sepia.css', import.meta.url), 'utf8')
const aria = readFileSync(new URL('../../public/themes/aria.css', import.meta.url), 'utf8')
const terminal = readFileSync(new URL('../../public/themes/terminal-base.css', import.meta.url), 'utf8')
const hnNews = readFileSync(new URL('../../public/themes/hn-news.css', import.meta.url), 'utf8')
const tgChannel = readFileSync(new URL('../../public/themes/tg-channel.css', import.meta.url), 'utf8')
const zae = readFileSync(new URL('../../public/themes/zae.css', import.meta.url), 'utf8')
const postEntry = readFileSync(new URL('../components/PostEntry.astro', import.meta.url), 'utf8')
const postsPage = readFileSync(new URL('../components/PostsPage.astro', import.meta.url), 'utf8')

const bearVariables = [
  '--width',
  '--font-main',
  '--font-secondary',
  '--font-scale',
  '--background-color',
  '--heading-color',
  '--text-color',
  '--link-color',
  '--visited-color',
  '--code-background-color',
  '--code-color',
  '--blockquote-color',
]

function compact(css: string): string {
  return css.replace(/\s+/g, ' ').trim()
}

describe('bear CSS contract', () => {
  it('keeps the twelve Bear variables at their contract values', () => {
    const variables = {
      '--width': '800px',
      '--font-main': 'Verdana, sans-serif',
      '--font-secondary': 'Verdana, sans-serif',
      '--font-scale': '1em',
      '--background-color': '#fff',
      '--heading-color': '#222',
      '--text-color': '#444',
      '--link-color': '#3273dc',
      '--visited-color': '#8b6fcb',
      '--code-background-color': '#f2f2f2',
      '--code-color': '#222',
      '--blockquote-color': '#222',
    }

    for (const [name, value] of Object.entries(variables)) {
      expect(theme).toContain(`${name}: ${value};`)
    }
  })

  it('keeps Bear content width inside tokenized border-box padding', () => {
    const css = compact(`${theme} ${base}`)

    expect(css).toContain('--body-padding-inline: 20px;')
    expect(css).toContain('width: 100%; max-width: calc(var(--width) + var(--body-padding-inline) + var(--body-padding-inline));')
    expect(css).toContain('padding-block: 20px; padding-inline: var(--body-padding-inline);')
  })

  it('limits the default visited color to feed post metadata', () => {
    expect(compact(base)).toContain('a:link, a:visited { color: var(--link-color); }')
    expect(compact(base)).not.toContain('a:visited { color: var(--visited-color); }')
    expect(compact(feed)).toContain('body.feed .post-meta a:visited { color: var(--visited-color); }')
  })

  it('keeps Bear inline and highlighted code geometry', () => {
    expect(compact(typography)).toContain(':not(pre) > code { padding: 2px; border-radius: 3px;')
    expect(compact(syntax)).toContain('.highlight, .code { overflow-x: auto; margin-block: 1em; padding: 1px 15px; border-radius: 3px;')
    expect(compact(syntax)).toContain('.highlight pre, .code pre { margin: 0; padding: 0; }')
  })

  it('keeps built-in theme padding tokens', () => {
    expect(sepia).toContain('--body-padding-inline: 1.25rem;')
    expect(compact(sepia)).toContain('padding-inline: var(--body-padding-inline);')
    expect(compact(sepia)).toContain('.highlight pre, .code pre { margin: 0; padding: 0; border: 0;')

    expect(aria).toContain('--body-padding-inline: 1.5rem;')
    expect(aria).toContain('--body-padding-inline: 1rem;')
    expect(aria).toContain('--body-padding-inline: 0.875rem;')
    expect(compact(aria)).toContain('padding: 0 var(--body-padding-inline) 1.5rem;')

    expect(terminal).toContain('--body-padding-inline: clamp(1rem, 4vw, 2.5rem);')
    expect(terminal).toContain('--body-padding-inline: 1rem;')
    expect(compact(terminal)).toContain('padding: var(--body-padding-inline);')
  })

  it('loads fixed-light themes with the key Bear variables', () => {
    for (const css of [hnNews, tgChannel, zae]) {
      expect(css).toMatch(/color-scheme:\s*light;/)
      expect(css).not.toMatch(/color-scheme:\s*light\s+dark;/)

      for (const variable of bearVariables) {
        expect(css).toContain(`${variable}:`)
      }
    }
  })

  it('keeps fixed-light theme padding tokens aligned with body padding', () => {
    for (const css of [hnNews, tgChannel, zae]) {
      expect(css.match(/--body-padding-inline: 0px;/g)).toHaveLength(1)
    }

    expect(compact(hnNews)).toContain('padding: 0 0 1rem;')
    expect(compact(tgChannel)).toContain('padding: 0 var(--body-padding-inline);')
    expect(compact(zae)).toContain('padding: 0 0 2rem;')
  })

  it('keeps optional feed hooks hidden in Base', () => {
    expect(compact(feed)).toContain('.hn-story, .post-entry-avatar, .post-entry-author, .tg-message-meta { display: none; }')
  })

  it('wires optional feed hooks to real channel data', () => {
    for (const className of ['hn-story', 'post-entry-avatar', 'post-entry-author', 'tg-message-meta']) {
      expect(postEntry).toContain(`class="${className}"`)
    }

    expect(compact(postsPage)).toContain('channelAvatar={channel.avatar} channelTitle={channel.title}')
  })
})
