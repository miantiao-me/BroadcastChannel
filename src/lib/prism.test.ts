import { describe, expect, it } from 'vitest'
import prism, { ensurePrismLanguage } from './prism'

describe('prism language loader', () => {
  it('loads supported grammars on demand', async () => {
    await expect(ensurePrismLanguage('python')).resolves.toBe('python')
    expect(prism.languages.python).toBeTruthy()
  })

  it('falls back to text for unknown languages', async () => {
    await expect(ensurePrismLanguage('unknown-language')).resolves.toBe('text')
  })
})
