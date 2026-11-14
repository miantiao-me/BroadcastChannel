import { describe, expect, it } from 'vitest'
import { hasNewerPosts, pageEdges } from './pagination'

describe('pagination: hasNewerPosts', () => {
  it('hides newer when the page already shows the channel newest post', () => {
    // The page shows [100, 99, 98]; 100 is the channel's newest post, so
    // there are no newer posts and the After button must not render (#56).
    expect(
      hasNewerPosts({
        showNewer: true,
        oldestPostId: '98',
        newestPostId: '100',
        channelNewestPostId: '100',
      }),
    ).toBe(false)
  })

  it('shows newer when a newer post exists beyond the newest shown', () => {
    // The page shows [98, 97, 96], but the channel newest is 100.
    expect(
      hasNewerPosts({
        showNewer: true,
        oldestPostId: '96',
        newestPostId: '98',
        channelNewestPostId: '100',
      }),
    ).toBe(true)
  })

  it('hides newer when the page opts out of the newer link', () => {
    expect(
      hasNewerPosts({
        showNewer: false,
        oldestPostId: '96',
        newestPostId: '98',
        channelNewestPostId: '100',
      }),
    ).toBe(false)
  })

  it('hides newer when the channel newest post id is unknown', () => {
    expect(
      hasNewerPosts({
        showNewer: true,
        oldestPostId: '96',
        newestPostId: '98',
        channelNewestPostId: undefined,
      }),
    ).toBe(false)
  })

  it('hides newer when there are no posts on the page', () => {
    expect(
      hasNewerPosts({
        showNewer: true,
        newestPostId: undefined,
        channelNewestPostId: '100',
      } as never),
    ).toBe(false)
  })
})

describe('pagination: pageEdges', () => {
  it('reads posts newest first, the order getChannelInfo returns', () => {
    // getChannelInfo reverses Telegram's oldest-first markup (#56).
    expect(pageEdges([{ id: '100' }, { id: '99' }, { id: '98' }])).toEqual({ newest: '100', oldest: '98' })
  })

  it('has no edges on an empty page', () => {
    expect(pageEdges([])).toEqual({ newest: undefined, oldest: undefined })
  })
})
