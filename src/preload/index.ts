import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipc-channels'

const api = {
  loadData: (): Promise<unknown> => ipcRenderer.invoke(IPC.DATA_LOAD),
  saveData: (data: unknown): Promise<unknown> => ipcRenderer.invoke(IPC.DATA_SAVE, data),
  exportData: (data: unknown): Promise<unknown> => ipcRenderer.invoke(IPC.DATA_EXPORT, data),
  importData: (): Promise<unknown> => ipcRenderer.invoke(IPC.DATA_IMPORT),
  pickAttachment: (): Promise<unknown> => ipcRenderer.invoke(IPC.ATTACHMENT_PICK),
  deleteAttachment: (path: string): Promise<unknown> => ipcRenderer.invoke(IPC.ATTACHMENT_DELETE, path),
  openAttachment: (path: string): Promise<unknown> => ipcRenderer.invoke(IPC.ATTACHMENT_OPEN, path)
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('api', api)
} else {
  // @ts-expect-error fallback for non-isolated context
  window.api = api
}
