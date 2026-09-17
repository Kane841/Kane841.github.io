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
