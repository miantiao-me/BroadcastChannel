import type { APIRoute } from 'astro'
import rss from '@astrojs/rss'
import sanitizeHtml from 'sanitize-html'
import { getEnv } from '../lib/env'
import { getChannelInfo } from '../lib/telegram'

export const GET: APIRoute = async (context) => {
  const { SITE_URL } = context.locals
  const tag = context.url.searchParams.get('tag')
  const channel = await getChannelInfo(context, {
    q: tag ? `#${tag}` : '',
  })
  const posts = channel.posts ?? []
  const requestUrl = new URL(context.request.url)

  requestUrl.pathname = SITE_URL
  requestUrl.search = ''

  const response = await rss({
    title: `${tag ? `${tag} | ` : ''}${channel.title}`,
    description: channel.description,
    site: requestUrl.origin,
    trailingSlash: false,
    stylesheet: getEnv(import.meta.env, context, 'RSS_BEAUTIFY') ? '/rss.xsl' : undefined,
    items: posts.map(item => ({
      link: `posts/${item.id}`,
      title: item.title,
      description: item.description,
      pubDate: new Date(item.datetime),
      content: sanitizeHtml(item.content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'video', 'audio']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          video: ['src', 'width', 'height', 'poster'],
          audio: ['src', 'controls'],
          img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading', 'class'],
        },
        exclusiveFilter(frame) {
          return frame.tag === 'img' && frame.attribs.class?.includes('modal-img')
        },
      }),
    })),
  })

  response.headers.set('Content-Type', 'text/xml')
  response.headers.set('Cache-Control', 'public, max-age=3600')

  return response
}
