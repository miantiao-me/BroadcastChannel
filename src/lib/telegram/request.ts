import type { GetChannelInfoParams } from '../../types'
import type { LoadedChannelDocument } from './types'
import * as cheerio from 'cheerio'
import { defineCachedFunction } from 'ocache'
import { $fetch } from 'ofetch'
import { getBooleanEnv, getEnv, getStaticProxy, getTelegramHost } from '../env'

interface TelegramHtmlParams {
  host: string
  channel: string
  id?: string
  before?: string
  after?: string
  q?: string
  headers: Record<string, string>
}

function getRequiredEnv(name: string): string {
  const value = getEnv(import.meta.env, name)
  if (!value) {
    throw new Error(`Missing required env: ${name}`)
  }
  return value
}

export function getTelegramRequestHeaders(): Record<string, string> {
  return {
    'accept': 'text/html,application/xhtml+xml',
    'user-agent': 'BroadcastChannel/0.2.0',
  }
}

async function fetchTelegramHtml({ host, channel, id, before, after, q, headers }: TelegramHtmlParams): Promise<string> {
  const requestUrl = id
    ? `https://${host}/${channel}/${id}?embed=1&mode=tme`
    : `https://${host}/s/${channel}`

  return await $fetch<string, 'text'>(requestUrl, {
    headers,
    query: {
      before: before || undefined,
      after: after || undefined,
      q: q || undefined,
    },
    responseType: 'text',
    timeout: 15000,
    retry: 3,
    retryDelay: 100,
  })
}

const loadTelegramHtml = defineCachedFunction(fetchTelegramHtml, {
  name: 'telegram-html',
  maxAge: 60 * 5,
  // A detached refresh has no Cloudflare waitUntil context and can leave a stuck pending promise.
  swr: false,
  getKey: ({ host, channel, id, before, after, q }) => JSON.stringify({
    host,
    channel,
    id: id || '',
    before: before || '',
    after: after || '',
    q: q || '',
  }),
})

export async function loadChannelDocument(
  params: GetChannelInfoParams & { id?: string } = {},
): Promise<LoadedChannelDocument> {
  const { before, after, q, id } = params
  const host = getTelegramHost(import.meta.env)
  const channel = getRequiredEnv('CHANNEL')
  const staticProxy = getStaticProxy(import.meta.env)
  const reactionsEnabled = getBooleanEnv(import.meta.env, 'REACTIONS')
  const html = await loadTelegramHtml({
    host,
    channel,
    id,
    before,
    after,
    q,
    headers: getTelegramRequestHeaders(),
  })

  return {
    $: cheerio.load(html, {}, false),
    channel,
    telegramHost: host,
    staticProxy,
    reactionsEnabled,
  }
}
