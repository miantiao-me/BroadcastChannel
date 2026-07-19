import { describe, expect, it } from 'vitest'
import { getPageSeo, getSitemapUrl, resolveSiteUrl } from './seo'

describe('page SEO', () => {
  it('uses the request URL to resolve relative site URLs and canonical paths', () => {
    const result = getPageSeo({
      siteUrl: '/blog/',
      url: new URL('https://preview.example/blog/posts/1?source=test'),
    })

    expect(result.canonical).toBe('https://preview.example/blog/posts/1')
  })
})

describe('sitemap URL helpers', () => {
  it('resolves relative site URLs against the request origin', () => {
    const siteUrl = resolveSiteUrl('/blog/', 'https://preview.example')

    expect(getSitemapUrl(siteUrl, 'posts/1')).toBe('https://preview.example/blog/posts/1')
  })

  it('uses absolute site URLs instead of the request origin', () => {
    const siteUrl = resolveSiteUrl('https://site.example/blog/', 'https://preview.example')

    expect(getSitemapUrl(siteUrl, 'posts/1')).toBe('https://site.example/blog/posts/1')
  })

  it('keeps configured subpaths for sitemap index URLs', () => {
    const siteUrl = resolveSiteUrl('/blog/', 'https://preview.example')

    expect(getSitemapUrl(siteUrl, 'sitemap/20.xml')).toBe('https://preview.example/blog/sitemap/20.xml')
  })
})
