import { Feed } from 'feed'
import * as cheerio from 'cheerio'
import sanitizeHtml from 'sanitize-html'
import { getEnv } from '../lib/env'
import { getChannelInfo } from '../lib/telegram'

function getMimeType(url, defaultType = 'application/octet-stream') {
  if (!url) {
    return defaultType
  }

  const extension = url.split('?')[0].split('.').pop()?.toLowerCase()
  const mimeTypes = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    // Videos
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogv: 'video/ogg',
    mov: 'video/quicktime',
    // Audio
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
  }
  return mimeTypes[extension] || defaultType
}

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(Astro) {
  const { SITE_URL } = Astro.locals
  const tag = Astro.url.searchParams.get('tag')
  const channel = await getChannelInfo(Astro, {
    q: tag ? `#${tag}` : '',
  })
  const posts = channel.posts || []

  const request = Astro.request
  const url = new URL(request.url)
  url.pathname = SITE_URL
  url.search = ''

  const feedUrl = new URL(request.url)
  const siteUrl = url.toString()

  const feed = new Feed({
    title: `${tag ? `${tag} | ` : ''}${channel.title}`,
    description: channel.description || '',
    id: siteUrl,
    link: siteUrl,
    language: 'zh-cn',
    image: channel.avatar,
    favicon: channel.avatar,
    copyright: '',
    updated: posts.length > 0 ? new Date(posts[0].datetime) : new Date(),
    feedLinks: {
      atom: feedUrl.toString(),
    },
  })

  // Store media links for each post to add later
  const postMediaLinks = []

  for (const item of posts) {
    const postUrl = `${siteUrl}posts/${item.id}`

    const cleanContent = sanitizeHtml(item.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'video', 'audio']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        video: ['src', 'width', 'height', 'poster'],
        audio: ['src', 'controls'],
        img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading', 'class'],
      },
      exclusiveFilter(frame) {
        return frame.tag === 'img' && frame.attribs?.class?.includes('modal-img')
      },
    })

    feed.addItem({
      title: item.title || '',
      id: postUrl,
      link: postUrl,
      description: item.description || item.text?.substring(0, 200) || '',
      content: cleanContent,
      date: new Date(item.datetime),
      published: new Date(item.datetime),
      category: item.tags && item.tags.length > 0 ? item.tags.map(tagName => ({ name: tagName })) : undefined,
    })

    // Extract media from content for enhanced link elements
    const $ = cheerio.load(item.content)
    const mediaLinks = []

    // Add image links
    $('.tgme_widget_message_photo_wrap').each((_, photo) => {
      const imageUrl = $(photo).attr('style')?.match(/url\(["'](.*?)["']/)?.[1]
      if (imageUrl) {
        mediaLinks.push(`    <link href="${escapeXml(imageUrl)}" rel="image" type="${getMimeType(imageUrl, 'image/jpeg')}"/>`)
      }
    })

    // Add video links
    $('.tgme_widget_message_video_wrap video, .tgme_widget_message_roundvideo_wrap video').each((_, video) => {
      const src = $(video).attr('src')
      if (src) {
        mediaLinks.push(`    <link href="${escapeXml(src)}" rel="enclosure" type="${getMimeType(src, 'video/mp4')}"/>`)
      }
    })

    // Add audio links
    $('audio').each((_, audio) => {
      const src = $(audio).attr('src')
      if (src) {
        mediaLinks.push(`    <link href="${escapeXml(src)}" rel="enclosure" type="${getMimeType(src, 'audio/mpeg')}"/>`)
      }
    })

    // Add link preview images
    $('.link_preview_image').each((_, img) => {
      const src = $(img).attr('src')
      if (src) {
        mediaLinks.push(`    <link href="${escapeXml(src)}" rel="preview" type="${getMimeType(src, 'image/jpeg')}"/>`)
      }
    })

    postMediaLinks.push({ id: postUrl, links: mediaLinks })
  }

  let atomXml = feed.atom1()

  // Add XSL stylesheet if RSS_BEAUTIFY is enabled
  if (getEnv(import.meta.env, Astro, 'RSS_BEAUTIFY')) {
    atomXml = atomXml.replace(
      '<?xml version="1.0" encoding="utf-8"?>',
      '<?xml version="1.0" encoding="utf-8"?>\n<?xml-stylesheet type="text/xsl" href="/rss.xsl"?>',
    )
  }

  // Inject custom media links into each entry
  for (const { id, links } of postMediaLinks) {
    if (links.length > 0) {
      const entryIdPattern = new RegExp(`(<id>${escapeXml(id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</id>)`, 'g')
      const replacement = `$1\n${links.join('\n')}`
      atomXml = atomXml.replace(entryIdPattern, replacement)
    }
  }

  return new Response(atomXml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
