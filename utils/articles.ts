import type { ArticleMeta } from '../types/content'
import { sortByDateDesc } from './projects'

export function publishedArticles(articles: ArticleMeta[]): ArticleMeta[] {
  return articles.filter(article => article.draft !== true)
}

export function latestArticles(articles: ArticleMeta[], limit = 5): ArticleMeta[] {
  return sortByDateDesc(publishedArticles(articles)).slice(0, limit)
}

export function articlesWithTag(articles: ArticleMeta[], tag: string): ArticleMeta[] {
  return publishedArticles(articles).filter(article => article.tags.includes(tag))
}
