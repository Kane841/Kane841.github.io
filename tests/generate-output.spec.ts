import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadArticles, loadProjects } from '../utils/load-content'
import { publishedArticles } from '../utils/articles'
import { siteConfig } from '../site.config'
import { articlePermalink } from '../utils/rss'

const pub = join(process.cwd(), '.output', 'public')

function pageExists(route: string): boolean {
  const trimmed = route.replace(/^\//, '')
  return existsSync(join(pub, trimmed, 'index.html')) || existsSync(join(pub, `${trimmed}.html`))
}

describe('generated output', () => {
  it('prerenders published articles and projects, not drafts', () => {
    expect(existsSync(join(pub, 'index.html')) || pageExists('')).toBe(true)
    for (const article of publishedArticles(loadArticles('content/articles'))) {
      expect(pageExists(`articles/${article.slug}`)).toBe(true)
    }
    for (const article of loadArticles('content/articles').filter(a => a.draft === true)) {
      expect(pageExists(`articles/${article.slug}`)).toBe(false)
    }
    for (const project of loadProjects('content/projects')) {
      expect(pageExists(`projects/${project.slug}`)).toBe(true)
    }
    expect(pageExists('articles/this-slug-does-not-exist')).toBe(false)
  })

  it('writes rss without drafts and with absolute links', () => {
    const xml = readFileSync(join(pub, 'rss.xml'), 'utf8')
    const published = publishedArticles(loadArticles('content/articles'))
    for (const article of published) {
      expect(xml).toContain(article.title)
      expect(xml).toContain(articlePermalink(siteConfig.url, article.slug))
      expect(xml).toContain(article.summary)
    }
    for (const article of loadArticles('content/articles').filter(a => a.draft === true)) {
      expect(xml).not.toContain(article.title)
    }
  })
})
