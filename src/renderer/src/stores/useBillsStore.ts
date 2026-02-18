import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type {
  Bill,
  BillEntry,
  BillStatus,
  MonthlyBillRecord,
  EntityId,
  MonthKey
} from '@/types/models'

interface BillsState {
  bills: Bill[]
  monthlyRecords: MonthlyBillRecord[]

  // Bill template CRUD
  addBill: (bill: Omit<Bill, 'id' | 'createdAt'>) => EntityId
  updateBill: (id: EntityId, updates: Partial<Bill>) => void
  deleteBill: (id: EntityId) => void

  // Monthly record operations
  getOrCreateMonthRecord: (workspaceId: EntityId, monthKey: MonthKey) => MonthlyBillRecord
  addBillEntry: (workspaceId: EntityId, monthKey: MonthKey, entry: Omit<BillEntry, 'id'>) => void
  updateBillEntry: (recordId: EntityId, entryId: EntityId, updates: Partial<BillEntry>) => void
  deleteBillEntry: (recordId: EntityId, entryId: EntityId) => void
  setBillEntryStatus: (recordId: EntityId, entryId: EntityId, status: BillStatus) => void
  generateMonthFromTemplates: (workspaceId: EntityId, monthKey: MonthKey) => void

  // Utility
  duplicateMonth: (workspaceId: EntityId, sourceMonth: MonthKey, targetMonth: MonthKey) => void

  // Cleanup
  deleteWorkspaceData: (workspaceId: EntityId) => void

  // Hydration
  hydrate: (bills: Bill[], records: MonthlyBillRecord[]) => void
}

export const useBillsStore = create<BillsState>()(
  immer((set, get) => ({
    bills: [],
    monthlyRecords: [],

    addBill: (bill) => {
      const id = nanoid()
      set((state) => {
        state.bills.push({
          ...bill,
          id,
          createdAt: new Date().toISOString()
        })
      })
      return id
    },

    updateBill: (id, updates) =>
      set((state) => {
        const bill = state.bills.find((b) => b.id === id)
        if (bill) Object.assign(bill, updates)
      }),

    deleteBill: (id) =>
      set((state) => {
        state.bills = state.bills.filter((b) => b.id !== id)
      }),

    getOrCreateMonthRecord: (workspaceId, monthKey) => {
      const existing = get().monthlyRecords.find(
        (r) => r.workspaceId === workspaceId && r.monthKey === monthKey
      )
      if (existing) return existing

      const record: MonthlyBillRecord = {
        id: nanoid(),
        workspaceId,
        monthKey,
        bills: []
      }
      set((state) => {
        state.monthlyRecords.push(record)
      })
      return record
    },

    addBillEntry: (workspaceId, monthKey, entry) =>
      set((state) => {
        let record = state.monthlyRecords.find(
          (r) => r.workspaceId === workspaceId && r.monthKey === monthKey
        )
        if (!record) {
          record = { id: nanoid(), workspaceId, monthKey, bills: [] }
          state.monthlyRecords.push(record)
        }
        record.bills.push({ ...entry, id: nanoid() })
      }),

    updateBillEntry: (recordId, entryId, updates) =>
      set((state) => {
        const record = state.monthlyRecords.find((r) => r.id === recordId)
        if (record) {
          const entry = record.bills.find((b) => b.id === entryId)
          if (entry) Object.assign(entry, updates)
        }
      }),

    deleteBillEntry: (recordId, entryId) =>
      set((state) => {
        const record = state.monthlyRecords.find((r) => r.id === recordId)
        if (record) {
          record.bills = record.bills.filter((b) => b.id !== entryId)
        }
      }),

    setBillEntryStatus: (recordId, entryId, status) =>
      set((state) => {
        const record = state.monthlyRecords.find((r) => r.id === recordId)
        if (record) {
          const entry = record.bills.find((b) => b.id === entryId)
          if (entry) {
            entry.status = status
            if (status === 'paid') {
              entry.paidDate = new Date().toISOString()
            } else {
              entry.paidDate = undefined
            }
          }
        }
      }),

    generateMonthFromTemplates: (workspaceId, monthKey) =>
      set((state) => {
        const existing = state.monthlyRecords.find(
          (r) => r.workspaceId === workspaceId && r.monthKey === monthKey
        )
        if (existing && existing.bills.length > 0) return

        const templates = state.bills.filter(
          (b) => b.workspaceId === workspaceId && b.isRecurring
        )

        const [year, month] = monthKey.split('-').map(Number)
        const entries: BillEntry[] = templates.map((t) => {
          const day = Math.min(t.dueDay, new Date(year, month, 0).getDate())
          return {
            id: nanoid(),
            billId: t.id,
            name: t.name,
            value: t.value,
            dueDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            status: 'pending' as BillStatus,
            notes: t.notes,
            categoryId: t.categoryId,
            customFields: { ...t.customFields },
            attachments: []
          }
        })

        if (existing) {
          existing.bills = entries
        } else {
          state.monthlyRecords.push({
            id: nanoid(),
            workspaceId,
            monthKey,
            bills: entries
          })
        }
      }),

    duplicateMonth: (workspaceId, sourceMonth, targetMonth) =>
      set((state) => {
        const sourceRecord = state.monthlyRecords.find(
          (r) => r.workspaceId === workspaceId && r.monthKey === sourceMonth
        )
        if (!sourceRecord || sourceRecord.bills.length === 0) return

        const clonedBills: BillEntry[] = sourceRecord.bills.map((bill) => {
          const newDueDate = bill.dueDate.replace(sourceMonth, targetMonth)
          return {
            ...bill,
            id: nanoid(),
            status: 'pending' as BillStatus,
            paidDate: undefined,
            dueDate: newDueDate,
            attachments: []
          }
        })

        const existing = state.monthlyRecords.find(
          (r) => r.workspaceId === workspaceId && r.monthKey === targetMonth
        )
        if (existing) {
          existing.bills = clonedBills
        } else {
          state.monthlyRecords.push({
            id: nanoid(),
            workspaceId,
            monthKey: targetMonth,
            bills: clonedBills
          })
        }
      }),

    deleteWorkspaceData: (workspaceId) =>
      set((state) => {
        state.bills = state.bills.filter((b) => b.workspaceId !== workspaceId)
        state.monthlyRecords = state.monthlyRecords.filter((r) => r.workspaceId !== workspaceId)
      }),

    hydrate: (bills, records) =>
      set((state) => {
        state.bills = bills
        state.monthlyRecords = records
      })
  }))
)
