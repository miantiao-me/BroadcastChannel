# 广播频道

**将你的 Telegram Channel 转为微博客。**

---

[English](./README.md) | 简体中文

**目录：** [特性](#-特性) · [演示](#-演示) · [技术栈](#-技术栈) · [部署](#deployment) · [配置](#configuration) · [主题](#-主题) · [常问问题](#-常问问题) · [赞助](#-赞助)

## ✨ 特性

- **将 Telegram Channel 转为微博客**
- **SEO 友好** `/sitemap.xml`
- **浏览器端 0 JS**
- **提供 RSS 和 RSS JSON** `/rss.xml` `/rss.json`

## 🪧 演示

### 真实用户

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
- [小众软件的发现](https://talk.appinn.net/)
- [小报童优惠与排行榜](https://youhui.xiaobaoto.com/)
- [热干面拌 10 号土豆泥](https://memo.moran.im/)
- [万事屋工程部](https://t.wanshiwu.fyi/)

### 平台

1. [Cloudflare Workers](https://broadcast-channel.run-on.workers.dev/)
2. [Netlify](https://broadcast-channel.netlify.app/)
3. [Vercel](https://broadcast-channel.vercel.app/)

广播频道支持部署在 Cloudflare Workers、Netlify、Vercel 等支持 SSR 的无服务器平台或者 VPS。
Cloudflare Pages SSR 在当前 Astro 6 + @astrojs/cloudflare v13 下不受支持，Cloudflare 部署请使用 Workers。
具体教程见[部署你的 Astro 站点](https://docs.astro.build/zh-cn/guides/deploy/)。

## 🧱 技术栈

- 框架：[Astro](https://astro.build/)
- 内容管理系统：[Telegram Channels](https://telegram.org/tour/channels)
- 主题灵感与 CSS 兼容来源：[Bear Blog](https://github.com/HermanMartinus/bearblog)（独立实现，与 Bear 无官方关系，未包含其源文件）
- 可选主题：[Sepia](https://github.com/Planetable/SiteTemplateSepia)
- 可选主题灵感：[Terminal](https://github.com/panr/hugo-theme-terminal)
- 可选主题灵感：[Aria](https://github.com/miantiao-me/astro-aria)
- 可选主题视觉灵感：[Hacker News](https://news.ycombinator.com/)（由 Y Combinator 运营，独立实现，与其无官方关系）
- 可选主题视觉灵感：[Telegram 公开频道预览](https://t.me/s/)（独立实现，与 Telegram Messenger Inc. 无官方关系）
- 可选主题视觉灵感：[Zed 的 Agentic Engineering 页面](https://zed.dev/agentic-engineering)（独立实现，与 Zed Industries, Inc. 无官方关系）

## 🏗️ 部署

<a id="deployment"></a>

### Docker

1. `docker pull ghcr.io/miantiao-me/broadcastchannel:main`
2. `docker run -d --name broadcastchannel -p 4321:4321 -e CHANNEL=miantiao_me ghcr.io/miantiao-me/broadcastchannel:main`

### Serverless

1. [Fork](https://github.com/miantiao-me/BroadcastChannel/fork) 此项目到你 GitHub
2. 在 Cloudflare Workers/Netlify/Vercel/EdgeOne 创建项目
3. 选择 `BroadcastChannel` 项目和 `Astro` 框架
4. 配置环境变量 `CHANNEL` 为你的频道名称。此为最小化配置，更多见 [配置](#configuration)
5. 保存并部署
6. 绑定域名（可选）
7. 更新代码，参考 GitHub 官方文档 [从 Web UI 同步分叉分支](https://docs.github.com/zh/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork#syncing-a-fork-branch-from-the-web-ui)

项目支持 EdgeOne，并会通过 std-env 的 `edgeone_pages` provider 或平台提供的 `EDGEONE_PROJECT_ID`/`EO_MAKERS` 变量自动检测。仅在需要覆盖自动适配器检测时设置 `SERVER_ADAPTER`。

Cloudflare Workers 最小命令：

```bash
pnpm exec wrangler login
SERVER_ADAPTER=cloudflare_workers pnpm build
pnpm exec wrangler deploy
```

请在 Workers 控制台配置 `CHANNEL` 等运行时变量，或使用 `pnpm exec wrangler secret put CHANNEL`。
Cloudflare Pages SSR 在 Astro 6 + @astrojs/cloudflare v13 下不受支持，请将 Pages 部署迁移到 Workers。

## ⚒️ 配置

<a id="configuration"></a>

### 最小配置

只需配置 `CHANNEL`：公开 Telegram 频道用户名（`t.me/` 后面那串字符）。

```env
CHANNEL=miantiao_me
```

### 完整参考

可选变量。亦可对照 [`.env.example`](./.env.example)。

```env
## 必填
CHANNEL=miantiao_me

## 语言与时区（Intl/BCP 47 locale，例如 zh-CN 或 en）
LOCALE=zh-CN
TIMEZONE=Asia/Shanghai

## 社交媒体用户名
TELEGRAM=miantiao-me
TWITTER=miantiao-me
GITHUB=miantiao-me
MASTODON=mastodon.social/@Mastodon
BLUESKY=bsky.app

## 社交媒体 URL（需完整 URL）
DISCORD=https://DISCORD.com
PODCAST=https://PODCAST.com

## 可信管理员原始 HTML 注入（页头 / 页脚）
HEADER_INJECT=
FOOTER_INJECT=

## SEO
NOFOLLOW=false
NOINDEX=false

## 界面
HIDE_DESCRIPTION=false
COMMENTS=true
REACTIONS=true
RSS_BEAUTIFY=true

## 标签、链接与导航（英文逗号 / 分号分隔）
TAGS=标签A,标签B,标签C
LINKS=Title1,URL1;Title2,URL2;Title3,URL3;
NAVS=Title1,URL1;Title2,URL2;Title3,URL3;

## 搜索
GOOGLE_SEARCH_SITE=memo.miantiao.me

## 高级（一般无需修改）
TELEGRAM_HOST=telegram.dog
STATIC_PROXY=
# 需要时覆盖自动适配器检测。
SERVER_ADAPTER=
# 在默认白名单基础上追加代理目标；仅填写域名，以英文逗号分隔（不含协议、端口或路径）。
TARGET_WHITELIST=a.com,b.com
```

## 🎨 主题

始终加载完整 Base 主题。不配置 `HEADER_INJECT` 即使用 Base；也可以且只能加载 **一个** 内置覆盖主题：

| 主题             | 路径                           |
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

HN News、TG Channel 和 ZAE 是固定浅色主题。不要直接加载 `/themes/terminal-base.css`；项目不存在 `/themes/terminal.css`。

完整配置、明暗模式、平台控制台写法、自定义 CSS 与安全边界见 **[THEMES.md](./THEMES.md)**。主题归属见 **[NOTICE.md](./NOTICE.md)**。

## 🙋🏻 常问问题

1. 为什么部署后内容为空？
   - 频道必须是**公开**的
   - 频道用户名是**字符串**，不是数字
   - 关闭频道 **Restricting Saving Content** 设置
   - 修改环境变量后需要**重新部署**
   - Telegram 会屏蔽部分敏感频道的公开展示，可访问 `https://t.me/s/频道用户名` 确认

## ☕ 赞助

1. [在 Telegram 关注我](https://t.me/miantiao_me)
2. [在 𝕏 上关注我](https://404.li/x)
3. [在 GitHub 赞助我](https://github.com/sponsors/miantiao-me)
