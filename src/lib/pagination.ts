export interface PagingEdges {
  showNewer: boolean
  /** The oldest post id shown on the page. */
  oldestPostId?: string
  /** The newest post id shown on the page. */
  newestPostId?: string
  /** The channel's absolute newest post id. */
  channelNewestPostId?: string
}

// hasNewerPosts reports whether a "newer" (After) pagination link is
// meaningful. After paging forward (before then after), a page can end up
// showing the channel's newest posts; the old check (`showNewer && oldestPostId`)
// kept rendering the After button even though no newer posts existed, which
// just sent the reader back to the same newest set (#56). The After button is
// only meaningful when a post newer than the newest shown actually exists.
export function hasNewerPosts({
  showNewer,
  oldestPostId,
  newestPostId,
  channelNewestPostId,
}: PagingEdges): boolean {
  if (!showNewer || !oldestPostId || !newestPostId || !channelNewestPostId) {
    return false
  }
  return Number(newestPostId) < Number(channelNewestPostId)
}

// pageEdges names the two ends of a page of posts. getChannelInfo reverses
// Telegram's oldest-first markup, so posts[0] is the newest post and the last
// one is the oldest. Every caller goes through here so the order lives in one
// place.
export function pageEdges(posts: { id: string }[]): { newest?: string, oldest?: string } {
  return { newest: posts[0]?.id, oldest: posts[posts.length - 1]?.id }
}
