import type { ChannelInfo, Post } from '../types'
import { describe, expect, it } from 'vitest'
import { buildJsonFeed } from './feed'

describe('json feed builder', () => {
  it('emits JSON Feed 1.1 metadata and valid item fields', () => {
    const channel: ChannelInfo = {
      posts: [],
      title: 'Channel title',
      description: 'Channel description',
      descriptionHTML: null,
      avatar: undefined,
    }
    const posts: Post[] = [{
      id: '123',
      title: 'Post title',
      type: 'text',
      datetime: '2026-01-02T03:04:05.000Z',
      tags: ['tag'],
      text: 'Post text',
      description: 'Post summary',
      content: '<p>Hello</p><pre class="code"><code class="language-js"><span class="token keyword">const</span></code></pre><script>alert(1)</script>',
      reactions: [],
    }]

    const feed = buildJsonFeed({
      channel,
      posts,
      siteUrl: new URL('https://example.com/blog/'),
      title: 'Feed title',
    })

    expect(feed).toMatchObject({
      version: 'https://jsonfeed.org/version/1.1',
      title: 'Feed title',
      home_page_url: 'https://example.com/blog/',
      feed_url: 'https://example.com/blog/rss.json',
    })
    expect(feed.items).toHaveLength(1)
    expect(feed.items[0]).toMatchObject({
      id: 'https://example.com/blog/posts/123',
      url: 'https://example.com/blog/posts/123',
      title: 'Post title',
      summary: 'Post summary',
      tags: ['tag'],
      content_html: '<p>Hello</p><pre class="code"><code class="language-js"><span class="token keyword">const</span></code></pre>',
    })
    expect(typeof feed.items[0]?.date_published).toBe('string')
  })
})
