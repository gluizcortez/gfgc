import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type {
  Investment,
  InvestmentTransaction,
  InvestmentType,
  TransactionType,
  EntityId,
  MonthKey
} from '@/types/models'

interface InvestmentsState {
  investments: Investment[]
  transactions: InvestmentTransaction[]

  // Investment CRUD
  addInvestment: (data: { workspaceId: EntityId; name: string; type: InvestmentType; notes: string }) => EntityId
  updateInvestment: (id: EntityId, updates: Partial<Investment>) => void
  deleteInvestment: (id: EntityId) => void

  // Transaction operations
  addTransaction: (data: {
    investmentId: EntityId
    workspaceId: EntityId
    type: TransactionType
    amount: number
    monthKey: MonthKey
    notes: string
  }) => void
  deleteTransaction: (transactionId: EntityId) => void

  // Recalculate balance from transactions
  recalculateBalance: (investmentId: EntityId) => void

  // Cleanup
  deleteWorkspaceData: (workspaceId: EntityId) => void

  // Hydration
  hydrate: (investments: Investment[], transactions: InvestmentTransaction[]) => void
}

export const useInvestmentsStore = create<InvestmentsState>()(
  immer((set, get) => ({
    investments: [],
    transactions: [],

    addInvestment: (data) => {
      const id = nanoid()
      set((state) => {
        state.investments.push({
          id,
          workspaceId: data.workspaceId,
          name: data.name,
          type: data.type,
          currentBalance: 0,
          notes: data.notes,
          isActive: true,
          createdAt: new Date().toISOString()
        })
      })
      return id
    },

    updateInvestment: (id, updates) =>
      set((state) => {
        const inv = state.investments.find((i) => i.id === id)
        if (inv) Object.assign(inv, updates)
      }),

    deleteInvestment: (id) =>
      set((state) => {
        state.investments = state.investments.filter((i) => i.id !== id)
        state.transactions = state.transactions.filter((t) => t.investmentId !== id)
      }),

    addTransaction: (data) =>
      set((state) => {
        state.transactions.push({
          ...data,
          id: nanoid(),
          date: new Date().toISOString(),
          attachments: []
        })
        // Update balance
        const inv = state.investments.find((i) => i.id === data.investmentId)
        if (inv) {
          if (data.type === 'contribution' || data.type === 'yield') {
            inv.currentBalance += data.amount
          } else {
            inv.currentBalance -= data.amount
          }
        }
      }),

    deleteTransaction: (transactionId) =>
      set((state) => {
        const tx = state.transactions.find((t) => t.id === transactionId)
        if (tx) {
          const inv = state.investments.find((i) => i.id === tx.investmentId)
          if (inv) {
            if (tx.type === 'contribution' || tx.type === 'yield') {
              inv.currentBalance -= tx.amount
            } else {
              inv.currentBalance += tx.amount
            }
          }
          state.transactions = state.transactions.filter((t) => t.id !== transactionId)
        }
      }),

    recalculateBalance: (investmentId) =>
      set((state) => {
        const inv = state.investments.find((i) => i.id === investmentId)
        if (inv) {
          const txs = state.transactions.filter((t) => t.investmentId === investmentId)
          inv.currentBalance = txs.reduce((sum, tx) => {
            return (tx.type === 'contribution' || tx.type === 'yield') ? sum + tx.amount : sum - tx.amount
          }, 0)
        }
      }),

    deleteWorkspaceData: (workspaceId) =>
      set((state) => {
        const invIds = state.investments.filter((i) => i.workspaceId === workspaceId).map((i) => i.id)
        state.investments = state.investments.filter((i) => i.workspaceId !== workspaceId)
        state.transactions = state.transactions.filter((t) => !invIds.includes(t.investmentId))
      }),

    hydrate: (investments, transactions) =>
      set((state) => {
        state.investments = investments || []
        state.transactions = transactions || []
      })
  }))
)
