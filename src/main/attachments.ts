import { app, shell, dialog } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, copyFileSync, unlinkSync, statSync } from 'fs'
import { basename } from 'path'

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

  copyFileSync(sourcePath, destPath)
  const stat = statSync(destPath)

  return {
    id,
    name: originalName,
    path: storedName,
    size: stat.size,
    uploadedAt: new Date().toISOString()
  }
}

export function deleteAttachment(relativePath: string): void {
  const fullPath = join(getAttachmentsDir(), relativePath)
  if (existsSync(fullPath)) {
    unlinkSync(fullPath)
  }
}

export function openAttachment(relativePath: string): void {
  const fullPath = join(getAttachmentsDir(), relativePath)
  if (existsSync(fullPath)) {
    shell.openPath(fullPath)
  }
}
