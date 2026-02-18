import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type { IncomeEntry, IncomeCategory, EntityId, MonthKey } from '@/types/models'

interface IncomeState {
  entries: IncomeEntry[]

  addEntry: (entry: Omit<IncomeEntry, 'id'>) => EntityId
  updateEntry: (id: EntityId, updates: Partial<IncomeEntry>) => void
  deleteEntry: (id: EntityId) => void

  hydrate: (entries: IncomeEntry[]) => void
}

export const useIncomeStore = create<IncomeState>()(
  immer((set) => ({
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

    hydrate: (entries) =>
      set((state) => {
        state.entries = entries
      })
  }))
)
