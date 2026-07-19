import type { Post } from '../../types'
import { describe, expect, it } from 'vitest'
import { isRenderablePost } from './index'

function createPost(overrides: Partial<Post> = {}): Post {
  return {
    id: '123',
    title: 'Title',
    type: 'text',
    datetime: '2026-01-02T03:04:05.000Z',
    tags: [],
    text: 'Text',
    content: '<p>Text</p>',
    reactions: [],
    ...overrides,
  }
}

describe('post renderability', () => {
  it('accepts text posts with an id and content', () => {
    expect(isRenderablePost(createPost())).toBe(true)
  })

  it('rejects posts without an id', () => {
    expect(isRenderablePost(createPost({ id: '' }))).toBe(false)
  })

  it('rejects posts without content', () => {
    expect(isRenderablePost(createPost({ content: '' }))).toBe(false)
  })

  it('rejects service posts', () => {
    expect(isRenderablePost(createPost({ type: 'service' }))).toBe(false)
  })

  it('rejects nullish posts', () => {
    expect(isRenderablePost(null)).toBe(false)
    expect(isRenderablePost(undefined)).toBe(false)
  })
})
