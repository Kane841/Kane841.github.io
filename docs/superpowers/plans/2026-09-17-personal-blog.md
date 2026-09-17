# 个人博客第一版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 做出可静态导出到 GitHub Pages 的个人博客：Markdown 写作、文章/项目/关于我/RSS，深色青紫 Aurora 壳层。

**Architecture:** 无后端。`content/` 为唯一内容源；`utils/` 里的纯函数负责校验、过滤、排序、RSS，供构建钩子、RSS 路由和测试使用；Nuxt 页面用 Nuxt Content 取 Markdown 并渲染。GitHub Actions 跑测试与 `nuxt generate`，失败不发布。

**Tech Stack:** Nuxt 3、@nuxt/content 2、@nuxtjs/tailwindcss（Tailwind 3）、@nuxtjs/google-fonts、lucide-vue-next、gray-matter、Vitest、GitHub Pages。

## Global Constraints

- 技术选型：Nuxt 3 + Nuxt Content；构建命令为 `nuxt generate`；发布到 GitHub Pages；无后端、无数据库、无登录。
- 站点内路由以应用根为 `/`：`/`、`/articles`、`/articles/:slug`、`/tags/:tag`、`/projects`、`/projects/:slug`、`/about`、`/rss.xml`。简历为 `/resume.pdf` 文件，不是页面。
- 若仓库是项目站（`username.github.io/repo`），用环境变量 `NUXT_APP_BASE_URL`（含前后斜杠，如 `/Personal_Blog/`）；默认 `/`。
- `site.config.ts` 仅三字段：`name`、`description`、`url`（canonical 根 URL，无尾斜杠）。
- 文章 frontmatter 必填：`title`、`date`、`summary`、`tags`；可选 `draft`（`true` 不发布，默认 `false`）。`date` 必须是 `YYYY-MM-DD`。
- 项目 frontmatter 必填：`title`、`summary`、`tags`；可选 `featured`、`repo`、`demo`、`date`。项目无 `draft`。
- 关于我 frontmatter 必填：`skills`（字符串数组）、`socials`（`{ name, url }[]`）。
- `draft: true` 的文章不进入列表、详情、标签页、RSS；其 slug 为 404。未知标签页可访问、列表为空、不 404。
- 首页：非 draft 文章按 `date` 倒序最多 5 篇；项目仅为 `featured: true`，按 `date` 倒序（无日期则排序稳定）。
- RSS 只含非 draft 文章：标题、绝对链接、日期、摘要；无文章时仍是合法空 feed。
- 第一版示例内容：至少 2 篇文章（1 篇 `draft: true`）、2 个项目（1 个 `featured: true`）、完整 `about.md`。简历可选。
- 外观：只深色；画布 `#0B1020`、主色 `#7C3AED`、辅色 `#22D3EE`、卡片 `#12182A`；极光不穿过正文；Outfit + Inter + Noto Sans SC + JetBrains Mono；Lucide SVG；无搜索、无主题切换、无浅色模式。
- 空态文案固定：「还没有文章。」「还没有精选项目。」「还没有内容。」「没有带这个标签的文章。」「没有这个页面。」
- 功能测试只测功能，不测外观。改页面不得改 frontmatter 或 `content/` 约定。
- 规格：`docs/superpowers/specs/2026-09-17-personal-blog-design.md` 与 `docs/superpowers/specs/2026-09-17-personal-blog-ui-design.md`。仓库已有 `docs/` 与 `.cursor/rules/`，脚手架不得删除它们。

---

## File Structure

| 路径 | 职责 |
|---|---|
| `site.config.ts` | 站点名、简介、canonical URL |
| `nuxt.config.ts` | 模块、静态生成、baseURL、构建期内容校验、`hasResume` |
| `tailwind.config.ts` | 语义色与字体 token |
| `assets/css/main.css` | 极光背景动画、prose、焦点环、reduced-motion |
| `types/content.ts` | ArticleMeta / ProjectMeta / AboutMeta |
| `utils/date.ts` | `YYYY-MM-DD` 校验 |
| `utils/articles.ts` | 过滤 draft、按日期排序、最新 N 篇、按标签 |
| `utils/projects.ts` | 精选过滤与排序 |
| `utils/rss.ts` | 由站点配置 + 文章元数据生成 RSS XML |
| `utils/resume.ts` | 探测 `public/resume.pdf` |
| `utils/load-content.ts` | 用 gray-matter 读 `content/`（校验与 RSS，不渲染正文） |
| `utils/validate-content.ts` | 缺字段或坏日期则抛错 |
| `utils/nav.ts` | 四项导航常量 |
| `utils/slug.ts` | 从 `_path` 或文件名取 slug |
| `server/routes/rss.xml.ts` | 预渲染 `/rss.xml` |
| `layouts/default.vue` | 跳过链接、顶栏、极光、`<main>`、页脚 |
| `components/*.vue` | 壳层与卡片等展示组件 |
| `pages/*.vue` | 路由页面，只 queryContent + 调用 utils |
| `error.vue` | 404 |
| `content/` | 示例 Markdown |
| `tests/` | Vitest：utils + 对真实 `content/` 的契约 + generate 产物 |
| `.github/workflows/deploy.yml` | 测试 → generate → Pages |

页面不实现过滤逻辑副本；一律调用 `utils/`。

---

### Task 1: 脚手架、site.config、Vitest

**Files:**
- Create: `package.json`
- Create: `nuxt.config.ts`
- Create: `site.config.ts`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `vitest.config.ts`
- Create: `tests/site-config.spec.ts`
- Test: `tests/site-config.spec.ts`

**Interfaces:**
- Consumes: 无
- Produces: `export const siteConfig: { name: string; description: string; url: string }`（`url` 无尾斜杠）

- [ ] **Step 1: Write the failing test**

```ts
// tests/site-config.spec.ts
import { describe, expect, it } from 'vitest'
import { siteConfig } from '../site.config'

describe('siteConfig', () => {
  it('exposes name, description, and a canonical url without trailing slash', () => {
    expect(siteConfig.name.length).toBeGreaterThan(0)
    expect(siteConfig.description.length).toBeGreaterThan(0)
    expect(siteConfig.url).toMatch(/^https?:\/\/.+/)
    expect(siteConfig.url.endsWith('/')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/site-config.spec.ts`

Expected: FAIL（还没有 `site.config.ts` / vitest）

- [ ] **Step 3: Write minimal implementation**

`package.json`：

```json
{
  "name": "personal-blog",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "test": "vitest run",
    "postinstall": "nuxt prepare"
  }
}
```

安装：

```bash
npm install nuxt@3 @nuxt/content@2
npm install -D vitest typescript
```

`site.config.ts`：

```ts
export const siteConfig = {
  name: 'Kane',
  description: '技术笔记与项目',
  url: 'https://example.github.io',
}
```

`vitest.config.ts`：

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
  },
})
```

`tsconfig.json`：

```json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

`.gitignore`：

```
node_modules
.nuxt
.output
dist
*.log
.DS_Store
```

`nuxt.config.ts`（本任务只保证能 `nuxt prepare`）：

```ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: true,
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
  },
})
```

然后 `npx nuxt prepare`。

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/site-config.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json nuxt.config.ts site.config.ts tsconfig.json .gitignore vitest.config.ts tests/site-config.spec.ts
git commit -m "chore: scaffold Nuxt 3 app and site config"
```

---

### Task 2: 日期校验与内容模型类型

**Files:**
- Create: `types/content.ts`
- Create: `utils/date.ts`
- Create: `utils/slug.ts`
- Create: `tests/date.spec.ts`
- Create: `tests/slug.spec.ts`
- Test: `tests/date.spec.ts`, `tests/slug.spec.ts`

**Interfaces:**
- Consumes: 无
- Produces:
  - `isIsoDate(value: unknown): boolean` — 仅当值为匹配 `/^\d{4}-\d{2}-\d{2}$/` 的 string 时为 true
  - `slugFromPath(path: string): string` — 取去掉尾斜杠后最后一段
  - 类型：`ArticleMeta`、`ProjectMeta`、`SocialLink`、`AboutMeta`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/date.spec.ts
import { describe, expect, it } from 'vitest'
import { isIsoDate } from '../utils/date'

describe('isIsoDate', () => {
  it('accepts YYYY-MM-DD', () => {
    expect(isIsoDate('2026-09-17')).toBe(true)
  })

  it('rejects missing, empty, or wrong formats', () => {
    expect(isIsoDate(undefined)).toBe(false)
    expect(isIsoDate('')).toBe(false)
    expect(isIsoDate('2026/09/17')).toBe(false)
    expect(isIsoDate('2026-9-17')).toBe(false)
  })
})
```

```ts
// tests/slug.spec.ts
import { describe, expect, it } from 'vitest'
import { slugFromPath } from '../utils/slug'

describe('slugFromPath', () => {
  it('uses the last path segment', () => {
    expect(slugFromPath('/articles/vue-notes')).toBe('vue-notes')
    expect(slugFromPath('content/articles/vue-notes.md')).toBe('vue-notes.md')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/date.spec.ts tests/slug.spec.ts`

Expected: FAIL（模块不存在）

- [ ] **Step 3: Write minimal implementation**

```ts
// types/content.ts
export interface SocialLink {
  name: string
  url: string
}

export interface ArticleMeta {
  slug: string
  title: string
  date: string
  summary: string
  tags: string[]
  draft?: boolean
}

export interface ProjectMeta {
  slug: string
  title: string
  summary: string
  tags: string[]
  featured?: boolean
  repo?: string
  demo?: string
  date?: string
}

export interface AboutMeta {
  skills: string[]
  socials: SocialLink[]
}
```

```ts
// utils/date.ts
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function isIsoDate(value: unknown): boolean {
  return typeof value === 'string' && ISO_DATE.test(value)
}
```

```ts
// utils/slug.ts
export function slugFromPath(path: string): string {
  const parts = path.replace(/\\/g, '/').split('/').filter(Boolean)
  return parts[parts.length - 1] ?? ''
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/date.spec.ts tests/slug.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add types/content.ts utils/date.ts utils/slug.ts tests/date.spec.ts tests/slug.spec.ts
git commit -m "feat: add date and slug helpers"
```

---

### Task 3: 文章与项目查询规则

**Files:**
- Create: `utils/articles.ts`
- Create: `utils/projects.ts`
- Create: `tests/articles.spec.ts`
- Create: `tests/projects.spec.ts`
- Test: `tests/articles.spec.ts`, `tests/projects.spec.ts`

**Interfaces:**
- Consumes: `ArticleMeta`、`ProjectMeta`
- Produces:
  - `publishedArticles(articles: ArticleMeta[]): ArticleMeta[]` — 排除 `draft === true`（`draft` 缺省视为已发布）
  - `sortByDateDesc<T extends { date?: string }>(items: T[]): T[]` — `date` 字符串倒序；缺日期视为 `''`，比较结果稳定（相等保持相对顺序）
  - `latestArticles(articles: ArticleMeta[], limit = 5): ArticleMeta[]`
  - `articlesWithTag(articles: ArticleMeta[], tag: string): ArticleMeta[]` — 精确、区分大小写
  - `featuredProjects(projects: ProjectMeta[]): ProjectMeta[]` — 仅 `featured === true`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/articles.spec.ts
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
```

```ts
// tests/projects.spec.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/articles.spec.ts tests/projects.spec.ts`

Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```ts
// utils/articles.ts
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
```

```ts
// utils/projects.ts
import type { ProjectMeta } from '../types/content'

export function sortByDateDesc<T extends { date?: string }>(items: T[]): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const byDate = (b.item.date ?? '').localeCompare(a.item.date ?? '')
      return byDate !== 0 ? byDate : a.index - b.index
    })
    .map(entry => entry.item)
}

export function featuredProjects(projects: ProjectMeta[]): ProjectMeta[] {
  return sortByDateDesc(projects.filter(project => project.featured === true))
}
```

注意：`sortByDateDesc` 放在 `utils/projects.ts`，`utils/articles.ts` 从该文件导入，避免循环。不要在两处各写一份排序。

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/articles.spec.ts tests/projects.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add utils/articles.ts utils/projects.ts tests/articles.spec.ts tests/projects.spec.ts
git commit -m "feat: add article and project listing rules"
```

---

### Task 4: 从磁盘读取并校验 content/

**Files:**
- Create: `utils/load-content.ts`
- Create: `utils/validate-content.ts`
- Create: `tests/validate-content.spec.ts`
- Create: `tests/fixtures/content-valid/articles/ok.md`
- Create: `tests/fixtures/content-valid/projects/ok.md`
- Create: `tests/fixtures/content-valid/about.md`
- Create: `tests/fixtures/content-invalid/articles/bad.md`
- Create: `tests/fixtures/content-invalid/projects/ok.md`
- Create: `tests/fixtures/content-invalid/about.md`
- Test: `tests/validate-content.spec.ts`

**Interfaces:**
- Consumes: `isIsoDate`、`slugFromPath`、`ArticleMeta`、`ProjectMeta`、`AboutMeta`
- Produces:
  - `loadArticles(dir: string): ArticleMeta[]`
  - `loadProjects(dir: string): ProjectMeta[]`
  - `loadAbout(file: string): AboutMeta`
  - `assertValidContent(rootDir: string): void` — `rootDir/content` 下文章缺 `title|date|summary|tags`、项目缺 `title|summary|tags`、关于我缺 `skills|socials`、或存在的 `date` 不是 `YYYY-MM-DD` 时抛出 `Error`，消息包含文件路径

- [ ] **Step 1: Write fixtures and the failing test**

`tests/fixtures/content-valid/articles/ok.md`：

```md
---
title: 合法文章
date: 2026-09-01
summary: 摘要
tags:
  - Vue
---
正文
```

`tests/fixtures/content-valid/projects/ok.md`：

```md
---
title: 合法项目
summary: 摘要
tags:
  - Nuxt
---
正文
```

`tests/fixtures/content-valid/about.md`：

```md
---
skills:
  - Vue
socials:
  - name: GitHub
    url: https://github.com/example
---
简介
```

`tests/fixtures/content-invalid/articles/bad.md`：

```md
---
title: 缺字段
date: 2026/09/01
summary: 摘要
---
正文
```

`tests/fixtures/content-invalid/projects/ok.md` 与 valid 项目相同。`tests/fixtures/content-invalid/about.md` 与 valid 的 about 相同。

```ts
// tests/validate-content.spec.ts
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { assertValidContent } from '../utils/validate-content'

const here = dirname(fileURLToPath(import.meta.url))

describe('assertValidContent', () => {
  it('accepts complete fixtures', () => {
    expect(() => assertValidContent(join(here, 'fixtures/content-valid'))).not.toThrow()
  })

  it('fails when article tags missing or date is not YYYY-MM-DD', () => {
    expect(() => assertValidContent(join(here, 'fixtures/content-invalid'))).toThrow(/bad\.md/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/validate-content.spec.ts`

Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```bash
npm install gray-matter
```

```ts
// utils/load-content.ts
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

export function loadArticles(dir: string): ArticleMeta[] {
  return mdFiles(dir).map((file) => {
    const { data } = matter(readFileSync(file, 'utf8'))
    return {
      slug: slugFromFile(file),
      title: data.title,
      date: data.date,
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
      date: data.date,
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
```

```ts
// utils/validate-content.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/validate-content.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add utils/load-content.ts utils/validate-content.ts tests/validate-content.spec.ts tests/fixtures package.json package-lock.json
git commit -m "feat: validate markdown frontmatter at build"
```

---

### Task 5: RSS 与简历探测

**Files:**
- Create: `utils/rss.ts`
- Create: `utils/resume.ts`
- Create: `tests/rss.spec.ts`
- Create: `tests/resume.spec.ts`
- Create: `tests/fixtures/resume-present/public/resume.pdf`
- Test: `tests/rss.spec.ts`, `tests/resume.spec.ts`

**Interfaces:**
- Consumes: `siteConfig` 形状 `{ name, description, url }`、`ArticleMeta`、`publishedArticles`
- Produces:
  - `articlePermalink(siteUrl: string, slug: string): string` — `${siteUrl}/articles/${slug}`，`siteUrl` 无尾斜杠
  - `buildRssXml(site: { name: string; description: string; url: string }, articles: ArticleMeta[]): string` — 只含非 draft，按日期倒序；每条含 title、link、pubDate（可从 `YYYY-MM-DD` 转 GMT）、description（摘要）；无文章时仍含 `<channel>` 且无 `<item>`
  - `resumeExists(rootDir: string): boolean` — `rootDir/public/resume.pdf` 是否为文件

- [ ] **Step 1: Write the failing tests**

```ts
// tests/rss.spec.ts
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
```

```ts
// tests/resume.spec.ts
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import { resumeExists } from '../utils/resume'

describe('resumeExists', () => {
  it('is true only when public/resume.pdf exists', () => {
    const missingRoot = join(tmpdir(), `blog-resume-missing-${Date.now()}`)
    mkdirSync(join(missingRoot, 'public'), { recursive: true })
    expect(resumeExists(missingRoot)).toBe(false)

    const presentRoot = join(tmpdir(), `blog-resume-present-${Date.now()}`)
    mkdirSync(join(presentRoot, 'public'), { recursive: true })
    writeFileSync(join(presentRoot, 'public', 'resume.pdf'), '%PDF-1.1')
    expect(resumeExists(presentRoot)).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/rss.spec.ts tests/resume.spec.ts`

Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```ts
// utils/rss.ts
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
```

RSS 用 `publishedArticles` + `sortByDateDesc`，无条数上限，不要调用 `latestArticles`（那是首页的 5 篇）。

```ts
// utils/resume.ts
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export function resumeExists(rootDir: string): boolean {
  return existsSync(join(rootDir, 'public', 'resume.pdf'))
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/rss.spec.ts tests/resume.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add utils/rss.ts utils/resume.ts tests/rss.spec.ts tests/resume.spec.ts
git commit -m "feat: add RSS builder and resume detection"
```

---

### Task 6: 示例 Markdown 与构建钩子

**Files:**
- Create: `content/articles/vue-notes.md`
- Create: `content/articles/draft-example.md`
- Create: `content/projects/aurora-site.md`
- Create: `content/projects/cli-tool.md`
- Create: `content/about.md`
- Create: `utils/nav.ts`
- Create: `tests/sample-content.spec.ts`
- Modify: `nuxt.config.ts`
- Test: `tests/sample-content.spec.ts`

**Interfaces:**
- Consumes: `assertValidContent`、`loadArticles`、`loadProjects`、`loadAbout`、`latestArticles`、`featuredProjects`、`publishedArticles`
- Produces: 仓库 `content/` 满足规格示例数量；`navItems` 为四项 `{ label, to }`；`nuxt.config.ts` 在 `build:before` 调用 `assertValidContent(process.cwd())`，并设置 `runtimeConfig.public.hasResume`

- [ ] **Step 1: Write the failing test against `content/`**

```ts
// tests/sample-content.spec.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/sample-content.spec.ts`

Expected: FAIL（还没有 `content/` 与 `navItems`）

- [ ] **Step 3: Write sample content and hook**

`content/articles/vue-notes.md`：

```md
---
title: Vue 笔记
date: 2026-09-10
summary: 一篇已发布的示例文章。
tags:
  - Vue
  - Nuxt
draft: false
---

这是已发布文章的正文，含一段 `code`。
```

`content/articles/draft-example.md`：

```md
---
title: 草稿示例
date: 2026-09-16
summary: 这篇不应出现在站点上。
tags:
  - Vue
draft: true
---

草稿正文。
```

`content/projects/aurora-site.md`：

```md
---
title: Aurora 个人站
summary: 本博客站点本身。
tags:
  - Nuxt
  - Vue
featured: true
repo: https://github.com/example/personal-blog
date: 2026-09-17
---

精选项目说明。
```

`content/projects/cli-tool.md`：

```md
---
title: 命令行小工具
summary: 未精选的示例项目。
tags:
  - TypeScript
featured: false
date: 2026-08-01
---

普通项目说明。
```

`content/about.md`：

```md
---
skills:
  - Vue
  - Nuxt
  - TypeScript
socials:
  - name: GitHub
    url: https://github.com/example
  - name: Email
    url: mailto:hello@example.com
---

我是 Kane，写技术笔记，也用这个站点展示项目。
```

```ts
// utils/nav.ts
export const navItems = [
  { label: '首页', to: '/' },
  { label: '文章', to: '/articles' },
  { label: '项目', to: '/projects' },
  { label: '关于我', to: '/about' },
] as const
```

修改 `nuxt.config.ts`：

```ts
import { resumeExists } from './utils/resume'
import { assertValidContent } from './utils/validate-content'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: true,
  modules: ['@nuxt/content'],
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
  },
  runtimeConfig: {
    public: {
      hasResume: resumeExists(process.cwd()),
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/rss.xml'],
    },
  },
  hooks: {
    'build:before'() {
      assertValidContent(process.cwd())
    },
  },
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/sample-content.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add content utils/nav.ts nuxt.config.ts tests/sample-content.spec.ts
git commit -m "feat: add sample markdown content and build validation"
```

---

### Task 7: Tailwind token、字体、极光 CSS

**Files:**
- Create: `tailwind.config.ts`
- Create: `assets/css/main.css`
- Modify: `nuxt.config.ts`
- Create: `app.vue`

**Interfaces:**
- Consumes: 外观规格中的色值与字体栈
- Produces: Tailwind 颜色名 `background` `foreground` `primary` `on-primary` `accent` `on-accent` `card` `card-foreground` `muted` `muted-foreground` `border` `ring` `destructive`；字体族 `heading` `sans` `mono`；类名 `aurora-bg` 受 `prefers-reduced-motion` 控制

本任务无新功能断言。实现后用 `npx nuxt prepare` 确认配置能解析。不要在组件里写 hex。

- [ ] **Step 1: Install UI modules**

```bash
npm install @nuxtjs/tailwindcss @nuxtjs/google-fonts lucide-vue-next
```

- [ ] **Step 2: Write token files**

`tailwind.config.ts`：

```ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './app.vue',
    './error.vue',
    './components/**/*.vue',
    './layouts/**/*.vue',
    './pages/**/*.vue',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B1020',
        foreground: '#F8FAFC',
        primary: '#7C3AED',
        'on-primary': '#FFFFFF',
        accent: '#22D3EE',
        'on-accent': '#0B1020',
        card: '#12182A',
        'card-foreground': '#F8FAFC',
        muted: '#1A2238',
        'muted-foreground': '#94A3B8',
        border: 'rgba(124, 58, 237, 0.28)',
        ring: '#22D3EE',
        destructive: '#DC2626',
      },
      fontFamily: {
        heading: ['Outfit', 'Noto Sans SC', 'sans-serif'],
        sans: ['Inter', 'Noto Sans SC', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        chip: '999px',
      },
      maxWidth: {
        content: '1120px',
        prose: '720px',
      },
    },
  },
} satisfies Config
```

`assets/css/main.css`：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply bg-background text-foreground font-sans text-base antialiased;
    line-height: 1.5;
  }

  :focus-visible {
    outline: 2px solid theme('colors.ring');
    outline-offset: 2px;
  }

  a, button {
    cursor: pointer;
  }
}

.aurora-bg {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background-color: theme('colors.background');
}

.aurora-bg::before,
.aurora-bg::after {
  content: '';
  position: absolute;
  width: 55vw;
  height: 55vw;
  border-radius: 9999px;
  filter: blur(80px);
  opacity: 0.35;
  animation: aurora-shift 12s ease-in-out infinite;
}

.aurora-bg::before {
  background: theme('colors.primary');
  top: -10vw;
  left: -8vw;
}

.aurora-bg::after {
  background: theme('colors.accent');
  right: -10vw;
  bottom: -12vw;
  animation-delay: -4s;
}

@keyframes aurora-shift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(4%, 6%); }
}

@media (prefers-reduced-motion: reduce) {
  .aurora-bg::before,
  .aurora-bg::after {
    animation: none;
  }
}

.prose-aurora {
  @apply text-card-foreground text-lg leading-relaxed;
}

.prose-aurora a {
  @apply text-accent underline;
}

.prose-aurora code,
.prose-aurora pre {
  @apply font-mono bg-muted rounded-md;
}

.prose-aurora pre {
  @apply p-4 overflow-x-auto;
}

.prose-aurora code {
  @apply px-1 py-0.5 text-sm;
}
```

`nuxt.config.ts` 的 `modules` 改为：

```ts
modules: ['@nuxtjs/tailwindcss', '@nuxtjs/google-fonts', '@nuxt/content'],
googleFonts: {
  display: 'swap',
  families: {
    Outfit: [400, 500, 600, 700],
    Inter: [400, 500, 600, 700],
    'Noto Sans SC': [400, 500, 700],
    'JetBrains Mono': [400, 500],
  },
},
css: ['~/assets/css/main.css'],
```

`app.vue`：

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 3: Verify Nuxt loads the config**

Run: `npx nuxt prepare`

Expected: 退出码 0

- [ ] **Step 4: Run existing tests**

Run: `npm test`

Expected: PASS（utils 测试不受 CSS 影响）

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts assets/css/main.css nuxt.config.ts app.vue package.json package-lock.json
git commit -m "feat: add Aurora color tokens and motion CSS"
```

---

### Task 8: 布局壳（顶栏、页脚、跳过链接、极光）

**Files:**
- Create: `layouts/default.vue`
- Create: `components/SkipLink.vue`
- Create: `components/AuroraBackground.vue`
- Create: `components/AppHeader.vue`
- Create: `components/AppFooter.vue`
- Create: `pages/index.vue`（临时占位，下一任务替换）
- Create: `server/routes/rss.xml.ts`

**Interfaces:**
- Consumes: `navItems`、`siteConfig`、`queryContent` 的 about `socials`
- Produces: 全站壳；页脚含文字链 `/rss.xml`；RSS 路由返回 `buildRssXml` 的 XML

- [ ] **Step 1: Add RSS route**

```ts
// server/routes/rss.xml.ts
import { siteConfig } from '../../site.config'
import { loadArticles } from '../../utils/load-content'
import { buildRssXml } from '../../utils/rss'

export default defineEventHandler((event) => {
  const xml = buildRssXml(siteConfig, loadArticles('content/articles'))
  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  return xml
})
```

- [ ] **Step 2: Implement shell components**

`components/SkipLink.vue`：

```vue
<template>
  <a
    href="#main"
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-card focus:px-4 focus:py-2"
  >
    跳到正文
  </a>
</template>
```

`components/AuroraBackground.vue`：

```vue
<template>
  <div class="aurora-bg" aria-hidden="true" />
</template>
```

`components/AppHeader.vue`：

```vue
<script setup lang="ts">
import { List, X } from 'lucide-vue-next'
import { siteConfig } from '../site.config'
import { navItems } from '../utils/nav'

const route = useRoute()
const open = ref(false)

function isCurrent(to: string): boolean {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
    <div class="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3 md:px-8">
      <NuxtLink to="/" class="font-heading text-lg font-semibold text-foreground">
        {{ siteConfig.name }}
      </NuxtLink>
      <nav class="hidden items-center gap-6 lg:flex" aria-label="主导航">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="relative min-h-11 px-1 py-2 text-sm text-muted-foreground hover:text-foreground"
          :aria-current="isCurrent(item.to) ? 'page' : undefined"
        >
          {{ item.label }}
          <span
            v-if="isCurrent(item.to)"
            class="absolute inset-x-0 -bottom-1 h-0.5 bg-accent"
            aria-hidden="true"
          />
        </NuxtLink>
      </nav>
      <button
        type="button"
        class="inline-flex min-h-11 min-w-11 items-center justify-center lg:hidden"
        :aria-expanded="open"
        aria-label="打开菜单"
        @click="open = !open"
      >
        <X v-if="open" :size="20" aria-hidden="true" />
        <List v-else :size="20" aria-hidden="true" />
      </button>
    </div>
    <nav v-if="open" class="flex flex-col gap-1 px-4 pb-4 lg:hidden" aria-label="移动导航">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex min-h-11 items-center text-foreground"
        @click="open = false"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>
  </header>
</template>
```

`components/AppFooter.vue`：

```vue
<script setup lang="ts">
import { siteConfig } from '../site.config'

const { data: about } = await useAsyncData('footer-socials', () =>
  queryContent('/about').only(['socials']).findOne(),
)
</script>

<template>
  <footer class="border-t border-border">
    <div class="mx-auto flex max-w-content flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground md:px-8">
      <div class="flex flex-wrap items-center gap-4">
        <NuxtLink to="/rss.xml" class="hover:text-foreground">RSS</NuxtLink>
        <a
          v-for="social in about?.socials ?? []"
          :key="social.url"
          :href="social.url"
          class="hover:text-foreground"
        >{{ social.name }}</a>
      </div>
      <p>© {{ siteConfig.name }}</p>
    </div>
  </footer>
</template>
```

`layouts/default.vue`：

```vue
<template>
  <div class="relative min-h-screen">
    <AuroraBackground />
    <SkipLink />
    <AppHeader />
    <main id="main" class="mx-auto w-full max-w-content px-4 py-10 md:px-8">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
```

临时 `pages/index.vue`：

```vue
<template>
  <h1 class="font-heading text-3xl">{{ ' ' }}占位</h1>
</template>
```

（下一任务会整页替换，不要留「占位」文案进最终产品。）

- [ ] **Step 3: Run unit tests**

Run: `npm test`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add layouts components server/routes/rss.xml.ts pages/index.vue
git commit -m "feat: add site chrome and RSS route"
```

---

### Task 9: 共享展示组件

**Files:**
- Create: `components/TagChip.vue`
- Create: `components/EmptyState.vue`
- Create: `components/ArticleCard.vue`
- Create: `components/ProjectCard.vue`
- Create: `components/ExternalLinkButton.vue`

**Interfaces:**
- Consumes: `ArticleMeta` 字段、`ProjectMeta` 字段
- Produces:
  - `TagChip` props：`label: string`，`to?: string`（有 `to` 则 `NuxtLink` 到 `/tags/${encodeURIComponent(label)}` 除非传入绝对 `to`；本项目调用时文章传 `to` 为 `/tags/${encodeURIComponent(tag)}`，项目/技能不传 `to`）
  - `EmptyState` props：`message: string`，可选 `to`、`linkLabel`
  - `ArticleCard` props：`article: { slug, title, date, summary, tags }`，标题链 `/articles/${slug}`
  - `ProjectCard` props：`project: { slug, title, summary, tags }`，标题链 `/projects/${slug}`，标签无链接
  - `ExternalLinkButton` props：`href: string`，`label: string`

- [ ] **Step 1: Implement components**

`components/TagChip.vue`：

```vue
<script setup lang="ts">
defineProps<{
  label: string
  to?: string
}>()
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="inline-flex min-h-11 items-center rounded-chip border border-border px-3 text-sm text-accent"
  >
    {{ label }}
  </NuxtLink>
  <span
    v-else
    class="inline-flex min-h-11 items-center rounded-chip border border-border px-3 text-sm text-muted-foreground"
  >
    {{ label }}
  </span>
</template>
```

`components/EmptyState.vue`：

```vue
<script setup lang="ts">
defineProps<{
  message: string
  to?: string
  linkLabel?: string
}>()
</script>

<template>
  <p class="text-muted-foreground">
    {{ message }}
    <NuxtLink v-if="to && linkLabel" :to="to" class="ml-2 text-accent">{{ linkLabel }}</NuxtLink>
  </p>
</template>
```

`components/ArticleCard.vue`：

```vue
<script setup lang="ts">
defineProps<{
  article: {
    slug: string
    title: string
    date: string
    summary: string
    tags: string[]
  }
}>()
</script>

<template>
  <article class="rounded-card border border-border bg-card p-5 text-card-foreground">
    <h2 class="font-heading text-xl">
      <NuxtLink :to="`/articles/${article.slug}`" class="hover:text-accent">
        {{ article.title }}
      </NuxtLink>
    </h2>
    <p class="mt-2 text-sm text-muted-foreground">{{ article.date }}</p>
    <p class="mt-3">{{ article.summary }}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <TagChip
        v-for="tag in article.tags"
        :key="tag"
        :label="tag"
        :to="`/tags/${encodeURIComponent(tag)}`"
      />
    </div>
  </article>
</template>
```

`components/ProjectCard.vue`：

```vue
<script setup lang="ts">
defineProps<{
  project: {
    slug: string
    title: string
    summary: string
    tags: string[]
  }
}>()
</script>

<template>
  <article class="rounded-card border border-border bg-card p-5 text-card-foreground">
    <h2 class="font-heading text-xl">
      <NuxtLink :to="`/projects/${project.slug}`" class="hover:text-accent">
        {{ project.title }}
      </NuxtLink>
    </h2>
    <p class="mt-3">{{ project.summary }}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <TagChip v-for="tag in project.tags" :key="tag" :label="tag" />
    </div>
  </article>
</template>
```

`components/ExternalLinkButton.vue`：

```vue
<script setup lang="ts">
defineProps<{
  href: string
  label: string
}>()
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm text-accent"
  >
    {{ label }}
  </a>
</template>
```

- [ ] **Step 2: Run unit tests**

Run: `npm test`

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/TagChip.vue components/EmptyState.vue components/ArticleCard.vue components/ProjectCard.vue components/ExternalLinkButton.vue
git commit -m "feat: add list cards and empty state"
```

---

### Task 10: 首页、文章列表/详情/标签

**Files:**
- Modify: `pages/index.vue`（替换占位）
- Create: `pages/articles/index.vue`
- Create: `pages/articles/[slug].vue`
- Create: `pages/tags/[tag].vue`

**Interfaces:**
- Consumes: `queryContent`、`latestArticles`、`featuredProjects`、`publishedArticles`、`articlesWithTag`、`sortByDateDesc`、`slugFromPath`、`siteConfig`
- Produces: 上述路由。文章 query 结果映射为 `ArticleMeta`（`slug` 来自 `_path`）。详情在缺失或 `draft === true` 时 `createError({ statusCode: 404, statusMessage: 'Not Found' })`。标签页 `decodeURIComponent`，永不 404。

把 Content 文档转成 `ArticleMeta` 的映射必须写在页面里如下，不要另发明字段名：

```ts
function toArticle(doc: { _path?: string; title: string; date: string; summary: string; tags: string[]; draft?: boolean }): ArticleMeta {
  return {
    slug: slugFromPath(doc._path ?? ''),
    title: doc.title,
    date: doc.date,
    summary: doc.summary,
    tags: doc.tags,
    draft: doc.draft,
  }
}
```

- [ ] **Step 1: Replace homepage**

```vue
<script setup lang="ts">
import { siteConfig } from '../site.config'
import type { ArticleMeta, ProjectMeta } from '../types/content'
import { latestArticles } from '../utils/articles'
import { featuredProjects } from '../utils/projects'
import { slugFromPath } from '../utils/slug'

const { data } = await useAsyncData('home', async () => {
  const articleDocs = await queryContent('articles').find()
  const projectDocs = await queryContent('projects').find()
  const articles = latestArticles(articleDocs.map(toArticle))
  const projects = featuredProjects(projectDocs.map(toProject))
  return { articles, projects }
})

function toArticle(doc: { _path?: string; title: string; date: string; summary: string; tags: string[]; draft?: boolean }): ArticleMeta {
  return {
    slug: slugFromPath(doc._path ?? ''),
    title: doc.title,
    date: doc.date,
    summary: doc.summary,
    tags: doc.tags,
    draft: doc.draft,
  }
}

function toProject(doc: { _path?: string; title: string; summary: string; tags: string[]; featured?: boolean; date?: string }): ProjectMeta {
  return {
    slug: slugFromPath(doc._path ?? ''),
    title: doc.title,
    summary: doc.summary,
    tags: doc.tags,
    featured: doc.featured,
    date: doc.date,
  }
}

useSeoMeta({
  title: () => siteConfig.name,
  description: () => siteConfig.description,
})
</script>

<template>
  <div class="space-y-12">
    <section>
      <h1 class="font-heading text-4xl font-semibold">{{ siteConfig.name }}</h1>
      <p class="mt-3 max-w-prose text-muted-foreground">{{ siteConfig.description }}</p>
    </section>
    <div class="grid gap-12 md:grid-cols-2">
      <section>
        <h2 class="font-heading text-2xl">最新文章</h2>
        <EmptyState v-if="!data?.articles.length" message="还没有文章。" />
        <div v-else class="mt-6 space-y-4">
          <ArticleCard v-for="article in data.articles" :key="article.slug" :article="article" />
          <NuxtLink to="/articles" class="inline-flex min-h-11 items-center text-accent">查看全部文章</NuxtLink>
        </div>
      </section>
      <section>
        <h2 class="font-heading text-2xl">精选项目</h2>
        <EmptyState v-if="!data?.projects.length" message="还没有精选项目。" />
        <div v-else class="mt-6 space-y-4">
          <ProjectCard v-for="project in data.projects" :key="project.slug" :project="project" />
          <NuxtLink to="/projects" class="inline-flex min-h-11 items-center text-accent">查看全部项目</NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Article list, detail, and tag pages**

`pages/articles/index.vue`：

```vue
<script setup lang="ts">
import { publishedArticles } from '../../utils/articles'
import { sortByDateDesc } from '../../utils/projects'
import { slugFromPath } from '../../utils/slug'

const { data } = await useAsyncData('articles', async () => {
  const docs = await queryContent('articles').find()
  const articles = publishedArticles(docs.map(doc => ({
    slug: slugFromPath(doc._path ?? ''),
    title: doc.title as string,
    date: doc.date as string,
    summary: doc.summary as string,
    tags: doc.tags as string[],
    draft: doc.draft as boolean | undefined,
  })))
  return sortByDateDesc(articles)
})

useSeoMeta({ title: '文章' })
</script>

<template>
  <div>
    <h1 class="font-heading text-3xl">文章</h1>
    <EmptyState v-if="!data?.length" class="mt-6" message="还没有内容。" />
    <div v-else class="mt-8 space-y-4">
      <ArticleCard v-for="article in data" :key="article.slug" :article="article" />
    </div>
  </div>
</template>
```

列表排序只使用 `utils/projects.ts` 的 `sortByDateDesc`，不要再写一份。

`pages/articles/[slug].vue`：

```vue
<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const slug = route.params.slug as string

const { data: article } = await useAsyncData(`article-${slug}`, () =>
  queryContent('articles').where({ _path: `/articles/${slug}` }).findOne(),
)

if (!article.value || article.value.draft === true) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}

useSeoMeta({
  title: () => article.value?.title,
  description: () => article.value?.summary,
})
</script>

<template>
  <article v-if="article" class="mx-auto max-w-prose rounded-card bg-card p-6 md:p-10">
    <NuxtLink to="/articles" class="inline-flex min-h-11 items-center gap-2 text-sm text-accent">
      <ArrowLeft :size="16" aria-hidden="true" />
      全部文章
    </NuxtLink>
    <h1 class="mt-6 font-heading text-3xl">{{ article.title }}</h1>
    <p class="mt-3 text-sm text-muted-foreground">{{ article.date }}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <TagChip
        v-for="tag in article.tags"
        :key="tag"
        :label="tag"
        :to="`/tags/${encodeURIComponent(tag)}`"
      />
    </div>
    <ContentRenderer class="prose-aurora mt-8" :value="article" />
  </article>
</template>
```

`pages/tags/[tag].vue`：

```vue
<script setup lang="ts">
import { articlesWithTag } from '../../utils/articles'
import { sortByDateDesc } from '../../utils/projects'
import { slugFromPath } from '../../utils/slug'

const route = useRoute()
const tag = decodeURIComponent(route.params.tag as string)

const { data } = await useAsyncData(`tag-${tag}`, async () => {
  const docs = await queryContent('articles').find()
  const articles = articlesWithTag(docs.map(doc => ({
    slug: slugFromPath(doc._path ?? ''),
    title: doc.title as string,
    date: doc.date as string,
    summary: doc.summary as string,
    tags: doc.tags as string[],
    draft: doc.draft as boolean | undefined,
  })), tag)
  return sortByDateDesc(articles)
})

useSeoMeta({ title: () => `标签：${tag}` })
</script>

<template>
  <div>
    <h1 class="font-heading text-3xl">标签：{{ tag }}</h1>
    <EmptyState
      v-if="!data?.length"
      class="mt-6"
      message="没有带这个标签的文章。"
      to="/articles"
      link-label="全部文章"
    />
    <div v-else class="mt-8 space-y-4">
      <ArticleCard v-for="article in data" :key="article.slug" :article="article" />
    </div>
  </div>
</template>
```

- [ ] **Step 3: Run unit tests**

Run: `npm test`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add pages/index.vue pages/articles pages/tags
git commit -m "feat: add home and article routes"
```

---

### Task 11: 项目页、关于我、404

**Files:**
- Create: `pages/projects/index.vue`
- Create: `pages/projects/[slug].vue`
- Create: `pages/about.vue`
- Create: `error.vue`

**Interfaces:**
- Consumes: `queryContent`、`sortByDateDesc`、`slugFromPath`、`useRuntimeConfig().public.hasResume`
- Produces: 项目列表（全量，无 draft 规则）、项目详情 404 当 slug 不存在；关于我顺序为简介、技能（无链接芯片）、社交、有简历才显示「下载简历」链到 `/resume.pdf`；`error.vue` 文案「没有这个页面。」+ 回 `/`

- [ ] **Step 1: Project pages**

`pages/projects/index.vue`：

```vue
<script setup lang="ts">
import { sortByDateDesc } from '../../utils/projects'
import { slugFromPath } from '../../utils/slug'

const { data } = await useAsyncData('projects', async () => {
  const docs = await queryContent('projects').find()
  return sortByDateDesc(docs.map(doc => ({
    slug: slugFromPath(doc._path ?? ''),
    title: doc.title as string,
    summary: doc.summary as string,
    tags: doc.tags as string[],
    date: doc.date as string | undefined,
  })))
})

useSeoMeta({ title: '项目' })
</script>

<template>
  <div>
    <h1 class="font-heading text-3xl">项目</h1>
    <EmptyState v-if="!data?.length" class="mt-6" message="还没有内容。" />
    <div v-else class="mt-8 grid gap-4 md:grid-cols-2">
      <ProjectCard v-for="project in data" :key="project.slug" :project="project" />
    </div>
  </div>
</template>
```

`pages/projects/[slug].vue`：

```vue
<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const slug = route.params.slug as string

const { data: project } = await useAsyncData(`project-${slug}`, () =>
  queryContent('projects').where({ _path: `/projects/${slug}` }).findOne(),
)

if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}

useSeoMeta({
  title: () => project.value?.title,
  description: () => project.value?.summary,
})
</script>

<template>
  <article v-if="project" class="mx-auto max-w-prose rounded-card bg-card p-6 md:p-10">
    <NuxtLink to="/projects" class="inline-flex min-h-11 items-center gap-2 text-sm text-accent">
      <ArrowLeft :size="16" aria-hidden="true" />
      全部项目
    </NuxtLink>
    <div class="mt-6 flex flex-wrap items-center gap-3">
      <h1 class="font-heading text-3xl">{{ project.title }}</h1>
      <ExternalLinkButton v-if="project.repo" :href="project.repo" label="仓库" />
      <ExternalLinkButton v-if="project.demo" :href="project.demo" label="演示" />
    </div>
    <p class="mt-3 text-muted-foreground">{{ project.summary }}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <TagChip v-for="tag in project.tags" :key="tag" :label="tag" />
    </div>
    <ContentRenderer class="prose-aurora mt-8" :value="project" />
  </article>
</template>
```

- [ ] **Step 2: About and 404**

`pages/about.vue`：

```vue
<script setup lang="ts">
const config = useRuntimeConfig()
const { data: about } = await useAsyncData('about', () => queryContent('/about').findOne())

useSeoMeta({ title: '关于我' })
</script>

<template>
  <div v-if="about" class="mx-auto max-w-prose space-y-10">
    <section>
      <h1 class="font-heading text-3xl">关于我</h1>
      <ContentRenderer class="prose-aurora mt-6" :value="about" />
    </section>
    <section>
      <h2 class="font-heading text-2xl">技能栈</h2>
      <div class="mt-4 flex flex-wrap gap-2">
        <TagChip v-for="skill in about.skills" :key="skill" :label="skill" />
      </div>
    </section>
    <section>
      <h2 class="font-heading text-2xl">链接</h2>
      <ul class="mt-4 space-y-2">
        <li v-for="social in about.socials" :key="social.url">
          <a :href="social.url" class="text-accent">{{ social.name }}</a>
        </li>
      </ul>
    </section>
    <section v-if="config.public.hasResume">
      <a href="/resume.pdf" class="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-on-accent">
        下载简历
      </a>
    </section>
  </div>
</template>
```

`error.vue`：

```vue
<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
</script>

<template>
  <NuxtLayout>
    <div class="mx-auto max-w-prose py-24 text-center">
      <h1 class="font-heading text-3xl">没有这个页面。</h1>
      <NuxtLink to="/" class="mt-6 inline-flex min-h-11 items-center text-accent">回首页</NuxtLink>
    </div>
  </NuxtLayout>
</template>
```

简历链接使用 `href="/resume.pdf"`。若 `app.baseURL` 不是 `/`，改为 `useRuntimeConfig().app.baseURL` 拼接，或 `:href="`${useRuntimeConfig().app.baseURL}resume.pdf`.replace('//', '/')`"。推荐：

```vue
<script setup lang="ts">
const config = useRuntimeConfig()
const resumeHref = computed(() => {
  const base = config.app.baseURL.endsWith('/') ? config.app.baseURL : `${config.app.baseURL}/`
  return `${base}resume.pdf`
})
</script>
```

模板用 `:href="resumeHref"`。

- [ ] **Step 3: Run unit tests**

Run: `npm test`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add pages/projects pages/about.vue error.vue
git commit -m "feat: add project, about, and 404 pages"
```

---

### Task 12: Generate 产物契约测试

**Files:**
- Create: `tests/generate-output.spec.ts`
- Modify: `package.json`（可加 `"test:generate"` 若你希望分开跑；默认让该测试在 `npm test` 之外，由 CI 先 `npm test` 再 `npm run generate` 再跑本文件）
- Modify: `package.json` scripts 增加 `"test:all": "vitest run && nuxt generate && vitest run tests/generate-output.spec.ts"`

**Interfaces:**
- Consumes: 真实 `content/` 与 `.output/public`
- Produces: 断言静态产物符合功能规格

生成后 Nuxt 3 的 HTML 在 `.output/public/**/index.html`。RSS 在 `.output/public/rss.xml`。

- [ ] **Step 1: Write the failing output test**

```ts
// tests/generate-output.spec.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/generate-output.spec.ts`

Expected: FAIL（还没有 `.output/public`）

- [ ] **Step 3: Generate then rerun**

Run:

```bash
npx nuxt generate
npx vitest run tests/generate-output.spec.ts
```

Expected: `nuxt generate` 成功；第二步 PASS。若草稿 HTML 被爬出，从列表/详情去掉草稿链接，并确认详情页对 draft 抛 404 且 `nitro.prerender` 不要把草稿 slug 加进 `routes`。

`package.json` 增加：

```json
"test:all": "vitest run tests --exclude tests/generate-output.spec.ts && nuxt generate && vitest run tests/generate-output.spec.ts"
```

把 `tests/generate-output.spec.ts` 从默认 `npm test` 排除：改 `vitest.config.ts`：

```ts
export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    exclude: ['tests/generate-output.spec.ts'],
  },
})
```

默认 `npm test` 只跑快测；产物测试走 `npm run test:all`。

- [ ] **Step 4: Confirm default tests still pass**

Run: `npm test`

Expected: PASS，且不依赖 `.output`

- [ ] **Step 5: Commit**

```bash
git add tests/generate-output.spec.ts vitest.config.ts package.json
git commit -m "test: assert static output hides drafts and emits RSS"
```

---

### Task 13: GitHub Actions 发布到 Pages

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `public/.gitkeep`（没有简历时保证 `public/` 存在；不要提交假简历，除非作者提供真实 PDF）

**Interfaces:**
- Consumes: `npm test`、`npm run generate`（或 `test:all`）
- Produces: `main` 上测试或 generate 失败则不部署；成功则发布 `.output/public`

- [ ] **Step 1: Add workflow**

```yaml
name: Deploy
on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run generate
      - run: npx vitest run tests/generate-output.spec.ts
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .output/public

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

若仓库是项目站，在 workflow 的 generate 前加：

```yaml
- run: npm run generate
  env:
    NUXT_APP_BASE_URL: /${{ github.event.repository.name }}/
```

用户站（`username.github.io`）不要设该变量。计划默认按用户站：不设 `NUXT_APP_BASE_URL`。若实际仓库名不是用户站，实现时加上面 `env`。

- [ ] **Step 2: Keep public directory**

`public/.gitkeep` 空文件。不要伪造 `resume.pdf`。

- [ ] **Step 3: Run full local check**

Run: `npm run test:all`

Expected: 全部 PASS，`.output/public` 含首页、文章、项目、about、rss.xml

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml public/.gitkeep
git commit -m "ci: test, generate, and deploy to GitHub Pages"
```

仓库 Settings → Pages → Source 选 GitHub Actions。未配置则 workflow 的 deploy job 会失败，但 build 仍能证明生成成功。

---

## Self-review

**Spec coverage**

| 规格项 | 任务 |
|---|---|
| Nuxt 3 + Content + generate + Pages | 1, 6, 13 |
| 路由与导航四项 | 6, 8, 10, 11 |
| frontmatter 校验与坏日期构建失败 | 4, 6 |
| draft 过滤与 404 | 3, 10, 12 |
| 首页 5 篇 + featured | 3, 10 |
| 标签精确匹配、未知标签空列表 | 3, 10 |
| 项目 repo/demo、标签不进 /tags | 9, 11 |
| about skills/socials、简历可选 | 5, 11 |
| RSS 字段与空 feed | 5, 8, 12 |
| 示例内容数量 | 6 |
| Aurora token、深色、字体、克制动效、壳层 | 7, 8 |
| 空态与 404 文案 | 9, 10, 11 |
| 不测外观、功能可用 vitest + 产物测试 | 12 |
| 不改 content 约定 | 全局 |

**Placeholder scan:** 无 TBD。RSS 使用 `publishedArticles` + `sortByDateDesc`，不复用首页的 5 篇上限。

**Type consistency:** `ArticleMeta` / `ProjectMeta` / `AboutMeta` / `SocialLink` 贯穿 load、validate、rss、页面映射；`siteConfig.url` 无尾斜杠；`hasResume` 来自 `resumeExists`；slug 一律 `slugFromPath`。
