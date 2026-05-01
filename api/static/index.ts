import { createStaticProxyResponse } from '../../src/lib/static-proxy'

export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request): Promise<Response> {
  try {
    const urlStr = request.url?.split('/static/')?.[1]

    if (!urlStr) {
      return new Response('Not Found', { status: 404 })
    }

    const parsed = new URL(urlStr)
    parsed.searchParams.delete('path')

    const rawTarget = parsed.origin + parsed.pathname + parsed.search
    return await createStaticProxyResponse(request, rawTarget)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(message, { status: 500 })
  }
}
