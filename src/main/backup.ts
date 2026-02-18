import { join } from 'path'
import { existsSync, mkdirSync, copyFileSync, readdirSync, unlinkSync } from 'fs'

export function createBackup(dataFilePath: string, backupsDir: string): void {
  try {
    if (!existsSync(dataFilePath)) return
    if (!existsSync(backupsDir)) {
      mkdirSync(backupsDir, { recursive: true })
    }
    const now = new Date()
    const ts = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const backupName = `gfgc-data-${ts}.json`
    copyFileSync(dataFilePath, join(backupsDir, backupName))
  } catch (err) {
    console.error('Failed to create backup:', err)
  }
}

export function cleanOldBackups(backupsDir: string, retentionCount: number): void {
  try {
    if (!existsSync(backupsDir)) return
    const files = readdirSync(backupsDir)
      .filter((f) => f.startsWith('gfgc-data-') && f.endsWith('.json'))
      .sort()
      .reverse()

    for (let i = retentionCount; i < files.length; i++) {
      unlinkSync(join(backupsDir, files[i]))
    }
  } catch (err) {
    console.error('Failed to clean old backups:', err)
  }
}
