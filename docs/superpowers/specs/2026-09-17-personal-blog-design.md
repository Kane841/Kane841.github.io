# 个人博客第一版功能设计

日期：2026-09-17  
状态：待审阅  
范围：功能、内容、发布、异常与测试。外观、布局、视觉气质不在本文档内，由单独的外观设计文档约定。

## 背景与目标

做一个能尽快上线的个人站点：以技术笔记为主，同时服务招聘与作品展示。源码和内容托管在 GitHub，通过 GitHub Pages 发布。作者用仓库里的 Markdown 写作，`git push` 后自动更新站点。

成功标准：下列路由在 Pages 上可访问；用 Markdown 新增或修改内容后，`main` 分支构建成功即上线；第一版不依赖任何运行时后端。

## 非目标

- 外观、视觉、动效、主题（另文档）
- 评论、站内搜索、登录、后台、数据库
- 中英双语切换
- 浏览器内写作或外部 CMS（Notion 等）
- 自定义域名（需要时可后加，不改变本设计的路由与内容模型）

## 架构

技术选型：Nuxt 3 + Nuxt Content。构建时静态导出（`nuxt generate`），GitHub Actions 发布到 GitHub Pages。无后端、无数据库、无登录。

系统分三层，单向依赖：

1. **内容层**：`content/` 下的 Markdown 与 `public/resume.pdf`。不依赖页面如何渲染。
2. **站点层**：Nuxt 路由与页面，只通过 Nuxt Content 查询内容，负责把功能点映射到路由。
3. **发布层**：GitHub Actions 执行生成并部署产物。构建失败则不覆盖线上，保留上一版。

页面以后按外观文档改写时，不得要求改 frontmatter 字段或 `content/` 目录约定。

站点内路由一律写成以应用根为 `/`。若仓库是用户站（`username.github.io`），线上即根路径；若是项目站（`username.github.io/repo`），实现时设置 `app.baseURL`，站内链接走 base，产品行为不变。

站点级功能配置放在 `site.config.ts`，供 RSS 绝对链接和页面元信息使用，不属于外观：

| 字段 | 含义 |
|---|---|
| `name` | 站点名称 |
| `description` | 站点简介 |
| `url` | canonical 根 URL（无尾斜杠），用于 RSS 条目绝对链接 |

## 页面与功能

| 路由 | 功能 |
|---|---|
| `/` | 首页双入口：最新文章 + 精选项目；可进入文章、项目、关于我 |
| `/articles` | 全部非 draft 文章列表（标题、日期、标签、摘要）；点标题进详情，点标签进 `/tags/:tag`。列表页不做第二套筛选器 |
| `/articles/:slug` | 文章详情：标题、日期、标签、正文 |
| `/tags/:tag` | 该标签下的非 draft 文章列表 |
| `/projects` | 全部项目列表 |
| `/projects/:slug` | 项目详情：标题、摘要、标签、正文；有 `repo` / `demo` 则提供对应外链 |
| `/about` | 简介、技能栈、社交链接；有简历文件则提供 PDF 下载 |
| `/rss.xml` | 非 draft 文章的 RSS |

全站导航可到达：首页、文章、项目、关于我。列表与详情中的文章标签一律进入 `/tags/:tag`，不做列表页内筛选。首页文章区链到 `/articles` 与单篇；项目区链到 `/projects` 与单个项目。项目上的 `tags` 只作项目元数据展示，不进入 `/tags/:tag`，标签页只聚合文章。

简历下载地址为 `/resume.pdf`，不是独立内容页。

第一版不做：评论、站内搜索、登录/后台、语言切换。

## 内容模型

写作格式：Markdown + YAML frontmatter。文件名（不含扩展名）即为 `slug`，推荐只用小写英数字和连字符（如 `vue-notes.md`）。`date` 使用 `YYYY-MM-DD`。标签为精确字符串匹配（区分大小写）；`/tags/:tag` 的路径段与 frontmatter 中的值一致（URL 编码由实现处理）。

### 目录

| 路径 | 用途 |
|---|---|
| `content/articles/*.md` | 文章 |
| `content/projects/*.md` | 项目 |
| `content/about.md` | 关于我 |
| `public/resume.pdf` | 简历下载文件，可选 |

### 文章 frontmatter

| 字段 | 必填 | 含义 |
|---|---|---|
| `title` | 是 | 标题 |
| `date` | 是 | 发布日期；列表与 RSS 按此倒序 |
| `summary` | 是 | 列表与首页摘要 |
| `tags` | 是 | 字符串数组，对应 `/tags/:tag` |
| `draft` | 否 | `true` 时构建不输出该文，默认 `false` |

项目没有 `draft`：`content/projects/` 中的文件全部发布。

### 项目 frontmatter

| 字段 | 必填 | 含义 |
|---|---|---|
| `title` | 是 | 标题 |
| `summary` | 是 | 列表与首页摘要 |
| `tags` | 是 | 技术栈或标签，仅项目页展示 |
| `featured` | 否 | `true` 才进入首页精选，默认 `false` |
| `repo` | 否 | 仓库 URL |
| `demo` | 否 | 演示 URL |
| `date` | 否 | 列表与精选排序；缺省时同一规则下排序稳定即可 |

### 关于我

`content/about.md` 正文为简介。frontmatter：

| 字段 | 必填 | 含义 |
|---|---|---|
| `skills` | 是 | 字符串数组 |
| `socials` | 是 | `{ name, url }[]`，如 GitHub、邮箱（可用 `mailto:`） |

简历不写入 Markdown。存在 `public/resume.pdf` 时关于我提供下载；缺失则不提供入口，构建仍成功。

### 首页取数

- 最新文章：非 draft，按 `date` 倒序，取 5 篇。不足 5 篇则全展示；0 篇则为空列表。
- 精选项目：全部 `featured: true`，按 `date` 倒序（无日期则排序稳定）。数量不封顶；0 个则为空列表。

### RSS

`/rss.xml` 只收录非 draft 文章，按 `date` 倒序。每条含标题、绝对链接、日期、摘要。项目不进入 RSS。无文章时输出合法空 feed。条目链接使用站点配置中的 canonical URL。

## 数据流与发布

作者只通过改仓库发布：新增或编辑 Markdown、替换 `public/resume.pdf`，推送到 `main`。不提供浏览器编辑或运行时写入。

页面在构建时查询 Nuxt Content：

- 首页：最新 5 篇非 draft 文章 + 全部 featured 项目
- `/articles`、`/projects`：全量列表
- 详情：按 `slug` 取单篇
- `/tags/:tag`：`tags` 包含该值的非 draft 文章
- `/about`：`about.md` 正文与 frontmatter，并依据简历文件是否存在决定下载

`draft: true` 的文章不进入列表、详情路由、标签页、RSS。其 URL 访问为 404。

`main` 的推送与合并触发 GitHub Actions：安装依赖 → `nuxt generate` → 发布到 GitHub Pages。构建失败不更新线上。本地可用开发服务器或 `nuxt generate` 预览，非正式发布。

## 异常情况

**构建期**

- 文章缺 `title` / `date` / `summary` / `tags`，项目缺 `title` / `summary` / `tags`，关于我缺 `skills` / `socials`：构建失败，不发布。
- 文章或项目的 `date` 存在但不是 `YYYY-MM-DD`：构建失败，不发布。
- Markdown 无法解析：构建失败，不发布。
- 缺少 `public/resume.pdf`：构建成功，关于我不提供下载。
- 没有文章、没有项目、或没有精选项目：构建成功，对应位置为空列表。

**访问期**

- 未知文章/项目 `slug`，或文章为 draft：404。
- 未知标签 `/tags/:tag`：页面可访问，列表为空，不 404。
- 无文章时 RSS 仍为合法空 feed。
- 无运行时接口，故无超时或鉴权失败。

## 测试

只测功能，不测外观。

- `draft` 文章不出现在列表、详情路由、标签页、RSS；直接访问其 slug 为 404。
- 首页文章至多 5 篇，按 `date` 倒序；首页项目仅为 `featured: true`。
- 每个非 draft 文章、每个项目都生成对应页面；不存在的 slug 为 404。
- 有 `resume.pdf` 时关于我提供下载，没有则不提供。
- RSS 只含非 draft 文章，含标题、绝对链接、日期、摘要。
- CI 在 `main` 上执行生成；失败则不得发布。

第一版仓库内带可验证的示例内容：至少 2 篇文章（其中 1 篇 `draft: true`）、2 个项目（其中 1 个 `featured: true`）、完整的 `about.md`。简历文件可选。真实文章由作者之后替换示例。

## 模块边界

| 模块 | 做什么 | 如何使用 | 依赖 |
|---|---|---|---|
| 内容集合 | 定义文章、项目、关于我的文件与字段 | 作者编辑 Markdown | 无 |
| 内容查询 | 按草稿、日期、标签、精选过滤 | 页面在构建时调用 | 内容集合、Nuxt Content |
| 路由页面 | 把查询结果映射到上表路由 | 访客访问路径 | 内容查询 |
| RSS 生成 | 构建时写出 `/rss.xml` | 订阅器请求该路径 | 内容查询、站点 canonical URL |
| 简历探测 | 判断 PDF 是否存在 | 关于我页决定是否提供下载 | `public/resume.pdf` |
| 发布工作流 | 生成并部署静态产物 | 推送 `main` 触发 | 站点构建产物 |

各模块可独立理解：改页面不改内容字段；改外观文档只影响路由页面的呈现，不影响查询规则与发布。
