import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { isIsoDate } from './date'
import { loadAbout, loadArticles, loadProjects } from './load-content'

function fail(message: string): never {
  throw new Error(message)
}

export function assertValidContent(rootDir: string): void {
  const contentDir = join(rootDir, 'content')
  const articleDir = join(contentDir, 'articles')
  const projectDir = join(contentDir, 'projects')
  const aboutFile = join(contentDir, 'about.md')

  if (existsSync(articleDir)) {
    for (const article of loadArticles(articleDir)) {
      if (!article.title || !article.summary || !Array.isArray(article.tags)) {
        fail(`Invalid article ${article.slug}.md: title, summary, and tags are required`)
      }
      if (!isIsoDate(article.date)) {
        fail(`Invalid article ${article.slug}.md: date must be YYYY-MM-DD`)
      }
    }
  }

  if (existsSync(projectDir)) {
    for (const project of loadProjects(projectDir)) {
      if (!project.title || !project.summary || !Array.isArray(project.tags)) {
        fail(`Invalid project ${project.slug}.md: title, summary, and tags are required`)
      }
      if (project.date !== undefined && !isIsoDate(project.date)) {
        fail(`Invalid project ${project.slug}.md: date must be YYYY-MM-DD`)
      }
    }
  }

  if (!existsSync(aboutFile)) {
    fail('Missing content/about.md')
  }
  const about = loadAbout(aboutFile)
  if (!Array.isArray(about.skills) || !Array.isArray(about.socials)) {
    fail('Invalid about.md: skills and socials are required')
  }
}
