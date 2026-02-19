export interface AttachmentResult {
  id: string
  name: string
  path: string
  size: number
  uploadedAt: string
}

export interface UpdateAsset {
  name: string
  url: string
  size: number
}

export interface UpdateCheckResult {
  hasUpdate: boolean
  currentVersion: string
  latestVersion: string
  assets: UpdateAsset[]
}

export interface ElectronAPI {
  loadData: () => Promise<unknown>
  saveData: (data: unknown) => Promise<{ success: boolean }>
  exportData: (data: unknown) => Promise<{ success: boolean; path?: string }>
  importData: () => Promise<{ success: boolean; data?: unknown }>
  pickAttachment: () => Promise<AttachmentResult | null>
  deleteAttachment: (path: string) => Promise<{ success: boolean }>
  openAttachment: (path: string) => Promise<{ success: boolean }>
  checkForUpdate: () => Promise<UpdateCheckResult>
  downloadUpdate: (url: string, filename: string) => Promise<{ success: boolean; filePath?: string }>
  getAppVersion: () => Promise<string>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
