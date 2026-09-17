import { existsSync } from 'node:fs'
import { join } from 'node:path'

export function resumeExists(rootDir: string): boolean {
  return existsSync(join(rootDir, 'public', 'resume.pdf'))
}
