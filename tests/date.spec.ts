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
