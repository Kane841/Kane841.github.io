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

  it('fails when about.md lacks socials', () => {
    expect(() => assertValidContent(join(here, 'fixtures/content-about-no-socials'))).toThrow(
      /Invalid about\.md: skills and socials are required/,
    )
  })
})
