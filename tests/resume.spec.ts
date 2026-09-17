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
