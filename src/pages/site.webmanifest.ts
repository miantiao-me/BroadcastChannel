import type { APIRoute } from 'astro'
import { getEnv } from '../lib/env'
import { getChannelInfo } from '../lib/telegram'

const MANIFEST_THEME_COLOR = '#f4f1ec'
const FALLBACK_MANIFEST_NAME = 'BroadcastChannel'

export const GET: APIRoute = async (context) => {
  const { SITE_URL } = context.locals
  const channel = await getChannelInfo(context)
  const absoluteSiteUrl = SITE_URL.startsWith('http') ? SITE_URL : new URL(SITE_URL, context.url.origin).toString()
  const staticProxy = getEnv(import.meta.env, context, 'STATIC_PROXY') ?? '/static/'
  const siteName = channel.title || FALLBACK_MANIFEST_NAME
  const avatarIcon = channel.avatar?.startsWith('http')
    ? new URL(`${staticProxy}${channel.avatar}`, absoluteSiteUrl).toString()
    : null

  const manifest = {
    name: siteName,
    short_name: siteName,
    icons: avatarIcon
      ? [
          {
            src: avatarIcon,
            sizes: '192x192',
            purpose: 'any maskable',
          },
          {
            src: avatarIcon,
            sizes: '512x512',
            purpose: 'any maskable',
          },
        ]
      : [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'favicon.ico',
            sizes: '16x16 32x32 48x48',
            type: 'image/x-icon',
            purpose: 'any',
          },
        ],
    theme_color: MANIFEST_THEME_COLOR,
    background_color: MANIFEST_THEME_COLOR,
    display: 'standalone',
  }

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
