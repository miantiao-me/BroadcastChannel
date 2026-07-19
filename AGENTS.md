# Repository Guide for Coding Agents

## Sources

- Treat this file as the maintained repo guide. `CLAUDE.md` is a symlink to this file for Claude Code compatibility.
- No repo-local `opencode.json`, `.opencode/`, `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` is present.
- For any visible UI/design change, read `DESIGN.md` first; implementation tokens live in `src/styles/app/**` and `src/styles/content/**`.
- Theme provenance and third-party acknowledgements are maintained in `NOTICE.md`.

## Theme provenance

- Base is the default Bear-compatible theme; bundled optional overrides live under `public/themes/`.
- Every newly bundled theme must add or update its own `NOTICE.md` entry in the same change, including the upstream project URL, author or copyright holder, license and license URL, and whether the implementation is inspired by or adapted from the upstream work.
- Also update the README theme credits when a bundled theme is added or its provenance changes.
- Do not copy upstream theme code unless its license compatibility and notice requirements have been reviewed. Distinguish visual inspiration from source adaptation accurately.

## Stack and commands

- Runtime/tooling: Node `v22`, `pnpm@11.6.0`, Astro `^6.4.6` SSR, Tailwind CSS v4 via `@tailwindcss/vite`, ESLint `^10.4.1` with Antfu + Astro + formatter rules.
- Install/dev/build: `pnpm install`, `pnpm dev` or `pnpm start` (`astro dev`), `pnpm build`, `pnpm preview`.
- Local checks: `pnpm lint`, `pnpm typecheck`, and `pnpm test`; use `pnpm lint:fix` for auto-fix, `pnpm eslint <path>` for focused lint, and `pnpm vitest run <test-file>` for a focused test.
- `postinstall` installs `simple-git-hooks` when `.git` exists; pre-commit runs `lint-staged` with `eslint --fix`.
- CI does not validate app behavior: `docker.yml` only builds/pushes the GHCR image, and `sync.yml` only syncs forks from upstream.

## Validation shortcuts

- Small code change: `pnpm eslint <changed-file>`, `pnpm typecheck`, and `pnpm test`; run `pnpm lint` if scope widened.
- UI or route change: `pnpm lint`, `pnpm build`, then preview/manual check.
- Feed/SEO/sitemap changes: manually verify `/rss.xml`, `/rss.json`, `/sitemap.xml`, and relevant canonical/meta output in preview.
- Telegram parsing or proxy changes: verify home, one `/posts/[id]` page, RSS output, and a `/static/...` asset path.
- Build config or adapter changes must finish with `pnpm build`.

## Architecture notes

- `src/pages/` contains Astro pages and API-style routes; `src/pages/index.astro` is intentionally thin and calls `getChannelInfo()`.
- `src/layouts/BaseLayout.astro` wires global CSS, `astro-seo`, the site header/navigation, RSS links, `HEADER_INJECT`, and `FOOTER_INJECT`.
- `src/middleware.ts` sets `SITE_URL`/`RSS_URL` locals, handles legacy `#tag` search rewrites, and adds speculation/cache headers.
- Telegram fetching/parsing belongs in `src/lib/telegram/**`; request caching uses `ocache` with 5 min max age, SWR enabled, and 1 hour stale max age.
- Shared env helpers are in `src/lib/env.ts`; runtime `process.env` wins over build-time `import.meta.env`, and they do not read `Astro.locals.runtime.env`.
- Static proxy logic is shared in `src/lib/static-proxy.ts`; both Astro route `src/pages/static/[...url].ts` and Vercel Edge Function `api/static/index.ts` use it, with `/static/:path*` rewritten by `vercel.json`.
- Do not broaden the static proxy target whitelist unless the task explicitly changes the security model.
- Keep shared domain interfaces in `src/types.ts`; there are no TS path aliases, so use relative imports.

## Env and deployment gotchas

- `CHANNEL` is required server-side; missing it throws during Telegram fetch.
- `TELEGRAM_HOST` defaults in code to `telegram.me`; `.env.example` uses `telegram.dog` as an override example.
- `STATIC_PROXY` defaults to `/static/` only when unset; set it to an empty string for direct Telegram asset URLs.
- `astro.config.mjs` selects adapters for Vercel, Cloudflare Workers, Netlify, Node standalone, and EdgeOne; `SERVER_ADAPTER` overrides auto-detection, and Cloudflare Pages is explicitly rejected.
- EdgeOne is detected from std-env's `edgeone_pages` provider or platform-provided `EDGEONE_PROJECT_ID`/`EO_MAKERS`; `DOCKER=true` changes Vite SSR `noExternal` behavior.
- If env behavior changes, update `.env.example` and README docs together.

## Code and content conventions

- Server-rendered HTML is the default; keep browser JS near zero. Telegram comments are the deliberate exception.
- API-style routes must return `Response`/`Response.json`, not Express-like objects.
- Follow ESLint formatting: 2 spaces, LF, UTF-8, single quotes, usually no semicolons; let `pnpm lint:fix` settle import order.
- Preserve local naming: Astro components and layouts use `PascalCase.astro`; pages follow Astro route syntax.
- External Telegram HTML must be sanitized via `src/lib/sanitize.ts` before `set:html`; config injections in `BaseLayout.astro` are the only intentional raw HTML path.
- Design changes should preserve the content-first Base contract from `DESIGN.md`; Sepia is an optional warm-paper override, not the default. Avoid card-heavy redesigns unless explicitly requested.

## Cloned Dependency Source

Read-only dependency source repositories are available under
`.slim/clonedeps/repos/` for inspection. Do not edit these clones.

- `.slim/clonedeps/repos/HermanMartinus__bearblog/` - `HermanMartinus/bearblog` at `a6cf650886d11461dd1839d02020ca0aee0fee67`; reference for the visitor DOM and default Bear theme contract.
- `.slim/clonedeps/repos/panr__hugo-theme-terminal/` - `panr/hugo-theme-terminal` at `4acd067c48195ac503541ba75f9259c7158d3792`; reference for Terminal CSS and template structure.
- `.slim/clonedeps/repos/miantiao-me__astro-aria/` - `miantiao-me/astro-aria` at `15c6eb8143ac55f9ba8d925b43f973ceef046980`; reference for Aria styling and Astro component composition.
