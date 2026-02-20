import { ipcMain, dialog, shell, app } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { IPC } from '../shared/ipc-channels'
import { loadData, saveData } from './storage'
import { pickAndSaveAttachment, deleteAttachment, openAttachment } from './attachments'
import { checkForUpdate, downloadUpdate } from './updater'

function isValidAppData(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  if (!d.settings || typeof d.settings !== 'object') return false
  if (!Array.isArray(d.workspaces ?? [])) return false
  if (!Array.isArray(d.bills ?? [])) return false
  if (!Array.isArray(d.monthlyBillRecords ?? [])) return false
  if (!Array.isArray(d.investments ?? [])) return false
  if (!Array.isArray(d.investmentTransactions ?? [])) return false
  if (!Array.isArray(d.goals ?? [])) return false
  if (!Array.isArray(d.fgtsRecords ?? [])) return false
  if (!Array.isArray(d.incomeEntries ?? [])) return false
  return true
}

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC.DATA_LOAD, () => {
    return loadData()
  })

  ipcMain.handle(IPC.DATA_SAVE, (_event, data: object) => {
    saveData(data)
    return { success: true }
  })

  ipcMain.handle(IPC.DATA_EXPORT, async (_event, data: object) => {
    const result = await dialog.showSaveDialog({
      title: 'Exportar Dados',
      defaultPath: 'gfgc-backup.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (!result.canceled && result.filePath) {
      writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8')
      return { success: true, path: result.filePath }
    }
    return { success: false }
  })

  ipcMain.handle(IPC.DATA_IMPORT, async () => {
    const result = await dialog.showOpenDialog({
      title: 'Importar Dados',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (!result.canceled && result.filePaths.length > 0) {
      const raw = readFileSync(result.filePaths[0], 'utf-8')
      const data = JSON.parse(raw)
      if (!isValidAppData(data)) {
        return { success: false, error: 'Arquivo inválido: estrutura de dados não reconhecida' }
      }
      saveData(data)
      return { success: true, data }
    }
    return { success: false }
  })

  ipcMain.handle(IPC.ATTACHMENT_PICK, async () => {
    return pickAndSaveAttachment()
  })

  ipcMain.handle(IPC.ATTACHMENT_DELETE, (_event, relativePath: string) => {
    deleteAttachment(relativePath)
    return { success: true }
  })

  ipcMain.handle(IPC.ATTACHMENT_OPEN, (_event, relativePath: string) => {
    openAttachment(relativePath)
    return { success: true }
  })

  ipcMain.handle(IPC.UPDATE_CHECK, async () => {
    return checkForUpdate()
  })

  ipcMain.handle(IPC.UPDATE_DOWNLOAD, async (_event, url: string, filename: string) => {
    const result = await downloadUpdate(url, filename)
    if (result.success && result.filePath) {
      shell.showItemInFolder(result.filePath)
    }
    return result
  })

  ipcMain.handle(IPC.UPDATE_GET_VERSION, () => {
    return app.getVersion()
  })
}
