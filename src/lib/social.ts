export interface SocialLink {
  href: string
  title: string
  label: string
  icon: string
  rel: string
  type?: string
}

export interface SocialLinkOptions {
  rssUrl: string
  podcast?: string
  twitter?: string
  github?: string
  telegram?: string
  discord?: string
  mastodon?: string
  bluesky?: string
}

export function buildSocialLinks(options: SocialLinkOptions): SocialLink[] {
  const links: SocialLink[] = [
    {
      href: options.rssUrl,
      title: 'RSS Feed',
      label: 'RSS Feed',
      icon: 'ri:rss-line',
      rel: 'alternate noopener noreferrer',
      type: 'application/rss+xml',
    },
  ]

  if (options.podcast) {
    links.push({
      href: options.podcast,
      title: 'Podcast',
      label: 'Podcast',
      icon: 'ri:mic-line',
      rel: 'noopener noreferrer',
    })
  }

  if (options.twitter) {
    links.push({
      href: `https://x.com/${options.twitter}`,
      title: 'X/Twitter',
      label: 'X/Twitter',
      icon: 'ri:twitter-x-line',
      rel: 'noopener noreferrer',
    })
  }

  if (options.github) {
    links.push({
      href: `https://github.com/${options.github}`,
      title: 'GitHub',
      label: 'GitHub',
      icon: 'ri:github-line',
      rel: 'noopener noreferrer',
    })
  }

  if (options.telegram) {
    links.push({
      href: `https://t.me/${options.telegram}`,
      title: 'Telegram',
      label: 'Telegram',
      icon: 'ri:telegram-line',
      rel: 'noopener noreferrer',
    })
  }

  if (options.discord) {
    links.push({
      href: options.discord,
      title: 'Discord',
      label: 'Discord',
      icon: 'ri:discord-line',
      rel: 'noopener noreferrer',
    })
  }

  if (options.mastodon) {
    links.push({
      href: `https://${options.mastodon}`,
      title: 'Mastodon',
      label: 'Mastodon',
      icon: 'ri:mastodon-line',
      rel: 'noopener noreferrer',
    })
  }

  if (options.bluesky) {
    links.push({
      href: `https://bsky.app/profile/${options.bluesky}`,
      title: 'Bluesky',
      label: 'Bluesky',
      icon: 'ri:bluesky-line',
      rel: 'noopener noreferrer',
    })
  }

  return links
}
