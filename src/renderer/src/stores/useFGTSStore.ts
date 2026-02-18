import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type { FGTSRecord, EntityId, MonthKey } from '@/types/models'

interface FGTSState {
  records: FGTSRecord[]

  addRecord: (data: { workspaceId: EntityId; monthKey: MonthKey; balance: number; notes: string }) => EntityId
  updateRecord: (id: EntityId, updates: Partial<FGTSRecord>) => void
  deleteRecord: (id: EntityId) => void

  deleteWorkspaceData: (workspaceId: EntityId) => void

  hydrate: (records: FGTSRecord[]) => void
}

export const useFGTSStore = create<FGTSState>()(
  immer((set) => ({
    records: [],

    addRecord: (data) => {
      const id = nanoid()
      set((state) => {
        state.records.push({
          ...data,
          id,
          date: new Date().toISOString()
        })
      })
      return id
    },

    updateRecord: (id, updates) =>
      set((state) => {
        const record = state.records.find((r) => r.id === id)
        if (record) Object.assign(record, updates)
      }),

    deleteRecord: (id) =>
      set((state) => {
        state.records = state.records.filter((r) => r.id !== id)
      }),

    deleteWorkspaceData: (workspaceId) =>
      set((state) => {
        state.records = state.records.filter((r) => r.workspaceId !== workspaceId)
      }),

    hydrate: (records) =>
      set((state) => {
        state.records = records || []
      })
  }))
)
