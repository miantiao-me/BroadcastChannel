import { createContext } from 'astro/middleware'
import { assert, describe, expect, it, vi } from 'vitest'
import { isHtmlResponse, onRequest, shouldApplyDefaultCache } from './middleware'

function requestContext(path: string, method = 'GET') {
  return createContext({
    request: new Request(new URL(path, 'https://example.com'), {
      method,
      headers: { Origin: 'https://reader.example' },
    }),
    defaultLocale: '',
  })
}

describe('middleware CORS', () => {
  it.each([
    '/rss.xml',
    '/rss.json',
    '/rss.xml?tag=astro',
    '/rss.json?tag=astro',
    '/sitemap.xml',
    '/sitemap/20.xml',
    '/rules/prefetch.json',
  ])('allows cross-origin reads of %s while preserving the response', async (path) => {
    const response = await onRequest(requestContext(path), async () => new Response('feed', {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'application/xml',
      },
    }))

    assert(response instanceof Response)
    expect(response.status).toBe(200)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600')
    expect(response.headers.get('Content-Type')).toBe('application/xml')
    expect(response.headers.has('Speculation-Rules')).toBe(false)
    expect(await response.text()).toBe('feed')
  })

  it('allows cross-origin HEAD requests', async () => {
    const response = await onRequest(requestContext('/rss.xml', 'HEAD'), async () => new Response(null))

    assert(response instanceof Response)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(await response.text()).toBe('')
  })

  it.each(['/rss.xml', '/rss.json', '/sitemap/20.xml'])('answers preflight requests for %s without calling the route', async (path) => {
    const context = requestContext(path, 'OPTIONS')
    context.request.headers.set('Access-Control-Request-Method', 'GET')
    context.request.headers.set('Access-Control-Request-Headers', 'x-reader')
    const next = vi.fn(async () => new Response(null, { status: 405 }))
    const response = await onRequest(context, next)

    assert(response instanceof Response)
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, HEAD, OPTIONS')
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('*')
    expect(await response.text()).toBe('')
    expect(next).not.toHaveBeenCalled()
  })

  it('allows readers to inspect feed errors', async () => {
    const response = await onRequest(requestContext('/rss.json'), async () => new Response('upstream error', { status: 502 }))

    assert(response instanceof Response)
    expect(response.status).toBe(502)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response.headers.has('Cache-Control')).toBe(false)
  })

  it.each(['/', '/posts/20', '/static/photo.jpg', '/rss.xml/other'])('does not add CORS headers to %s', async (path) => {
    const response = await onRequest(requestContext(path), async () => new Response('content'))

    assert(response instanceof Response)
    expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false)
  })

  it('passes OPTIONS requests for other paths to the route', async () => {
    const next = vi.fn(async () => new Response(null, { status: 405 }))
    const response = await onRequest(requestContext('/', 'OPTIONS'), next)

    assert(response instanceof Response)
    expect(response.status).toBe(405)
    expect(next).toHaveBeenCalledOnce()
    expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false)
  })
})

describe('middleware response handling', () => {
  it('leaves consumed responses untouched', async () => {
    const consumed = new Response('feed')
    await consumed.text()
    const headers = Object.fromEntries(consumed.headers)
    const response = await onRequest(requestContext('/rss.json'), async () => consumed)

    assert(response instanceof Response)
    expect(response.bodyUsed).toBe(true)
    expect(Object.fromEntries(response.headers)).toEqual(headers)
  })

  it('preserves legacy tag rewrites, RSS locals, and HTML headers', async () => {
    const context = requestContext('/search/%23astro')
    context.rewrite = vi.fn(async () => new Response('<html></html>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }))
    const next = vi.fn(async () => new Response(null, { status: 500 }))
    const response = await onRequest(context, next)

    assert(response instanceof Response)
    expect(context.rewrite).toHaveBeenCalledWith('/search/result?q=%23astro')
    expect(next).not.toHaveBeenCalled()
    expect(context.locals.RSS_URL).toBe(`${context.locals.SITE_URL}rss.xml?tag=astro`)
    expect(context.locals.RSS_PREFIX).toBe('astro | ')
    expect(response.headers.get('Speculation-Rules')).toBe('"/rules/prefetch.json"')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300, s-maxage=300')
    expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false)
  })
})

describe('middleware response header helpers', () => {
  it('applies default cache to successful responses without cache headers', () => {
    expect(shouldApplyDefaultCache(new Response('', { status: 200 }))).toBe(true)
  })

  it('applies default cache to redirects without cache headers', () => {
    expect(shouldApplyDefaultCache(new Response('', { status: 302 }))).toBe(true)
  })

  it('does not apply default cache to not found responses', () => {
    expect(shouldApplyDefaultCache(new Response('', { status: 404 }))).toBe(false)
  })

  it('does not apply default cache to upstream error responses', () => {
    expect(shouldApplyDefaultCache(new Response('', { status: 502 }))).toBe(false)
  })

  it('does not replace existing cache headers', () => {
    expect(shouldApplyDefaultCache(new Response('', {
      headers: {
        'Cache-Control': 'private, max-age=0',
      },
      status: 200,
    }))).toBe(false)
  })

  it('detects HTML responses with charset parameters', () => {
    expect(isHtmlResponse(new Response('', {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }))).toBe(true)
  })
})
