import type { APIContext } from 'astro'
import type { ChannelInfo, Post } from '../types'
import { sanitizeFeedHtml } from './sanitize'
import { getChannelInfo } from './telegram'

export interface FeedData {
  channel: ChannelInfo
  posts: Post[]
  siteUrl: URL
  title: string
}

export interface JsonFeedData {
  version: string
  title: string
  description: string
  home_page_url: string
  feed_url: string
  items: {
    id: string
    url: string
    title: string | undefined
    summary: string | undefined
    date_published: string
    tags: string[]
    content_html: string
  }[]
}

export function buildJsonFeed({ channel, posts, siteUrl, title }: FeedData): JsonFeedData {
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title,
    description: channel.description,
    home_page_url: siteUrl.toString(),
    feed_url: new URL('rss.json', siteUrl).toString(),
    items: posts.map((item) => {
      const itemUrl = new URL(`posts/${item.id}`, siteUrl).toString()

      return {
        id: itemUrl,
        url: itemUrl,
        title: item.title || undefined,
        summary: item.description,
        date_published: new Date(item.datetime).toISOString(),
        tags: item.tags,
        content_html: sanitizeFeedHtml(item.content),
      }
    }),
  }
}

export async function getFeedData(context: APIContext): Promise<FeedData> {
  const tag = context.url.searchParams.get('tag')
  const channel = await getChannelInfo({
    q: tag ? `#${tag}` : '',
  })
  const siteUrl = new URL(context.locals.SITE_URL, context.url.origin)
  siteUrl.search = ''

  return {
    channel,
    posts: channel.posts ?? [],
    siteUrl,
    title: `${tag ? `${tag} | ` : ''}${channel.title}`,
  }
}
