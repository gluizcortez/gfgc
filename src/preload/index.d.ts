export interface AttachmentResult {
  id: string
  name: string
  path: string
  size: number
  uploadedAt: string
}

export interface ElectronAPI {
  loadData: () => Promise<unknown>
  saveData: (data: unknown) => Promise<{ success: boolean }>
  exportData: (data: unknown) => Promise<{ success: boolean; path?: string }>
  importData: () => Promise<{ success: boolean; data?: unknown }>
  pickAttachment: () => Promise<AttachmentResult | null>
  deleteAttachment: (path: string) => Promise<{ success: boolean }>
  openAttachment: (path: string) => Promise<{ success: boolean }>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
