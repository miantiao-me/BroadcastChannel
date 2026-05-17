import type { APIRoute } from 'astro'
import { getChannelInfo } from '../../lib/telegram'

function getOrigin(request: Request): string {
  const proto = (request.headers.get('x-forwarded-proto') || 'http').split(',')[0].trim()
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').split(',')[0].trim()

  if (host) {
    const cleanHost = host.includes('://') ? new URL(host).host : host
    return `${proto}://${cleanHost}`
  }

  return new URL(request.url).origin
}

export const GET: APIRoute = async (Astro) => {
  const request = Astro.request
  const origin = getOrigin(request)
  const channel = await getChannelInfo(Astro, {
    before: Astro.params.cursor,
  })
  const posts = channel.posts || []

  const xmlUrls = posts.map(post => `
    <url>
      <loc>${origin}/posts/${post.id}</loc>
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
