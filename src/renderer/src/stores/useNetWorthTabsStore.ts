import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type { NetWorthTab, EntityId } from '@/types/models'

interface NetWorthTabsState {
  tabs: NetWorthTab[]

  addTab: (data: { name: string; investmentWorkspaceIds: EntityId[]; fgtsWorkspaceIds: EntityId[] }) => EntityId
  updateTab: (id: EntityId, updates: Partial<NetWorthTab>) => void
  deleteTab: (id: EntityId) => void

  hydrate: (tabs: NetWorthTab[]) => void
}

export const useNetWorthTabsStore = create<NetWorthTabsState>()(
  immer((set) => ({
    tabs: [],

    addTab: (data) => {
      const id = nanoid()
      set((state) => {
        const maxOrder = state.tabs.reduce((max, t) => Math.max(max, t.sortOrder), -1)
        state.tabs.push({
          ...data,
          id,
          sortOrder: maxOrder + 1,
          createdAt: new Date().toISOString()
        })
      })
      return id
    },

    updateTab: (id, updates) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === id)
        if (tab) Object.assign(tab, updates)
      }),

    deleteTab: (id) =>
      set((state) => {
        state.tabs = state.tabs.filter((t) => t.id !== id)
      }),

    hydrate: (tabs) =>
      set((state) => {
        state.tabs = tabs || []
      })
  }))
)
