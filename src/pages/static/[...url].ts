import type { APIRoute } from 'astro'
import { createStaticProxyResponse } from '../../lib/static-proxy'

export const GET: APIRoute = async ({ request, params, url }) => {
  const rawTarget = (params.url ?? '') + url.search
  return createStaticProxyResponse(request, rawTarget)
}
