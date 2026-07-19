import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatPostTime, paidReactionClass } from './post-ui'

describe('post UI helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2020-01-10T03:04:05.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats recent post time as relative time', () => {
    expect(formatPostTime('2020-01-10T02:04:05.000Z', 'UTC', 'en')).toBe('1 hour ago')
  })

  it('formats older post time with timezone-aware absolute parts', () => {
    expect(formatPostTime('2020-01-02T03:04:05.000Z', 'America/New_York', 'en')).toBe('22:04 · Jan 1, 2020 · Wed')
  })

  it('falls back to english for invalid locales', () => {
    expect(formatPostTime('2020-01-02T03:04:05.000Z', 'UTC', 'unknown-locale')).toBe('03:04 · Jan 2, 2020 · Thu')
  })

  it('exposes a stable semantic class for paid reactions', () => {
    expect(paidReactionClass).toBe('reaction-paid')
  })
})
