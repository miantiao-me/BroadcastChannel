import type { APIRoute } from 'astro'

export const GET: APIRoute = ({ params, url }) => {
  if (!params.q) {
    return Response.redirect(new URL('/', url), 308)
  }

  const searchUrl = new URL('/search/result', url)
  searchUrl.searchParams.set('q', params.q)

  return Response.redirect(searchUrl, 308)
}
