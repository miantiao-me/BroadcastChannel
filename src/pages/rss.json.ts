import type { APIRoute } from 'astro'
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

  return Response.json({
    version: 'https://jsonfeed.org/version/1.1',
    title: `${tag ? `${tag} | ` : ''}${channel.title}`,
    description: channel.description,
    home_page_url: requestUrl.toString(),
    items: posts.map(item => ({
      url: `${requestUrl.toString()}posts/${item.id}`,
      title: item.title,
      description: item.description,
      date_published: new Date(item.datetime),
      tags: item.tags,
      content_html: item.content,
    })),
  })
}
