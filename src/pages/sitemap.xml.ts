import type { APIRoute } from 'astro'
import { getChannelInfo } from '../lib/telegram'

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
  const channel = await getChannelInfo(Astro)
  const posts = channel.posts || []

  const pageSize = 20
  let count = +posts[0]?.id

  const pages: number[] = []
  pages.push(count)
  while (count > pageSize) {
    count -= pageSize
    pages.push(count)
  }

  const sitemaps = pages.map((page) => {
    return `
<sitemap>
  <loc>${origin}/sitemap/${page}.xml</loc>
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
