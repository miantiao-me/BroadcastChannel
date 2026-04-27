import type { APIRoute } from 'astro'
import { getEnv } from '../lib/env'
import { getChannelInfo } from '../lib/telegram'

export const GET: APIRoute = async (Astro) => {
  const request = Astro.request
  const url = new URL(request.url)
  const channel = await getChannelInfo(Astro)
  const posts = channel.posts || []

  const channelsStr = getEnv(import.meta.env, Astro, 'CHANNEL')
  const channels = typeof channelsStr === 'string' ? channelsStr.split(',').map(c => c.trim()).filter(Boolean) : []
  const isMultiChannel = channels.length > 1
  const pageSize = 20

  const pages: string[] = []

  if (isMultiChannel) {
    // Generate separate sitemap endpoints per channel
    // E.g., /sitemap/channelA/103.xml, /sitemap/channelB/88.xml

    // Fallback ID collection
    const maxIds: number[] = Array.from({ length: channels.length }).fill(0) as number[]
    if (channel.sitemapAfterCursor) {
      const topCursors = channel.sitemapAfterCursor.split('-')
      topCursors.forEach((cursor, index) => {
        maxIds[index] = +cursor
      })
    }
    else {
      for (const post of posts) {
        if (post.id.includes('-')) {
          const parts = post.id.split('-')
          const channelIndex = channels.indexOf(parts[0])
          if (channelIndex > 0) {
            maxIds[channelIndex] = Math.max(maxIds[channelIndex], +parts[1])
          }
        }
        else {
          maxIds[0] = Math.max(maxIds[0], +post.id)
        }
      }
    }

    for (let i = 0; i < channels.length; i++) {
      let count = maxIds[i]
      if (count === 0)
        continue

      const channelName = channels[i]
      pages.push(`${channelName}-${count}`)

      while (count > pageSize) {
        count -= pageSize
        pages.push(`${channelName}-${count}`)
      }
    }
  }
  else {
    let count = +(posts[0]?.id ?? 0)
    pages.push(String(count))
    while (count > pageSize) {
      count -= pageSize
      pages.push(String(count))
    }
  }

  const sitemaps = pages.map((page) => {
    return `
<sitemap>
  <loc>${url.origin}/sitemap/${page}.xml</loc>
</sitemap>`
  })

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps.join('')}
</sitemapindex>`, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
