import { describe, expect, it } from 'vitest'
import type { ProjectMeta } from '../types/content'
import { featuredProjects } from '../utils/projects'

function project(partial: Partial<ProjectMeta> & Pick<ProjectMeta, 'slug'>): ProjectMeta {
  return {
    title: partial.title ?? partial.slug,
    summary: 's',
    tags: ['Vue'],
    ...partial,
  }
}

describe('featuredProjects', () => {
  it('keeps only featured true, newest date first, no date last but stable', () => {
    const result = featuredProjects([
      project({ slug: 'old', featured: true, date: '2025-01-01' }),
      project({ slug: 'skip', featured: false }),
      project({ slug: 'none' }),
      project({ slug: 'new', featured: true, date: '2026-01-01' }),
      project({ slug: 'undated', featured: true }),
    ])
    expect(result.map(p => p.slug)).toEqual(['new', 'old', 'undated'])
  })

  it('returns empty when none featured', () => {
    expect(featuredProjects([project({ slug: 'x' })])).toEqual([])
  })
})
