import { describe, expect, it } from 'vitest'
import type { ArticleMeta } from '../types/content'
import { articlePermalink, buildRssXml } from '../utils/rss'

const site = { name: 'Kane', description: '笔记', url: 'https://example.github.io' }

const articles: ArticleMeta[] = [
  { slug: 'new', title: '新', date: '2026-02-01', summary: '新摘要', tags: ['Vue'] },
  { slug: 'old', title: '旧', date: '2026-01-01', summary: '旧摘要', tags: ['Vue'] },
  { slug: 'hidden', title: '草稿', date: '2026-03-01', summary: '不该出现', tags: ['Vue'], draft: true },
]

describe('buildRssXml', () => {
  it('includes only published articles with absolute links, newest first', () => {
    const xml = buildRssXml(site, articles)
    expect(xml).toContain('<rss')
    expect(xml).toContain('<title>新</title>')
    expect(xml).toContain(articlePermalink(site.url, 'new'))
    expect(xml).toContain('新摘要')
    expect(xml.indexOf('新')).toBeLessThan(xml.indexOf('旧'))
    expect(xml).not.toContain('草稿')
    expect(xml).not.toContain('hidden')
  })

  it('emits a valid empty channel when there are no published articles', () => {
    const xml = buildRssXml(site, [])
    expect(xml).toContain('<channel>')
    expect(xml).not.toContain('<item>')
  })
})
