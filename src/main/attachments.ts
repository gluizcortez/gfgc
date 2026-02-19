import { app, shell, dialog } from 'electron'
import { join, resolve, basename } from 'path'
import { existsSync, mkdirSync, copyFileSync, unlinkSync, statSync } from 'fs'

const MAX_ATTACHMENT_SIZE = 100 * 1024 * 1024 // 100MB

function safePath(relativePath: string): string | null {
  const dir = getAttachmentsDir()
  const full = resolve(dir, relativePath)
  if (!full.startsWith(dir)) return null
  return full
}

function getAttachmentsDir(): string {
  const dir = join(app.getPath('userData'), 'attachments')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

export interface AttachmentResult {
  id: string
  name: string
  path: string
  size: number
  uploadedAt: string
}

export async function pickAndSaveAttachment(): Promise<AttachmentResult | null> {
  const result = await dialog.showOpenDialog({
    title: 'Selecionar Anexo',
    properties: ['openFile'],
    filters: [
      { name: 'Todos', extensions: ['*'] },
      { name: 'Imagens', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] },
      { name: 'Documentos', extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) return null

  const sourcePath = result.filePaths[0]
  const originalName = basename(sourcePath)
  const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : ''
  const storedName = `${id}${ext}`
  const destPath = join(getAttachmentsDir(), storedName)

  const stat = statSync(sourcePath)
  if (stat.size > MAX_ATTACHMENT_SIZE) {
    throw new Error(`Arquivo excede o limite de 100MB (${(stat.size / 1024 / 1024).toFixed(1)}MB)`)
  }

  copyFileSync(sourcePath, destPath)

  return {
    id,
    name: originalName,
    path: storedName,
    size: stat.size,
    uploadedAt: new Date().toISOString()
  }
}

export function deleteAttachment(relativePath: string): void {
  const fullPath = safePath(relativePath)
  if (!fullPath) return
  if (existsSync(fullPath)) {
    unlinkSync(fullPath)
  }
}

export function openAttachment(relativePath: string): void {
  const fullPath = safePath(relativePath)
  if (!fullPath) return
  if (existsSync(fullPath)) {
    shell.openPath(fullPath)
  }
}
