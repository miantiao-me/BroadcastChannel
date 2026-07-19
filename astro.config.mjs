import process from 'node:process'
import cloudflare from '@astrojs/cloudflare'
import netlify from '@astrojs/netlify'
import node from '@astrojs/node'
import vercel from '@astrojs/vercel'
import edgeone from '@edgeone/astro'
import tailwindcss from '@tailwindcss/vite'
import astroIcon from 'astro-icon'
import { defineConfig } from 'astro/config'
import { provider } from 'std-env'

const providers = {
  vercel: vercel({
    isr: false,
    edgeMiddleware: false,
  }),
  cloudflare_workers: cloudflare(),
  netlify: netlify({
    cacheOnDemandPages: false,
    edgeMiddleware: false,
  }),
  node: node({
    mode: 'standalone',
  }),
  edgeone: edgeone(),
}

const adapterAliases = {
  cloudflare: 'cloudflare_workers',
}

const unsupportedProviders = new Set(['cloudflare-pages', 'cloudflare_pages'])

const isEdgeOne = provider === 'edgeone_pages'
  || Boolean(process.env.EDGEONE_PROJECT_ID)
  || Boolean(process.env.EO_MAKERS)

const requestedProvider = process.env.SERVER_ADAPTER || (isEdgeOne ? 'edgeone' : provider)

if (unsupportedProviders.has(requestedProvider)) {
  throw new Error('Cloudflare Pages is not supported. Use Cloudflare Workers with SERVER_ADAPTER=cloudflare_workers.')
}

const adapterProvider = adapterAliases[requestedProvider] || requestedProvider

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: providers[adapterProvider] || providers.node,
  integrations: [
    astroIcon(),
  ],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: (process.env.DOCKER || adapterProvider === 'edgeone') ? true : undefined,
    },
  },
})
