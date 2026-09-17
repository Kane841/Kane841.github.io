import type { ArticleMeta } from '../types/content'
import { publishedArticles } from './articles'
import { sortByDateDesc } from './projects'

export function articlePermalink(siteUrl: string, slug: string): string {
  return `${siteUrl}/articles/${slug}`
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function pubDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00.000Z`).toUTCString()
}

export function buildRssXml(
  site: { name: string; description: string; url: string },
  articles: ArticleMeta[],
): string {
  const items = sortByDateDesc(publishedArticles(articles))
    .map((article) => {
      const link = articlePermalink(site.url, article.slug)
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <pubDate>${pubDate(article.date)}</pubDate>
      <description>${escapeXml(article.summary)}</description>
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${escapeXml(site.url)}</link>
    <description>${escapeXml(site.description)}</description>
${items ? `${items}\n` : ''}  </channel>
</rss>
`
}
