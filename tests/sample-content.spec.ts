import { describe, expect, it } from 'vitest'
import { publishedArticles, latestArticles } from '../utils/articles'
import { loadAbout, loadArticles, loadProjects } from '../utils/load-content'
import { featuredProjects } from '../utils/projects'
import { assertValidContent } from '../utils/validate-content'
import { navItems } from '../utils/nav'

describe('sample content', () => {
  it('meets the v1 fixture contract', () => {
    expect(() => assertValidContent(process.cwd())).not.toThrow()
    const articles = loadArticles('content/articles')
    const projects = loadProjects('content/projects')
    expect(articles.length).toBeGreaterThanOrEqual(2)
    expect(articles.some(a => a.draft === true)).toBe(true)
    expect(publishedArticles(articles).length).toBeGreaterThanOrEqual(1)
    expect(latestArticles(articles).length).toBeLessThanOrEqual(5)
    expect(projects.length).toBeGreaterThanOrEqual(2)
    expect(featuredProjects(projects).length).toBeGreaterThanOrEqual(1)
    const about = loadAbout('content/about.md')
    expect(about.skills.length).toBeGreaterThan(0)
    expect(about.socials.length).toBeGreaterThan(0)
  })
})

describe('navItems', () => {
  it('is exactly home, articles, projects, about', () => {
    expect(navItems).toEqual([
      { label: '首页', to: '/' },
      { label: '文章', to: '/articles' },
      { label: '项目', to: '/projects' },
      { label: '关于我', to: '/about' },
    ])
  })
})
