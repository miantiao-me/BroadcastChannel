import type { APIRoute } from 'astro'
import { buildJsonFeed, getFeedData } from '../lib/feed'

export const GET: APIRoute = async (context) => {
  const feed = buildJsonFeed(await getFeedData(context))

  return new Response(JSON.stringify(feed), {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/feed+json; charset=utf-8',
    },
  })
}
