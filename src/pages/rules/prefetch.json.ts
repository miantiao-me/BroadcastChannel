import type { APIRoute } from 'astro'

export const GET: APIRoute = () => {
  return Response.json({
    prerender: [
      {
        urls: ['/', '/tags'],
        eagerness: 'eager',
      },
    ],
    prefetch: [
      {
        where: { href_matches: ['/posts/*'] },
        eagerness: 'moderate',
      },
    ],
  }, {
    headers: {
      'Content-Type': 'application/speculationrules+json',
    },
  })
}
