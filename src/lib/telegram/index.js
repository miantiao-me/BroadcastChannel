// Compatibility shim: re-exports everything from index.ts so that callers
// importing '../lib/telegram' resolve to the modular TypeScript implementation
// regardless of whether the bundler picks the .js or .ts file.
//
// index.ts is the authoritative implementation per AGENTS.md:
//   "Telegram fetching/parsing belongs in src/lib/telegram/**; request caching
//    uses ocache with 5 min max age, SWR enabled, and 1 hour stale max age."
//
// The legacy getChannelInfo(Astro, options) 2-arg signature is never used by
// any caller — all call sites use getChannelInfo() or getChannelInfo({...}),
// which matches index.ts's getChannelInfo(params: GetChannelInfoParams).

export { getChannelInfo, getChannelPost, isRenderablePost } from './index.ts'
