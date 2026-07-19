import type { CheerioAPI } from 'cheerio'
import type { IndexedStaticProxyOptions, MessageSelection, StaticProxyOptions } from '../types'
import { getProxiedUrl } from '../url'

export function getVideo($: CheerioAPI, message: MessageSelection, options: IndexedStaticProxyOptions): string {
  const { staticProxy = '', index = 0 } = options
  const video = message.find('.tgme_widget_message_video_wrap video')
  const videoSrc = video.attr('src')

  if (videoSrc) {
    video.attr('src', getProxiedUrl(staticProxy, videoSrc))
  }

  video
    .attr('controls', '')
    .attr('preload', index > 15 ? 'metadata' : 'auto')
    .attr('playsinline', '')
    .attr('webkit-playsinline', '')

  const roundVideo = message.find('.tgme_widget_message_roundvideo_wrap video')
  const roundVideoSrc = roundVideo.attr('src')

  if (roundVideoSrc) {
    roundVideo.attr('src', getProxiedUrl(staticProxy, roundVideoSrc))
  }

  roundVideo
    .attr('controls', '')
    .attr('preload', index > 15 ? 'metadata' : 'auto')
    .attr('playsinline', '')
    .attr('webkit-playsinline', '')

  return $.html(video) + $.html(roundVideo)
}

export function getAudio($: CheerioAPI, message: MessageSelection, options: StaticProxyOptions): string {
  const { staticProxy = '' } = options
  const audio = message.find('.tgme_widget_message_voice')
  const audioSrc = audio.attr('src')

  if (audioSrc) {
    audio.attr('src', getProxiedUrl(staticProxy, audioSrc))
  }

  audio.attr('controls', '')
  return $.html(audio)
}
