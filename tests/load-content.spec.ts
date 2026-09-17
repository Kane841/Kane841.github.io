import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadArticles, loadProjects } from '../utils/load-content'

describe('load-content missing directories', () => {
  it('returns an empty list when the markdown directory does not exist', () => {
    const missing = join('tests', '__missing__', 'no-such-content-dir')
    expect(loadArticles(missing)).toEqual([])
    expect(loadProjects(missing)).toEqual([])
  })
})
