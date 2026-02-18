import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type { AppSettings, Workspace, Category, CustomField, EntityId, AppTheme } from '@/types/models'
import { DEFAULT_CATEGORIES, WORKSPACE_COLORS } from '@/lib/constants'

interface SettingsState {
  settings: AppSettings
  workspaces: Workspace[]

  // Settings actions
  updateTheme: (theme: AppTheme) => void
  updateSettings: (partial: Partial<AppSettings>) => void

  // Category actions
  addCategory: (category: Omit<Category, 'id' | 'sortOrder'>) => void
  updateCategory: (id: EntityId, updates: Partial<Category>) => void
  deleteCategory: (id: EntityId) => void

  // Custom field actions
  addCustomField: (field: Omit<CustomField, 'id'>) => void
  updateCustomField: (id: EntityId, updates: Partial<CustomField>) => void
  deleteCustomField: (id: EntityId) => void

  // Workspace actions
  addWorkspace: (name: string, type: 'bills' | 'investments' | 'fgts') => EntityId
  updateWorkspace: (id: EntityId, updates: Partial<Workspace>) => void
  deleteWorkspace: (id: EntityId) => void
  reorderWorkspaces: (ids: EntityId[]) => void

  // Hydration
  hydrate: (settings: AppSettings, workspaces: Workspace[]) => void
}

const defaultSettings: AppSettings = {
  currency: 'BRL',
  locale: 'pt-BR',
  theme: 'light',
  defaultView: 'bills',
  categories: DEFAULT_CATEGORIES,
  customFields: [],
  backupEnabled: true,
  backupRetentionCount: 10,
  autoGenerateRecurringBills: true
}

export const useSettingsStore = create<SettingsState>()(
  immer((set) => ({
    settings: defaultSettings,
    workspaces: [],

    updateTheme: (theme) =>
      set((state) => {
        state.settings.theme = theme
      }),

    updateSettings: (partial) =>
      set((state) => {
        Object.assign(state.settings, partial)
      }),

    addCategory: (category) =>
      set((state) => {
        const maxOrder = state.settings.categories.reduce((max, c) => Math.max(max, c.sortOrder), -1)
        state.settings.categories.push({
          ...category,
          id: nanoid(),
          sortOrder: maxOrder + 1
        })
      }),

    updateCategory: (id, updates) =>
      set((state) => {
        const cat = state.settings.categories.find((c) => c.id === id)
        if (cat) Object.assign(cat, updates)
      }),

    deleteCategory: (id) =>
      set((state) => {
        state.settings.categories = state.settings.categories.filter((c) => c.id !== id)
      }),

    addCustomField: (field) =>
      set((state) => {
        state.settings.customFields.push({ ...field, id: nanoid() })
      }),

    updateCustomField: (id, updates) =>
      set((state) => {
        const field = state.settings.customFields.find((f) => f.id === id)
        if (field) Object.assign(field, updates)
      }),

    deleteCustomField: (id) =>
      set((state) => {
        state.settings.customFields = state.settings.customFields.filter((f) => f.id !== id)
      }),

    addWorkspace: (name, type) => {
      const id = nanoid()
      set((state) => {
        const sameType = state.workspaces.filter((w) => w.type === type)
        const colorIndex = sameType.length % WORKSPACE_COLORS.length
        state.workspaces.push({
          id,
          name,
          type,
          color: WORKSPACE_COLORS[colorIndex],
          createdAt: new Date().toISOString(),
          sortOrder: sameType.length
        })
      })
      return id
    },

    updateWorkspace: (id, updates) =>
      set((state) => {
        const ws = state.workspaces.find((w) => w.id === id)
        if (ws) Object.assign(ws, updates)
      }),

    deleteWorkspace: (id) =>
      set((state) => {
        state.workspaces = state.workspaces.filter((w) => w.id !== id)
      }),

    reorderWorkspaces: (ids) =>
      set((state) => {
        ids.forEach((id, index) => {
          const ws = state.workspaces.find((w) => w.id === id)
          if (ws) ws.sortOrder = index
        })
      }),

    hydrate: (settings, workspaces) =>
      set((state) => {
        state.settings = settings
        state.workspaces = workspaces
      })
  }))
)
