import { siteConfig } from '../../site.config'
import { loadArticles } from '../../utils/load-content'
import { buildRssXml } from '../../utils/rss'

export default defineEventHandler((event) => {
  const xml = buildRssXml(siteConfig, loadArticles('content/articles'))
  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  return xml
})
