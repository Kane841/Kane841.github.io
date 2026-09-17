import { describe, expect, it } from 'vitest'
import type { ArticleMeta } from '../types/content'
import { articlesWithTag, latestArticles, publishedArticles } from '../utils/articles'

function article(partial: Partial<ArticleMeta> & Pick<ArticleMeta, 'slug' | 'date'>): ArticleMeta {
  return {
    title: partial.title ?? partial.slug,
    summary: 's',
    tags: partial.tags ?? ['Vue'],
    ...partial,
  }
}

describe('publishedArticles', () => {
  it('drops draft true and keeps missing or false draft', () => {
    const result = publishedArticles([
      article({ slug: 'a', date: '2026-01-01', draft: true }),
      article({ slug: 'b', date: '2026-01-02' }),
      article({ slug: 'c', date: '2026-01-03', draft: false }),
    ])
    expect(result.map(a => a.slug)).toEqual(['b', 'c'])
  })
})

describe('latestArticles', () => {
  it('returns at most 5 published articles by date descending', () => {
    const items = [1, 2, 3, 4, 5, 6].map(n =>
      article({ slug: `p${n}`, date: `2026-01-0${n}` }),
    )
    items.push(article({ slug: 'draft', date: '2026-12-31', draft: true }))
    expect(latestArticles(items).map(a => a.slug)).toEqual(['p6', 'p5', 'p4', 'p3', 'p2'])
  })

  it('returns all when fewer than 5, and empty when none', () => {
    expect(latestArticles([article({ slug: 'a', date: '2026-01-01' })]).map(a => a.slug)).toEqual(['a'])
    expect(latestArticles([])).toEqual([])
  })
})

describe('articlesWithTag', () => {
  it('matches tags exactly and ignores drafts', () => {
    const items = [
      article({ slug: 'a', date: '2026-01-02', tags: ['Vue'] }),
      article({ slug: 'b', date: '2026-01-01', tags: ['vue'] }),
      article({ slug: 'd', date: '2026-01-03', tags: ['Vue'], draft: true }),
    ]
    expect(articlesWithTag(items, 'Vue').map(a => a.slug)).toEqual(['a'])
  })
})
