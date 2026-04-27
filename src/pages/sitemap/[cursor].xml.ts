import type { APIRoute } from 'astro'
import { getEnv } from '../../lib/env'
import { getChannelInfo } from '../../lib/telegram'

export const GET: APIRoute = async (Astro) => {
  const request = Astro.request
  const url = new URL(request.url)
  const cursorParam = Astro.params.cursor || ''

  const channelsStr = getEnv(import.meta.env, Astro, 'CHANNEL')
  const channels = typeof channelsStr === 'string' ? channelsStr.split(',').map(c => c.trim()).filter(Boolean) : []
  const isMultiChannel = channels.length > 1

  let fetchBefore = cursorParam
  let sitemapChannel = ''

  // Note: For backwards compatibility, the legacy single-channel route /sitemap/[number].xml
  // is still handled by this file when isMultiChannel is false.
  // In multi-channel mode, we generate separate per-channel routes like /sitemap/channelB-103.xml
  // So if cursorParam is "channelB-103", we split it to get the specific channel's pagination.
  if (isMultiChannel && cursorParam.includes('-')) {
    const lastDashIndex = cursorParam.lastIndexOf('-')
    if (lastDashIndex !== -1) {
      sitemapChannel = cursorParam.substring(0, lastDashIndex)
      const countValue = cursorParam.substring(lastDashIndex + 1)

      // Construct a sparse multi-channel cursor where only the targeted channel has a non-zero value
      const channelIndex = channels.indexOf(sitemapChannel)
      if (channelIndex !== -1) {
        const fakeCursors = Array.from({ length: channels.length }).fill('0')
        fakeCursors[channelIndex] = countValue
        fetchBefore = fakeCursors.join('-')
      }
    }
  }

  const channel = await getChannelInfo(Astro, {
    before: fetchBefore,
  })

  // Filter posts to only include those from the channel this sitemap is responsible for
  let posts = channel.posts || []
  if (isMultiChannel && sitemapChannel) {
    const isPrimaryChannel = channels.indexOf(sitemapChannel) === 0
    posts = posts.filter((post) => {
      if (isPrimaryChannel) {
        return !post.id.includes('-')
      }
      else {
        return post.id.startsWith(`${sitemapChannel}-`)
      }
    })
  }

  const xmlUrls = posts.map(post => `
    <url>
      <loc>${url.origin}/posts/${post.id}</loc>
      <lastmod>${new Date(post.datetime).toISOString()}</lastmod>
    </url>
  `).join('')

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${xmlUrls}
</urlset>`, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
