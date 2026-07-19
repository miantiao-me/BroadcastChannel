# Themes

BroadcastChannel always loads its complete **Base** theme. A theme selection is either Base alone or Base plus one CSS override loaded through `HEADER_INJECT`. Overrides change presentation only: BroadcastChannel still owns the routes, complete Telegram feed, reactions, comments, media, search, RSS, and other product behavior.

There is no `THEME` environment variable, theme registry, browser-side theme switcher, or automatic Bear CSS download. Load only one override at a time; combining overrides produces conflicting cascade rules.

## Built-in themes

Use one of these exact `.env` configurations:

| Theme            | Light and dark behavior             | `HEADER_INJECT`                                                               |
| ---------------- | ----------------------------------- | ----------------------------------------------------------------------------- |
| Base             | Follows the system preference       | Leave unset or use `HEADER_INJECT=`                                           |
| Sepia            | Fixed light, warm-paper palette     | `HEADER_INJECT='<link rel="stylesheet" href="/themes/sepia.css">'`            |
| Aria             | Follows the system preference       | `HEADER_INJECT='<link rel="stylesheet" href="/themes/aria.css">'`             |
| Terminal Amber   | Fixed dark, amber accent            | `HEADER_INJECT='<link rel="stylesheet" href="/themes/terminal-amber.css">'`   |
| Terminal Green   | Fixed dark, green accent            | `HEADER_INJECT='<link rel="stylesheet" href="/themes/terminal-green.css">'`   |
| Terminal Cyan    | Fixed dark, cyan accent             | `HEADER_INJECT='<link rel="stylesheet" href="/themes/terminal-cyan.css">'`    |
| Terminal Magenta | Fixed dark, magenta accent          | `HEADER_INJECT='<link rel="stylesheet" href="/themes/terminal-magenta.css">'` |
| HN News          | Fixed light, full-post news feed    | `HEADER_INJECT='<link rel="stylesheet" href="/themes/hn-news.css">'`          |
| TG Channel       | Fixed light, single-column messages | `HEADER_INJECT='<link rel="stylesheet" href="/themes/tg-channel.css">'`       |
| ZAE              | Fixed light, compact document sheet | `HEADER_INJECT='<link rel="stylesheet" href="/themes/zae.css">'`              |

Aria uses a neutral, system-sans presentation with light and dark palettes, a dashed square-line grid wash, and larger media radii. Sepia uses a fixed light palette and system-sans typography. All four Terminal variants use the same square, fixed-dark, Fira Code–first monospace design (loaded from Google Fonts when available); only their background, surface, accent, muted, border, and visited-link palettes differ.

HN News is a compact, utilitarian full-post feed with a warm light canvas, orange accent, dense metadata, and a story-title hierarchy above each available post title; it does not collapse posts into summaries. TG Channel uses a cool page backdrop and one centered message column with the real channel avatar repeated for each entry, its channel title, and message time; it has no right-side profile card. ZAE uses a light, compact document sheet with a reduced identity header, technical toolbar, restrained rules, and monospace accents. These three themes deliberately fix `color-scheme: light`; they do not switch with the system preference.

Each is an independent visual interpretation for BroadcastChannel, not a source adaptation or an official theme. No source code, CSS, fonts, or assets from Hacker News, Telegram, or Zed are bundled. See [NOTICE.md](./NOTICE.md) for provenance and non-affiliation details.

`/themes/terminal-base.css` is an internal shared stylesheet imported by the four Terminal entry files. Do not load it directly: it has no standalone palette. There is no `/themes/terminal.css` entry point.

## Platform configuration

In `.env` files, use one of the quoted assignments in the table above. In the Cloudflare Workers, Netlify, or Vercel environment-variable dashboard, set the key to `HEADER_INJECT` and paste only the raw value, without the outer shell quotes. For example:

```html
<link rel="stylesheet" href="/themes/aria.css" />
```

For Docker or another shell command, quote the complete assignment so the shell does not interpret the HTML:

```bash
docker run -e 'HEADER_INJECT=<link rel="stylesheet" href="/themes/terminal-green.css">' …
```

Relative `/themes/...` URLs are served by the deployed BroadcastChannel site on every supported platform. Redeploy or restart after changing the environment variable.

Fixed-light examples:

```env
HEADER_INJECT='<link rel="stylesheet" href="/themes/hn-news.css">'
```

```env
HEADER_INJECT='<link rel="stylesheet" href="/themes/tg-channel.css">'
```

```env
HEADER_INJECT='<link rel="stylesheet" href="/themes/zae.css">'
```

## Custom CSS

Host a normal CSS file at a URL you control and load it instead of a built-in override:

```env
HEADER_INJECT='<link rel="stylesheet" href="https://example.com/theme.css">'
```

Base exposes the Bear-style variables `--width`, `--font-main`, `--font-secondary`, `--font-scale`, `--background-color`, `--heading-color`, `--text-color`, `--link-color`, `--visited-color`, `--code-background-color`, `--code-color`, and `--blockquote-color`. `--width` is the maximum content width; the body's horizontal padding is added outside it. If a custom theme changes that padding, it must set the internal `--body-padding-inline` to the same value so the outer maximum remains correct.

Base provides a limited Bear-compatible public shell and CSS surface by reusing Bear's palette, typography variables, `--width` semantics, and selected hooks: `body.home`, `body.post`, `body.page`, `header > a.title > h1`, `header > nav`, `main`, `footer`, `.tags`, `pre.code`, and inbound `.highlight`. The content DOM is BroadcastChannel-specific and includes `body.feed`, `ol.posts-feed`, `.post-entry`, `p.tags.post-tags`, reactions, comments, and Telegram widgets. It is not a strict Bear DOM superset.

Compatibility is intentionally limited, not official or 100% Bear compatibility. BroadcastChannel preserves complete Telegram posts rather than Bear's `ul.blog-posts` title list, does not add `/blog` or `/feed` routes, keeps the post-detail heading visually hidden, and does not synthesize a Subscribe form. A CSS override must preserve those feed capabilities and accessible content rather than replacing the product DOM.

In Base, `--visited-color` is used only for visited post permalinks on feed pages. Override themes may intentionally define broader visited-link states.

## Security and responsibility

`HEADER_INJECT` is a trusted-administrator raw HTML boundary, not a safe CSS-only field. It can inject arbitrary document-head content and must never contain untrusted or user-controlled input. Site administrators are responsible for the license, security, privacy, and accessibility of external stylesheets.
