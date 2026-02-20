import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type { IncomeEntry, EntityId, MonthKey } from '@/types/models'

interface IncomeState {
  entries: IncomeEntry[]

  addEntry: (entry: Omit<IncomeEntry, 'id'>) => EntityId
  updateEntry: (id: EntityId, updates: Partial<IncomeEntry>) => void
  deleteEntry: (id: EntityId) => void
  generateRecurringForMonth: (monthKey: MonthKey, workspaceId: EntityId) => number
  removeRecurrence: (name: string, category: string, workspaceId: EntityId) => void
  restoreRecurrence: (name: string, category: string, workspaceId: EntityId) => void
  deleteWorkspaceData: (workspaceId: EntityId) => void

  hydrate: (entries: IncomeEntry[]) => void
}

export const useIncomeStore = create<IncomeState>()(
  immer((set, get) => ({
    entries: [],

    addEntry: (entry) => {
      const id = nanoid()
      set((state) => {
        state.entries.push({ ...entry, id })
      })
      return id
    },

    updateEntry: (id, updates) =>
      set((state) => {
        const entry = state.entries.find((e) => e.id === id)
        if (entry) Object.assign(entry, updates)
      }),

    deleteEntry: (id) =>
      set((state) => {
        state.entries = state.entries.filter((e) => e.id !== id)
      }),

    generateRecurringForMonth: (monthKey, workspaceId) => {
      const { entries } = get()
      const wsEntries = entries.filter((e) => e.workspaceId === workspaceId)
      const existingInMonth = wsEntries.filter((e) => e.monthKey === monthKey)
      const recurringTemplates = wsEntries.filter((e) => e.isRecurring && e.monthKey < monthKey)

      // Deduplicate: keep only the latest entry per recurring name+category
      const templateMap = new Map<string, IncomeEntry>()
      for (const t of recurringTemplates) {
        const key = `${t.name}::${t.category}`
        const existing = templateMap.get(key)
        if (!existing || t.monthKey > existing.monthKey) {
          templateMap.set(key, t)
        }
      }

      let count = 0
      const [yearStr, monthStr] = monthKey.split('-')
      const dayPad = (d: number): string => String(d).padStart(2, '0')

      set((state) => {
        for (const template of templateMap.values()) {
          // Skip if already exists in this month (same name + category)
          const alreadyExists = existingInMonth.some(
            (e) => e.name === template.name && e.category === template.category
          )
          if (alreadyExists) continue

          // Adjust date to new month
          const origDay = parseInt(template.date.split('-')[2])
          const maxDay = new Date(Number(yearStr), Number(monthStr), 0).getDate()
          const day = Math.min(origDay, maxDay)

          state.entries.push({
            id: nanoid(),
            workspaceId,
            monthKey,
            name: template.name,
            amount: template.amount,
            category: template.category,
            date: `${yearStr}-${monthStr}-${dayPad(day)}`,
            notes: template.notes,
            isRecurring: true
          })
          count++
        }
      })

      return count
    },

    removeRecurrence: (name, category, workspaceId) =>
      set((state) => {
        // Only update the latest entry matching this name+category+workspace
        const matches = state.entries
          .filter((e) => e.name === name && e.category === category && e.workspaceId === workspaceId)
          .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
        if (matches.length > 0) {
          matches[0].isRecurring = false
        }
      }),

    restoreRecurrence: (name, category, workspaceId) =>
      set((state) => {
        // Restore all entries matching this name+category+workspace
        for (const entry of state.entries) {
          if (entry.name === name && entry.category === category && entry.workspaceId === workspaceId) {
            entry.isRecurring = true
          }
        }
      }),

    deleteWorkspaceData: (workspaceId) =>
      set((state) => {
        state.entries = state.entries.filter((e) => e.workspaceId !== workspaceId)
      }),

    hydrate: (entries) =>
      set((state) => {
        state.entries = entries
      })
  }))
)
