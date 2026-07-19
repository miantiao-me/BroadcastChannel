---
version: alpha
name: BroadcastChannel Base and theme overrides
description: "The complete BroadcastChannel Base theme, its limited Bear CSS compatibility surface, and its optional Sepia, Aria, Terminal, HN News, TG Channel, and ZAE overrides."
colors:
  primary: "#3273dc"
  base-light-background: "#fff"
  base-light-heading: "#222"
  base-light-text: "#444"
  base-light-visited: "#8b6fcb"
  base-light-code-background: "#f2f2f2"
  base-light-code-text: "#222"
  base-light-blockquote: "#222"
  base-dark-background: "#01242e"
  base-dark-heading: "#eee"
  base-dark-text: "#ddd"
  base-dark-link: "#8cc2dd"
  base-dark-visited: "#8b6fcb"
  base-dark-code-background: "#000"
  base-dark-code-text: "#ddd"
  base-dark-blockquote: "#ccc"
  sepia-background: "#f4f1ec"
  sepia-heading: "#333"
  sepia-text: "#181513"
  sepia-link: "#5a6570"
  sepia-visited: "#725f82"
  sepia-code-background: "#f9f9f9"
  sepia-code-text: "#24201d"
  sepia-blockquote: "#333"
  sepia-accent: "#b23b00"
  sepia-line: "rgba(0, 0, 0, 0.07)"
  sepia-link-hover: "#3f4850"
  sepia-muted: "#706862"
  sepia-surface: "#fff"
typography:
  base-body:
    fontFamily: "Verdana, sans-serif"
    fontSize: 1em
    lineHeight: 1.5
  base-main:
    fontFamily: "Verdana, sans-serif"
    fontSize: 1em
    lineHeight: 1.6
  base-heading:
    fontFamily: "Verdana, sans-serif"
    lineHeight: 1.25
  base-site-title:
    fontFamily: "Verdana, sans-serif"
    fontSize: 1.5em
    lineHeight: 1.25
  sepia-body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: 1em
    lineHeight: 1.5
  sepia-site-title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.25
rounded:
  base-none: 0px
  sepia-panel: 3px
  sepia-chip: 4px
  sepia-media: 8px
  reaction-pill: 999px
spacing:
  content-width: 800px
  base-body-padding: 20px
  sepia-body-padding: 1.25rem
  base-main-padding-top: 2rem
  sepia-main-padding-top: 1.75rem
  main-padding-bottom: 1rem
  base-feed-entry-separation: 2.75rem
  small-breakpoint: 37.5rem
components:
  base-page:
    backgroundColor: "{colors.base-light-background}"
    textColor: "{colors.base-light-text}"
    typography: "{typography.base-body}"
    padding: "{spacing.base-body-padding}"
    width: "{spacing.content-width}"
  base-page-dark:
    backgroundColor: "{colors.base-dark-background}"
    textColor: "{colors.base-dark-text}"
  base-main:
    typography: "{typography.base-main}"
  base-heading:
    textColor: "{colors.base-light-heading}"
    typography: "{typography.base-heading}"
  base-heading-dark:
    textColor: "{colors.base-dark-heading}"
  base-site-title:
    typography: "{typography.base-site-title}"
  base-link:
    textColor: "{colors.primary}"
  base-link-visited:
    textColor: "{colors.base-light-visited}"
  base-link-dark:
    textColor: "{colors.base-dark-link}"
  base-link-visited-dark:
    textColor: "{colors.base-dark-visited}"
  base-code:
    backgroundColor: "{colors.base-light-code-background}"
    textColor: "{colors.base-light-code-text}"
  base-code-dark:
    backgroundColor: "{colors.base-dark-code-background}"
    textColor: "{colors.base-dark-code-text}"
  base-blockquote:
    textColor: "{colors.base-light-blockquote}"
  base-blockquote-dark:
    textColor: "{colors.base-dark-blockquote}"
  base-search:
    rounded: "{rounded.base-none}"
  sepia-page:
    backgroundColor: "{colors.sepia-background}"
    textColor: "{colors.sepia-text}"
    typography: "{typography.sepia-body}"
    padding: "{spacing.sepia-body-padding}"
    width: "{spacing.content-width}"
  sepia-heading:
    textColor: "{colors.sepia-heading}"
  sepia-site-title:
    textColor: "{colors.sepia-heading}"
    typography: "{typography.sepia-site-title}"
  sepia-link:
    textColor: "{colors.sepia-link}"
  sepia-link-visited:
    textColor: "{colors.sepia-visited}"
  sepia-link-hover:
    textColor: "{colors.sepia-link-hover}"
  sepia-code:
    backgroundColor: "{colors.sepia-code-background}"
    textColor: "{colors.sepia-code-text}"
  sepia-blockquote:
    textColor: "{colors.sepia-blockquote}"
  sepia-timeline-dot:
    backgroundColor: "{colors.sepia-accent}"
  sepia-muted-text:
    textColor: "{colors.sepia-muted}"
  sepia-surface:
    backgroundColor: "{colors.sepia-surface}"
  sepia-panel:
    rounded: "{rounded.sepia-panel}"
  sepia-tag:
    rounded: "{rounded.sepia-chip}"
  sepia-media:
    rounded: "{rounded.sepia-media}"
  reaction-paid:
    rounded: "{rounded.reaction-pill}"
---

# BroadcastChannel Design System

## Overview

BroadcastChannel ships one complete default theme, **Base**. It is a single-column, content-first BroadcastChannel design with modest type, direct links, restrained controls, and no card-based application shell. Its limited Bear CSS compatibility surface reuses Bear's palette, typography variables, `--width` content-width semantics, and selected shell hooks. The feed and content DOM, routes, and product behavior remain BroadcastChannel-specific.

Nine optional, independently implemented overrides cascade over Base without changing the content model. **Sepia** (`/themes/sepia.css`) is fixed-light warm paper; **Aria** (`/themes/aria.css`) is neutral system-sans and follows the system light/dark preference; the **Terminal** family is fixed-dark, square, and monospace, with Amber, Green, Cyan, and Magenta entry files. **HN News** (`/themes/hn-news.css`), **TG Channel** (`/themes/tg-channel.css`), and **ZAE** (`/themes/zae.css`) are fixed-light visual interpretations of a dense full-post news feed, a single-column channel message history, and a compact technical document sheet respectively. `/themes/terminal-base.css` is imported internally by the four Terminal palettes and is not a standalone theme. See [THEMES.md](./THEMES.md) for entry points and configuration.

First-party rules, including Prism, use named cascade layers. Each optional theme is a normal unlayered stylesheet supplied through the trusted `HEADER_INJECT` path. Load only one override at a time.

## Colors

The compact frontmatter tokens describe the public Bear-compatible Base palette and Sepia's fixed colors. Base exposes eight public color variables and selects the dark set with `prefers-color-scheme: dark`. Exact Aria, Terminal, HN News, TG Channel, and ZAE values remain authoritative in their CSS files rather than duplicating each palette here.

| Public variable           | Base light token             | Base dark token             | Sepia token             |
| ------------------------- | ---------------------------- | --------------------------- | ----------------------- |
| `--background-color`      | `base-light-background`      | `base-dark-background`      | `sepia-background`      |
| `--heading-color`         | `base-light-heading`         | `base-dark-heading`         | `sepia-heading`         |
| `--text-color`            | `base-light-text`            | `base-dark-text`            | `sepia-text`            |
| `--link-color`            | `primary`                    | `base-dark-link`            | `sepia-link`            |
| `--visited-color`         | `base-light-visited`         | `base-dark-visited`         | `sepia-visited`         |
| `--code-background-color` | `base-light-code-background` | `base-dark-code-background` | `sepia-code-background` |
| `--code-color`            | `base-light-code-text`       | `base-dark-code-text`       | `sepia-code-text`       |
| `--blockquote-color`      | `base-light-blockquote`      | `base-dark-blockquote`      | `sepia-blockquote`      |

Sepia also sets `--accent-color`, `--border-color`, `--link-hover-color`, `--muted-color`, and `--surface-color` from the matching `sepia-*` tokens. Base derives those roles from its public variables with `color-mix()` rather than exposing another fixed palette. Aria supplies neutral light and near-black dark sets. Terminal uses a fixed dark set with accent colors Amber `#eec35e`, Green `#62d884`, Cyan `#56d4e8`, or Magenta `#f087d2`; each entry also provides matching background, surface, muted, border, and visited colors. Syntax tokens derive from code, link, and visited colors; `--code-color` does not replace every Prism token category.

Paid reactions use separate gold semantic variables rather than the public Bear palette. Base light uses text `#6b5000`, a 38% text-color mix for the border, and a background made by mixing `#d5a000` at 14% into the page background. Base dark uses text `#f3cc65`, a 52% text-color border mix, and a 14% text-color background mix. Sepia fixes the same role to text `#6b5000`, border `rgba(107, 80, 0, 0.34)`, and background `#f3ead0`.

Bear's Base visited color, `#8b6fcb`, is an explicit compatibility exception: against both Base page backgrounds (`#fff` and `#01242e`) it falls below the WCAG AA `4.5:1` requirement for normal text. New project-owned color choices should still target AA. Third-party theme authors are responsible for the contrast of their overrides; do not infer that every documented palette has passed AA.

Tailwind v4's `@theme` block bridges public variables into internal utility tokens. In particular, `--color-code` maps to `--code-background-color`, so it means the code **background**, not code text.

Base and Aria declare `color-scheme: light dark` and follow the system preference. Sepia, HN News, TG Channel, and ZAE fix `color-scheme: light`; every Terminal palette fixes `color-scheme: dark`. CSS overrides affect the rendered page only. The manifest colors and hard-coded `theme-color` metadata remain at their Base values and do not automatically follow an override or user CSS.

## Typography

Base preserves Bear's public font semantics: body copy and Tailwind's `font-sans` bridge use `--font-secondary`, while `h1`–`h6` use `--font-main`. Both variables resolve to `Verdana, sans-serif`; `--font-scale` is `1em`. The body line height is `1.5`, main content uses `1.6`, and headings use `1.25`.

The Base site title is `1.5em`, reduced to `1.2em` at the small breakpoint. Content headings follow the restrained Tailwind scale already applied in `content/typography.css`, and post metadata is smaller than body copy. Do not introduce a separate display face or enlarge feed typography into a magazine-style hierarchy.

Sepia intentionally replaces both public font families with its system sans-serif stack. Its site title is `1.25rem` at weight `600`; Sepia is not a Verdana variant. Aria also uses a system sans-serif stack with a restrained editorial hierarchy. All Terminal palettes use the same Fira Code–first monospace stack (`'Fira Code', Monaco, Consolas, 'Ubuntu Mono', monospace`) for headings, controls, metadata, and body copy; Fira Code is loaded from Google Fonts when the network is available and falls back to the system mono faces otherwise. HN News keeps typography small and information-dense, TG Channel uses a familiar system-sans message hierarchy, and ZAE combines restrained editorial headings with technical monospace accents. None of these three themes bundles a font from its visual reference.

## Layout

`--width` is the maximum content width, not the body's outer border-box width. The centered body remains `box-sizing: border-box`; its outer maximum adds twice the internal `--body-padding-inline` to `--width`, so horizontal padding does not consume the documented content width. Base is `800px + 20px + 20px`. Sepia, Aria, and Terminal keep `--body-padding-inline` synchronized with their actual horizontal body padding (`1.25rem`, `1.5rem`, and `clamp(1rem, 4vw, 2.5rem)` respectively). HN News, TG Channel, and ZAE set that token and body inline padding to zero, then place responsive spacing on their inner regions. The header, navigation, full feed, pagination, and footer remain in one column; there is no public desktop sidebar.

Base uses `37.5rem` as both Tailwind's `sm` bridge and the explicit mobile `max-width` breakpoint. At that boundary the header becomes two columns, the avatar and title shrink, social links move below them, desktop search is hidden, and the accessible `<details>` mobile search appears. Sepia uses the same breakpoint for its feed and directory adjustments.

Base gives `#main-content` `2rem` top padding and `1rem` bottom padding. Its feed entries use a divider and `2.75rem` separation. Sepia changes only the main top padding to `1.75rem`, removes the feed divider and separation, then uses a timestamp dot and narrow vertical rail. Aria uses an `820px` width, generous whitespace, a dashed square-line grid wash, dashed details, and section dividers; Terminal uses an `864px` width, compact blocks, an accent logo rail, thick accent media frames, and subtle solid feed separators. HN News keeps every full post visible while adding a compact story-title hierarchy above its metadata and content. TG Channel presents one centered column of messages with the real channel avatar repeated for each entry; it has no profile card or secondary column. ZAE reduces the shell to a compact identity header, technical toolbar, and framed document sheet. Every theme retains the complete Telegram stream and responsive media behavior.

Cross-document CSS View Transitions are enabled with `navigation: auto`. Keep `site-title` stable for the title link and `post-{id}` stable for each post article. Motion is progressive enhancement; reduced-motion preferences collapse animation and smooth scrolling.

## Elevation & Depth

Base is flat: `--shadow-soft` is `none`, panel surfaces stay on the page background, and hierarchy comes from whitespace, text contrast, one-pixel borders or dashed rules, plus occasional 3px accent rails on expandable content and text link previews.

Sepia adds only shallow paper depth through four low-alpha shadow steps. Use it on the avatar, description, small navigation surfaces, reactions, pagination, and media. Aria and Terminal keep `--shadow-soft: none`; their hierarchy comes from grids, borders, surfaces, and spacing. HN News and ZAE rely primarily on flat color, rules, and typography; TG Channel may distinguish the light content surface from its cool page backdrop, but the post sequence must remain one coherent feed rather than a generic dashboard card grid. Do not add heavier shadows.

## Shapes

Base's panel, chip, and media radius variables are all square (`0`, represented by the normative `base-none: 0px` token). Circular avatars and selected controls such as back-to-top, expandable toggles, and modal close buttons are deliberate exceptions; paid reactions use the implemented `999px` pill. Base pagination has no border radius.

Sepia changes the same radius bridge to `3px` panels, `4px` chips, and `8px` media. Aria uses `8px` panels, `4px` chips, and `20px` media. Terminal returns all panels, chips, media, avatars, and controls to square corners. HN News stays restrained and mostly square, TG Channel uses rounded preview-style surfaces and controls, and ZAE favors crisp editorial geometry. Pagination becomes circular only in Sepia; timeline dots and circular controls use `50%` in CSS rather than a dimension token.

## Components

The public shell and landmarks are stable:

```text
body.home|post|page[.feed]
  > a.skip-link
  > header.site-header
      > a.avatar-link > img.channel-avatar
      > a.title > h1
      > div.social-links[role="group"]
      > div.channel-description.content (when configured)
      > nav.site-navigation
  > main#main-content
  > footer.site-footer
  > div#back-to-top-wrapper
```

Route classes are `/` and pagination routes → `home feed`, search results → `page feed`, post detail → `post`, and tags/links → `page`. The limited Bear-facing shell/CSS surface includes `body.home`, `body.post`, `body.page`, `header > a.title > h1`, `header > nav`, `main`, `footer`, `.tags`, and `pre.code`. It is not a strict Bear DOM superset. `.highlight` is accepted for inbound compatibility but is not synthesized. The normal syntax-highlighting path produces `pre.code > code.language-*`, and Prism may add nested `.token` spans; exceptional rendering paths guarantee only `pre.code`.

BroadcastChannel hooks include `body.feed`, `ol.posts-feed`, `.post-entry`, `.post-meta`, `.post-content`, `.post-reactions`, `.reaction-paid`, `p.tags.post-tags`, `.post-comments`, and Telegram widget selectors. `PostEntry` also exposes `.hn-story`, `.post-entry-avatar`, `.post-entry-author`, and `.tg-message-meta` for narrowly scoped theme treatments. Base hides all four by default in `feed.css`; overrides may reveal them without changing Base presentation. `.hn-story` wraps the real post title in an `h2` whenever one exists, while the avatar and author receive the real channel avatar and title from `PostsPage`; `.tg-message-meta` provides a message-style permalink time. `.tgme_widget_message_forwarded_from` is the stable forwarded-source hook: Base presents it as restrained supporting text without a card, background, or decoration, and optional themes may override that treatment.

Feed markup is an `ol.posts-feed` of complete Telegram posts, not Bear's `ul.blog-posts` title list. HN News reveals the real story-title hook but retains the complete post beneath it. TG Channel reveals the real per-entry avatar, channel title, and message time to form one message column; these hooks do not create a profile card. Tags use `p.tags.post-tags`. There are no `/blog` or `/feed` routes, post detail keeps its page heading visually hidden, and no subscribe interface is invented. Keep navigation and utility controls restrained so they support rather than compete with the feed.

Navigation, responsive search, expandable content, spoilers, image popovers, pagination, and back-to-top behavior use HTML and CSS rather than application JavaScript. Telegram comments on post detail are the sole intentional browser-script exception.

External Telegram description and post HTML must pass through `sanitizeContentHtml` before `set:html`. `HEADER_INJECT` and `FOOTER_INJECT` are separate trusted-administrator raw HTML boundaries and must never receive untrusted content.

## Do's and Don'ts

- Do preserve the single readable column, complete Telegram content, public variables, body classes, landmarks, and stable hooks when changing styles.
- Do preserve the limited Bear CSS compatibility surface while treating the feed and content DOM as BroadcastChannel-specific.
- Do keep `--body-padding-inline` synchronized with horizontal body padding so `--width` continues to mean maximum content width.
- Do keep visible `:focus-visible` outlines, the skip link, semantic navigation labels, mobile touch targets, and `prefers-reduced-motion` behavior.
- Do keep article metadata and tags out of bare `header`, `footer`, or `nav` elements so broad third-party theme rules do not capture them.
- Do treat Base as the complete default and Sepia, Aria, one Terminal palette, HN News, TG Channel, or ZAE as a single optional unlayered CSS override.
- Do preserve each theme's mode contract: Base and Aria follow the system; Sepia, HN News, TG Channel, and ZAE stay light; Terminal stays dark and monospace.
- Don't add theme state, switching JavaScript, a sidebar, invented post titles, `/blog` or `/feed` structures, or a subscribe control that the product does not provide.
- Don't blend Sepia's paper treatment, Aria's neutral grid, Terminal's terminal geometry, HN News's dense list, TG Channel's preview surface, or ZAE's technical editorial treatment into Base or one another.
- Don't expose `terminal-base.css` as a user theme or combine multiple override stylesheets.
- Don't assume CSS themes update non-CSS metadata, and don't bypass sanitization for Telegram HTML.
