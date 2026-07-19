import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getBooleanEnv,
  getEnv,
  getStaticProxy,
  getTargetWhitelist,
  getTelegramHost,
  parseCsvList,
  parseDelimitedItems,
} from './env'

describe('getEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('prefers process.env over import.meta.env', () => {
    vi.stubEnv('TEST_ENV_PRIORITY', 'process-value')

    expect(
      getEnv(
        { TEST_ENV_PRIORITY: 'import-value' },
        'TEST_ENV_PRIORITY',
      ),
    ).toBe('process-value')
  })

  it('prefers an empty process env value over import.meta.env', () => {
    vi.stubEnv('TEST_ENV_PRIORITY', '')

    expect(
      getEnv(
        { TEST_ENV_PRIORITY: 'import-value' },
        'TEST_ENV_PRIORITY',
      ),
    ).toBe('')
  })

  it('falls back to import.meta.env when process env is missing', () => {
    expect(
      getEnv(
        { TEST_ENV_PRIORITY: 'import-value' },
        'TEST_ENV_PRIORITY',
      ),
    ).toBe('import-value')
  })
})

describe('getStaticProxy', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('defaults to /static/ when unset', () => {
    vi.stubEnv('STATIC_PROXY', undefined)

    expect(getStaticProxy({})).toBe('/static/')
  })

  it('preserves an explicitly empty value', () => {
    vi.stubEnv('STATIC_PROXY', '')

    expect(getStaticProxy({})).toBe('')
  })
})

describe('getBooleanEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it.each([
    ['true', true],
    ['1', true],
    ['false', false],
    ['0', false],
    ['', false],
  ])('parses %j as %s', (value, expected) => {
    vi.stubEnv('TEST_BOOLEAN_ENV', value)

    expect(getBooleanEnv({}, 'TEST_BOOLEAN_ENV')).toBe(expected)
  })

  it('returns undefined when unset', () => {
    vi.stubEnv('TEST_BOOLEAN_ENV', undefined)

    expect(getBooleanEnv({}, 'TEST_BOOLEAN_ENV')).toBeUndefined()
  })
})

describe('getTelegramHost', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('defaults to telegram.me', () => {
    vi.stubEnv('TELEGRAM_HOST', undefined)

    expect(getTelegramHost({})).toBe('telegram.me')
  })

  it('uses the configured host', () => {
    vi.stubEnv('TELEGRAM_HOST', 'telegram.dog')

    expect(getTelegramHost({})).toBe('telegram.dog')
  })
})

describe('getTargetWhitelist', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns no additions when unset', () => {
    vi.stubEnv('TARGET_WHITELIST', undefined)

    expect(getTargetWhitelist({})).toEqual([])
  })

  it('returns no additions when the environment object is unavailable', () => {
    vi.stubEnv('TARGET_WHITELIST', undefined)

    expect(() => getTargetWhitelist(undefined)).not.toThrow()
    expect(getTargetWhitelist(undefined)).toEqual([])
  })

  it('prefers the runtime value and normalizes hostnames', () => {
    vi.stubEnv('TARGET_WHITELIST', ' A.com, b.COM, a.com, sub.Example.com ')

    expect(getTargetWhitelist({ TARGET_WHITELIST: 'build.example' })).toEqual([
      'a.com',
      'b.com',
      'sub.example.com',
    ])
  })

  it('ignores values that are not DNS hostnames', () => {
    vi.stubEnv(
      'TARGET_WHITELIST',
      'https://a.com,a.com:443,a.com/path,a.com?x=1,a.com#x,*.a.com,127.0.0.1,::1,localhost',
    )

    expect(getTargetWhitelist({})).toEqual([])
  })
})

describe('env parsing helpers', () => {
  it('parses semicolon-delimited nav items and ignores empty entries', () => {
    expect(parseDelimitedItems('Home,/; ; Blog,/blog; Invalid; About,/about')).toEqual([
      { title: 'Home', href: '/' },
      { title: 'Blog', href: '/blog' },
      { title: 'About', href: '/about' },
    ])
  })

  it('parses comma-delimited lists and ignores empty entries', () => {
    expect(parseCsvList('alpha, , beta,, gamma ')).toEqual(['alpha', 'beta', 'gamma'])
  })
})
