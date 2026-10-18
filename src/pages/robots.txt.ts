import type { APIRoute } from 'astro'
import { getBooleanEnv } from '../lib/env'
import { getSitemapUrl, resolveSiteUrl } from '../lib/seo'

export const GET: APIRoute = async (Astro) => {
  const siteUrl = resolveSiteUrl(Astro.locals.SITE_URL, Astro.url.origin)
  const sitemapUrl = getSitemapUrl(siteUrl, 'sitemap.xml')
  const noindex = getBooleanEnv(import.meta.env, 'NOINDEX')

  const body = noindex
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`

  return new Response(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
