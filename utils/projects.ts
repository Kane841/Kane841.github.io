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
