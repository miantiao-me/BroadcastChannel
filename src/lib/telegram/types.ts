import type { AnyNode, Cheerio, CheerioAPI } from 'cheerio'

export type MessageSelection = Cheerio<AnyNode>

export interface StaticProxyOptions {
  staticProxy?: string
}

export interface IndexedStaticProxyOptions extends StaticProxyOptions {
  index?: number
}

export interface ReplyOptions {
  channel: string
}

export interface MessageAssetOptions extends IndexedStaticProxyOptions {
  id?: string
  title?: string
}

export interface ExtractPostOptions {
  channel: string
  telegramHost: string
  staticProxy: string
  index?: number
  reactionsEnabled?: boolean
}

export interface LoadedChannelDocument {
  $: CheerioAPI
  channel: string
  telegramHost: string
  staticProxy: string
  reactionsEnabled?: boolean
}
