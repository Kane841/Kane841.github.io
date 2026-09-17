import { describe, expect, it } from 'vitest'
import { slugFromPath } from '../utils/slug'

describe('slugFromPath', () => {
  it('uses the last path segment', () => {
    expect(slugFromPath('/articles/vue-notes')).toBe('vue-notes')
    expect(slugFromPath('content/articles/vue-notes.md')).toBe('vue-notes.md')
  })
})
