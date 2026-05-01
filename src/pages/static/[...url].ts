import type { APIRoute } from 'astro'
import { createStaticProxyResponse } from '../../lib/static-proxy'

export const GET: APIRoute = async ({ request, params, url }) => {
  try {
    const rawTarget = (params.url ?? '') + url.search
    return await createStaticProxyResponse(request, rawTarget)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(message, { status: 500 })
  }
}
