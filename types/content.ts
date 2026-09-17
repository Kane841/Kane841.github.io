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
