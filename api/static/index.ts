import { createStaticProxyResponse } from '../../src/lib/static-proxy'

export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const pathTarget = url.searchParams.get('path')
  const pathPrefix = '/static/'
  const rawPath = pathTarget ?? (url.pathname.startsWith(pathPrefix) ? url.pathname.slice(pathPrefix.length) : '')

  url.searchParams.delete('path')

  if (!rawPath) {
    return new Response('Not Found', { status: 404 })
  }

  const rawTarget = rawPath + url.search
  return createStaticProxyResponse(request, rawTarget)
}
