# Repository Guidelines for Coding Agents

## 1. Scope

- This repository is an Astro 5 SSR site that turns Telegram channels into a microblog.
- Use this file as the main repo-specific guide for coding agents working in this project.
- Prefer small, surgical changes that match the existing code style and structure.
- Assume server-rendered HTML is the default; client-side JavaScript is intentionally minimal.

## 2. Instruction Sources

- Root `AGENTS.md` is the maintained agent guide for this repository.
- No `.cursor/rules/**`, `.cursorrules`, or `.github/copilot-instructions.md` files were found.
- If Cursor or Copilot rules are added later, merge them into this file.
- `CLAUDE.md` is an older short copy; prefer this file when they disagree.

## 3. Project Snapshot

- Package manager: `pnpm` only.
- Preferred Node version: `v22`.
- Framework: `astro@5`.
- Lint stack: `eslint@9` + `@antfu/eslint-config` + `eslint-plugin-astro` + `eslint-plugin-format`.
- Styling: Tailwind CSS v4 via `@tailwindcss/vite`.

## 4. Repository Map

- `src/pages/`: Astro pages and API-style route handlers.
- `src/components/`: reusable UI pieces and page fragments.
- `src/layouts/`: page shells like `base.astro`.
- `src/lib/`: Telegram fetching, parsing, env access, proxying, and shared logic.
- `src/types.ts`: shared domain interfaces.
- `dist/`, `.astro/`, and `node_modules/`: generated output; do not hand-edit.

## 5. Core Commands

```bash
pnpm install
pnpm dev
pnpm start
pnpm build
pnpm preview
pnpm lint:fix
```

- `pnpm eslint <path>` is the supported focused lint command.
- Use `pnpm astro ...` only when a task specifically needs extra Astro CLI behavior.

## 6. Testing Reality

- There is currently **no automated test runner** in this repo.
- There is no `pnpm test` script.
- No Vitest, Jest, Playwright, or Cypress config files are present.
- No `*.test.*` or `*.spec.*` files are present.

### Single-test guidance

- There is currently **no supported "run a single test" command**.
- If asked to run a single test, say so explicitly instead of inventing a command.
- Use `pnpm eslint <path>` for a narrow static check.
- Use `pnpm build && pnpm preview` plus manual route verification for behavior checks.

## 7. Recommended Validation

- Small refactor or one-file logic change: `pnpm eslint <file>` then `pnpm lint`.
- UI or route change: `pnpm lint`, then `pnpm build`, then `pnpm preview`.
- Feed, metadata, or sitemap change: verify `/rss.xml`, `/rss.json`, and `/sitemap.xml` manually in preview.
- Telegram parsing or proxy change: validate home, one post page, RSS output, and the relevant `/static/...` path.
- Env/config change: update docs and validate behavior with representative env values.

## 8. Formatting Rules

- Follow ESLint as the formatting source of truth; do not fight the auto-fixer.
- Indentation: 2 spaces.
- Line endings: LF.
- Charset: UTF-8.
- Quotes: single quotes.
- Semicolons are typically omitted.
- Trailing commas should follow linter/formatter output.
- Do not do unrelated whitespace churn.

## 9. Imports

- Use `import type` for type-only imports.
- Keep side-effect imports explicit, e.g. CSS, locale packs, and Prism language loaders.
- No path aliases are configured in `tsconfig.json`; use relative imports.
- Let ESLint decide final import ordering; run `pnpm lint:fix` after adding or moving imports.
- Avoid unused imports.

## 10. Naming Conventions

- Keep route filenames aligned with Astro routing: `index.astro`, `[id].astro`, `[...url].ts`, `rss.xml.ts`, etc.
- Reusable new Astro components should prefer `PascalCase.astro`.
- Preserve neighboring conventions when editing older lowercase Astro files like `header.astro`, `item.astro`, or `base.astro`.
- New helper modules should use descriptive kebab-case names when that matches existing utilities.
- Environment variables use uppercase snake case.
- Shared interfaces and types use PascalCase names.

## 11. Types

- Prefer explicit interfaces for shared domain shapes in `src/types.ts`.
- Keep shared type definitions centralized instead of re-declaring them across files.
- Prefer narrow unions when the allowed values are known, e.g. `'text' | 'service'`.
- Avoid `any`; use `unknown`, proper interfaces, or generics.
- Type exported handlers and helpers when practical, e.g. `APIRoute`, explicit return types, or typed props.
- In Astro files, keep prop shapes obvious near the top of frontmatter.

## 12. Astro and UI Patterns

- Keep page frontmatter focused on loading data and preparing view state.
- Push reusable logic into `src/lib/` instead of repeating it inside pages.
- Use `Astro.locals` for request-scoped values set by middleware.
- API-style routes in `src/pages/*.ts` should return `Response` / `Response.json`, not Express-like objects.
- Prefer semantic HTML and accessible labels.
- Keep browser-side JS near zero; the current deliberate exception is the Telegram comments widget.
- Do not add `client:*` directives or inline scripts unless the feature genuinely requires them.
- Tailwind utility classes are used heavily in `.astro` files.
- For long class strings, follow the existing pattern of extracting them into constants above the markup.
- Reuse existing visual tokens and accessible structures instead of inventing near-duplicates.

## 13. Error Handling

- Fail fast for required server-side configuration, e.g. throw when mandatory env values are missing.
- In request handlers, catch unknown errors only when you can convert them into an explicit HTTP response.
- When catching, narrow with `instanceof Error` before reading `.message`.
- Do not silently swallow fetch or parsing failures.
- Keep error messages actionable and specific.

## 14. External Fetching, Parsing, and HTML Safety

- Telegram fetching and parsing live in `src/lib/telegram/index.ts`; keep new scraping logic there.
- Preserve the static proxy whitelist behavior in `src/lib/static-proxy.ts` unless the task explicitly changes the security model.
- When proxying or forwarding requests, be careful with headers and target validation.
- `set:html` is already used in a few places; only feed it sanitized or internally generated HTML.
- If introducing new HTML transformations for feeds or pages, sanitize external content first.
- Avoid mutating cached data objects in-place when extending cached flows.

## 15. Env and Config Notes

- Never commit real secrets or tokens.
- Update `.env.example` when introducing, removing, or renaming env variables.
- Update README docs when env behavior changes.
- Prefer actual code usage over stale README text if they conflict.
- Important current code-level env names include `CHANNEL`, `LOCALE`, `TIMEZONE`, `TELEGRAM_HOST`, `STATIC_PROXY`, `COMMENTS`, `REACTIONS`, `NOINDEX`, `NOFOLLOW`, `RSS_BEAUTIFY`, `TAGS`, `LINKS`, `NAVS`, `HEADER_INJECT`, and `FOOTER_INJECT`.
- Note that `PODCASRT` is the current code-level env key in `header.astro`; keep compatibility in mind unless intentionally correcting it everywhere.

## 16. Build and Deployment Notes

- `astro.config.mjs` selects adapters for Vercel, Cloudflare Pages, Netlify, Node, and EdgeOne.
- The app is configured with `output: 'server'`.
- Do not change adapter logic casually; deployment behavior depends on environment detection.
- If you touch build configuration, run `pnpm build` before finishing.

## 17. Working Style

- Inspect nearby files before editing to match local conventions.
- Prefer updating existing patterns over introducing new abstractions.
- Keep comments sparse and explain why, not what.
- If a task would benefit from automated tests, note that the repo currently lacks a test harness instead of pretending one exists.
- If you add a real test runner in the future, update `package.json`, this file, and the single-test instructions together.
