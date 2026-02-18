import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'fs'

let dataDir: string | null = null
let dataFile: string | null = null
let tempFile: string | null = null

function getPaths(): { dataDir: string; dataFile: string; tempFile: string } {
  if (!dataDir) {
    dataDir = app.getPath('userData')
    dataFile = join(dataDir, 'gfgc-data.json')
    tempFile = join(dataDir, 'gfgc-data.tmp.json')
  }
  return { dataDir, dataFile: dataFile!, tempFile: tempFile! }
}

function getDefaultData(): object {
  return {
    version: 1,
    settings: {
      currency: 'BRL',
      locale: 'pt-BR',
      theme: 'light',
      defaultView: 'bills',
      categories: [
        { id: 'cat-1', name: 'Moradia', color: '#6366f1', type: 'bill', isDefault: true, sortOrder: 0 },
        { id: 'cat-2', name: 'Transporte', color: '#f59e0b', type: 'bill', isDefault: true, sortOrder: 1 },
        { id: 'cat-3', name: 'Alimentação', color: '#10b981', type: 'bill', isDefault: true, sortOrder: 2 },
        { id: 'cat-4', name: 'Saúde', color: '#ef4444', type: 'bill', isDefault: true, sortOrder: 3 },
        { id: 'cat-5', name: 'Educação', color: '#3b82f6', type: 'bill', isDefault: true, sortOrder: 4 },
        { id: 'cat-6', name: 'Lazer', color: '#8b5cf6', type: 'bill', isDefault: true, sortOrder: 5 },
        { id: 'cat-7', name: 'Serviços', color: '#06b6d4', type: 'bill', isDefault: true, sortOrder: 6 },
        { id: 'cat-8', name: 'Seguros', color: '#84cc16', type: 'bill', isDefault: true, sortOrder: 7 },
        { id: 'cat-9', name: 'Outros', color: '#737373', type: 'both', isDefault: true, sortOrder: 8 },
        { id: 'cat-10', name: 'Renda Fixa', color: '#0ea5e9', type: 'investment', isDefault: true, sortOrder: 9 },
        { id: 'cat-11', name: 'Renda Variável', color: '#f97316', type: 'investment', isDefault: true, sortOrder: 10 },
        { id: 'cat-12', name: 'Criptomoedas', color: '#a855f7', type: 'investment', isDefault: true, sortOrder: 11 }
      ],
      customFields: [],
      lastOpenedWorkspaceId: undefined,
      lastOpenedMonth: undefined,
      backupEnabled: true,
      backupRetentionCount: 10,
      autoGenerateRecurringBills: true
    },
    workspaces: [],
    bills: [],
    monthlyBillRecords: [],
    investments: [],
    investmentTransactions: [],
    goals: [],
    fgtsRecords: [],
    incomeEntries: []
  }
}

export function loadData(): object {
  const paths = getPaths()
  try {
    if (!existsSync(paths.dataFile)) {
      const defaultData = getDefaultData()
      saveData(defaultData)
      return defaultData
    }
    const raw = readFileSync(paths.dataFile, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Error loading data file:', err)
    return getDefaultData()
  }
}

export function saveData(data: object): void {
  const paths = getPaths()
  try {
    if (!existsSync(paths.dataDir)) {
      mkdirSync(paths.dataDir, { recursive: true })
    }
    writeFileSync(paths.tempFile, JSON.stringify(data, null, 2), 'utf-8')
    renameSync(paths.tempFile, paths.dataFile)
  } catch (err) {
    console.error('Failed to save data:', err)
  }
}
