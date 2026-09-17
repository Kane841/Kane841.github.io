import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import type { AboutMeta, ArticleMeta, ProjectMeta, SocialLink } from '../types/content'
import { slugFromPath } from './slug'

function mdFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter(name => name.endsWith('.md'))
    .map(name => join(dir, name))
}

function slugFromFile(file: string): string {
  return slugFromPath(file).replace(/\.md$/i, '')
}

function frontmatterDate(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  return value as string
}

export function loadArticles(dir: string): ArticleMeta[] {
  return mdFiles(dir).map((file) => {
    const { data } = matter(readFileSync(file, 'utf8'))
    return {
      slug: slugFromFile(file),
      title: data.title,
      date: frontmatterDate(data.date) as string,
      summary: data.summary,
      tags: data.tags,
      draft: data.draft,
    }
  })
}

export function loadProjects(dir: string): ProjectMeta[] {
  return mdFiles(dir).map((file) => {
    const { data } = matter(readFileSync(file, 'utf8'))
    return {
      slug: slugFromFile(file),
      title: data.title,
      summary: data.summary,
      tags: data.tags,
      featured: data.featured,
      repo: data.repo,
      demo: data.demo,
      date: frontmatterDate(data.date),
    }
  })
}

export function loadAbout(file: string): AboutMeta {
  const { data } = matter(readFileSync(file, 'utf8'))
  return {
    skills: data.skills,
    socials: (data.socials ?? []) as SocialLink[],
  }
}
