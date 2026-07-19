# BroadcastChannel

**Turn your Telegram Channel into a MicroBlog.**

---

English | [简体中文](./README.zh-cn.md)

**Contents:** [Features](#-features) · [Demo](#-demo) · [Tech Stack](#-tech-stack) · [Deployment](#deployment) · [Configuration](#configuration) · [Themes](#-themes) · [FAQs](#-faqs) · [Sponsor](#-sponsor)

## ✨ Features

- **Turn your Telegram Channel into a MicroBlog**
- **SEO friendly** `/sitemap.xml`
- **0 JS on the browser side**
- **RSS and RSS JSON** `/rss.xml` `/rss.json`

## 🪧 Demo

### Real users

- [面条实验室](https://memo.miantiao.me/)
- [Find Blog👁发现博客](https://broadcastchannel.pages.dev/)
- [Memos 广场 🎪](https://now.memobbs.app/)
- [APPDO 数字生活指南](https://mini.appdo.xyz/)
- [85.60×53.98卡粉订阅/提醒](https://tg.docofcard.com/)
- [新闻在花频道](https://tg.istore.app/)
- [ALL About RSS](https://blog.rss.tips/)
- [Charles Chin's Whisper](https://memo.eallion.com/)
- [PlayStation 新闻转发](https://playstation.hwaet.workers.dev)
- [Yu's Life](https://daily.pseudoyu.com/)
- [Leslie 和朋友们](https://tg.imlg.co/)
- [OKHK 分享](https://tg.okhk.net/)
- [gledos 的微型博客](https://microblogging.gledos.science)
- [Steve Studio](https://tgc.surgeee.me/)
- [LiFePO4:沙雕吐槽](https://lifepo4.top)
- [Hotspot Hourly](https://hourly.top/)
- [大河马中文财经新闻分享](https://a.xiaomi318.com/)
- [\_My. Tricks 🎩 Collection](https://channel.mykeyvans.com)
- [小报童专栏精选](https://xiaobaotong.genaiprism.site/)
- [Fake news](https://fake-news.csgo.ovh/)
- [miyi23's Geekhub资源分享](https://gh.miyi23.top/)
- [Magazine｜期刊杂志｜财新周刊](https://themagazine.top)
- [Remote Jobs & Cooperation](https://share-remote-jobs.vercel.app/)
- [甬哥侃侃侃--频道发布](https://ygkkktg.pages.dev)
- [Fugoou.log](https://fugoou.xyz)
- [Bboysoul的博客](https://tg.bboy.app/)
- [MakerHunter](https://share.makerhunter.com/)
- [ChatGPT/AI新闻聚合](https://g4f.icu/)
- [Abner's memos](https://memos.abnerz6.top/)
- [Appinn Talk](https://talk.appinn.net/)
- [小报童优惠与排行榜](https://youhui.xiaobaoto.com/)
- [热干面拌 10 号土豆泥](https://memo.moran.im/)
- [万事屋工程部](https://t.wanshiwu.fyi/)

### Platform

1. [Cloudflare Workers](https://broadcast-channel.run-on.workers.dev/)
2. [Netlify](https://broadcast-channel.netlify.app/)
3. [Vercel](https://broadcast-channel.vercel.app/)

BroadcastChannel supports deployment on serverless platforms like Cloudflare Workers, Netlify, Vercel that support SSR, or on a VPS.
Cloudflare Pages SSR is not supported with Astro 6 + @astrojs/cloudflare v13; use Workers for Cloudflare deployments.
For detailed tutorials, see [Deploy your Astro site](https://docs.astro.build/en/guides/deploy/).

## 🧱 Tech Stack

- Framework: [Astro](https://astro.build/)
- CMS: [Telegram Channels](https://telegram.org/tour/channels)
- Theme inspiration and CSS compatibility: [Bear Blog](https://github.com/HermanMartinus/bearblog) (independently implemented, with no official affiliation or Bear source files included)
- Optional theme: [Sepia](https://github.com/Planetable/SiteTemplateSepia)
- Optional theme inspiration: [Terminal](https://github.com/panr/hugo-theme-terminal)
- Optional theme inspiration: [Aria](https://github.com/miantiao-me/astro-aria)
- Optional theme visual inspiration: [Hacker News](https://news.ycombinator.com/) by Y Combinator, independently implemented with no official affiliation
- Optional theme visual inspiration: [Telegram public channel previews](https://t.me/s/), independently implemented with no official affiliation with Telegram Messenger Inc.
- Optional theme visual inspiration: [Zed's Agentic Engineering page](https://zed.dev/agentic-engineering), independently implemented with no official affiliation with Zed Industries, Inc.

## 🏗️ Deployment

<a id="deployment"></a>

### Docker

1. `docker pull ghcr.io/miantiao-me/broadcastchannel:main`
2. `docker run -d --name broadcastchannel -p 4321:4321 -e CHANNEL=miantiao_me ghcr.io/miantiao-me/broadcastchannel:main`

### Serverless

1. [Fork](https://github.com/miantiao-me/BroadcastChannel/fork) this project to your GitHub
2. Create a project on Cloudflare Workers/Netlify/Vercel/EdgeOne
3. Select the `BroadcastChannel` project and the `Astro` framework
4. Configure the environment variable `CHANNEL` with your channel name. This is the minimal configuration; see [Configuration](#configuration) for more
5. Save and deploy
6. Bind a domain (optional)
7. Update code, refer to the official GitHub documentation [Syncing a fork branch from the web UI](https://docs.github.com/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork#syncing-a-fork-branch-from-the-web-ui)

EdgeOne is supported and detected automatically through std-env's `edgeone_pages` provider or the platform-provided `EDGEONE_PROJECT_ID`/`EO_MAKERS` variables. Set `SERVER_ADAPTER` only when you need to override automatic adapter detection.

Cloudflare Workers minimal commands:

```bash
pnpm exec wrangler login
SERVER_ADAPTER=cloudflare_workers pnpm build
pnpm exec wrangler deploy
```

Configure `CHANNEL` and other runtime values in the Workers dashboard or with `pnpm exec wrangler secret put CHANNEL`.
Cloudflare Pages SSR is not supported with Astro 6 + @astrojs/cloudflare v13. Migrate Pages deployments to Workers.

## ⚒️ Configuration

<a id="configuration"></a>

### Minimal

Only `CHANNEL` is required. It is the public Telegram channel username (the string after `t.me/`).

```env
CHANNEL=miantiao_me
```

### Full reference

Optional variables. Also see [`.env.example`](./.env.example).

```env
## Required
CHANNEL=miantiao_me

## Language and timezone (Intl/BCP 47 locale, e.g. en or zh-CN)
LOCALE=en
TIMEZONE=America/New_York

## Social usernames
TELEGRAM=miantiao-me
TWITTER=miantiao-me
GITHUB=miantiao-me
MASTODON=mastodon.social/@Mastodon
BLUESKY=bsky.app

## Social URLs (full URLs required)
DISCORD=https://DISCORD.com
PODCAST=https://PODCAST.com

## Trusted-admin raw HTML injection (header / footer)
HEADER_INJECT=
FOOTER_INJECT=

## SEO
NOFOLLOW=false
NOINDEX=false

## UI
HIDE_DESCRIPTION=false
COMMENTS=true
REACTIONS=true
RSS_BEAUTIFY=true

## Tags, links, and navigation (comma / semicolon separated)
TAGS=tag1,tag2,tag3
LINKS=Title1,URL1;Title2,URL2;Title3,URL3;
NAVS=Title1,URL1;Title2,URL2;Title3,URL3;

## Search
GOOGLE_SEARCH_SITE=memo.miantiao.me

## Advanced (usually leave as-is)
TELEGRAM_HOST=telegram.dog
STATIC_PROXY=
# Override automatic adapter detection when needed.
SERVER_ADAPTER=
# Append hostname-only proxy targets to the defaults, separated by commas (no protocol, port, or path).
TARGET_WHITELIST=a.com,b.com
```

## 🎨 Themes

Base is always loaded. Leave `HEADER_INJECT` empty to use Base, or load **exactly one** built-in override:

| Theme            | Path                           |
| ---------------- | ------------------------------ |
| Sepia            | `/themes/sepia.css`            |
| Aria             | `/themes/aria.css`             |
| Terminal Amber   | `/themes/terminal-amber.css`   |
| Terminal Green   | `/themes/terminal-green.css`   |
| Terminal Cyan    | `/themes/terminal-cyan.css`    |
| Terminal Magenta | `/themes/terminal-magenta.css` |
| HN News          | `/themes/hn-news.css`          |
| TG Channel       | `/themes/tg-channel.css`       |
| ZAE              | `/themes/zae.css`              |

```env
HEADER_INJECT='<link rel="stylesheet" href="/themes/aria.css">'
```

HN News, TG Channel, and ZAE are fixed-light themes. Do not load `/themes/terminal-base.css` directly; there is no `/themes/terminal.css`.

Full configuration, light/dark behavior, platform dashboard values, custom CSS, and security notes: **[THEMES.md](./THEMES.md)**. Theme credits: **[NOTICE.md](./NOTICE.md)**.

## 🙋🏻 FAQs

1. Why is the content empty after deployment?
   - The channel must be **public**
   - The channel username is a **string**, not a number
   - Turn off **Restricting Saving Content** in the channel settings
   - Redeploy after changing environment variables
   - Telegram may block public display of some sensitive channels; verify at `https://t.me/s/channelusername`

## ☕ Sponsor

1. [Follow me on Telegram](https://t.me/miantiao_me)
2. [Follow me on 𝕏](https://404.li/x)
3. [Sponsor me on GitHub](https://github.com/sponsors/miantiao-me)
