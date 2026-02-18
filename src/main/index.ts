import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerIpcHandlers } from './ipc-handlers'
import { createBackup, cleanOldBackups } from './backup'
import { loadData } from './storage'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    title: 'GFGC - Gestão Financeira',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (is.dev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function runBackup(): void {
  try {
    const userData = app.getPath('userData')
    const dataFile = join(userData, 'gfgc-data.json')
    const backupsDir = join(userData, 'backups')

    if (!existsSync(dataFile)) return

    const data = loadData() as { settings?: { backupEnabled?: boolean; backupRetentionCount?: number } }
    const enabled = data.settings?.backupEnabled !== false
    const retention = data.settings?.backupRetentionCount || 10

    if (enabled) {
      createBackup(dataFile, backupsDir)
      cleanOldBackups(backupsDir, retention)
    }
  } catch (err) {
    console.error('Backup error:', err)
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.gfgc.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()
  runBackup()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
