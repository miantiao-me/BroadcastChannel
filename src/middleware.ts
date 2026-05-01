import { defineMiddleware } from 'astro:middleware'

function getEncodedTagSearchQuery(pathname: string): string {
  if (!pathname.startsWith('/search/%23')) {
    return ''
  }

  try {
    return decodeURIComponent(pathname.slice('/search/'.length))
  }
  catch {
    return ''
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.SITE_URL = `${import.meta.env.SITE ?? ''}${import.meta.env.BASE_URL}`
  context.locals.RSS_URL = `${context.locals.SITE_URL}rss.xml`
  context.locals.RSS_PREFIX = ''

  const querySearch = context.url.searchParams.get('q') || ''
  const legacyTagSearch = getEncodedTagSearchQuery(context.url.pathname)
  const pathSearch = context.params.q || ''
  const searchQuery = querySearch || legacyTagSearch || pathSearch

  if (context.url.pathname.startsWith('/search') && searchQuery.startsWith('#')) {
    const tag = searchQuery.replace('#', '')
    context.locals.RSS_URL = `${context.locals.SITE_URL}rss.xml?tag=${encodeURIComponent(tag)}`
    context.locals.RSS_PREFIX = `${tag} | `
  }

  const response = legacyTagSearch
    ? await context.rewrite(`/search/result?q=${encodeURIComponent(legacyTagSearch)}`)
    : await next()

  if (!response.bodyUsed) {
    if (response.headers.get('Content-type') === 'text/html') {
      response.headers.set('Speculation-Rules', '"/rules/prefetch.json"')
    }

    if (!response.headers.has('Cache-Control')) {
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300')
    }
  }
  return response
})
