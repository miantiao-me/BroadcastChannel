import { load } from 'cheerio'
import { describe, expect, it } from 'vitest'
import { sanitizeContentHtml, sanitizeFeedHtml } from '../sanitize'
import { modifyHTMLContent } from './content'

describe('telegram HTML content', () => {
  it('emits and preserves the stable code block hooks', async () => {
    const $ = load('<div class="message"><pre>def greet(name):<br>    return f"Hello {name}"</pre></div>')
    const content = $('.message')

    await modifyHTMLContent($, content)

    const html = content.html() ?? ''
    const pre = content.find('pre')
    const code = pre.children('code')

    expect(pre.hasClass('code')).toBe(true)
    expect(code.hasClass('language-python')).toBe(true)
    expect(code.find('.token').length).toBeGreaterThan(0)
    expect(sanitizeContentHtml(html)).toContain('<pre class="code"><code class="language-python">')
    expect(sanitizeFeedHtml(html)).toContain('<pre class="code"><code class="language-python">')
    expect(sanitizeFeedHtml(html)).toContain('class="token keyword"')
  })
})
