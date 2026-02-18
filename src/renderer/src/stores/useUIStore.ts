import { create } from 'zustand'
import type { AppSection, EntityId } from '@/types/models'
import { getCurrentMonthKey } from '@/lib/formatters'

interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UIState {
  activeSection: AppSection
  sidebarCollapsed: boolean
  activeModal: string | null
  modalData: unknown
  notifications: Notification[]
  isLoading: boolean

  // Bills view state
  activeBillsWorkspaceId: EntityId | null
  activeBillsMonth: string

  // Investments view state
  activeInvestmentsWorkspaceId: EntityId | null
  activeInvestmentsMonth: string

  // FGTS view state
  activeFGTSWorkspaceId: EntityId | null

  setActiveSection: (section: AppSection) => void
  toggleSidebar: () => void
  openModal: (modal: string, data?: unknown) => void
  closeModal: () => void
  addNotification: (message: string, type: Notification['type']) => void
  removeNotification: (id: string) => void
  setLoading: (loading: boolean) => void

  setActiveBillsWorkspace: (id: EntityId | null) => void
  setActiveBillsMonth: (month: string) => void
  setActiveInvestmentsWorkspace: (id: EntityId | null) => void
  setActiveInvestmentsMonth: (month: string) => void
  setActiveFGTSWorkspace: (id: EntityId | null) => void
}

let notifCounter = 0

export const useUIStore = create<UIState>()((set) => ({
  activeSection: 'dashboard',
  sidebarCollapsed: false,
  activeModal: null,
  modalData: null,
  notifications: [],
  isLoading: true,

  activeBillsWorkspaceId: null,
  activeBillsMonth: getCurrentMonthKey(),
  activeInvestmentsWorkspaceId: null,
  activeInvestmentsMonth: getCurrentMonthKey(),
  activeFGTSWorkspaceId: null,

  setActiveSection: (section) => set({ activeSection: section }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  openModal: (modal, data) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  addNotification: (message, type) => {
    const id = String(++notifCounter)
    set((s) => ({ notifications: [...s.notifications, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }))
    }, 3000)
  },

  removeNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  setLoading: (loading) => set({ isLoading: loading }),

  setActiveBillsWorkspace: (id) => set({ activeBillsWorkspaceId: id }),
  setActiveBillsMonth: (month) => set({ activeBillsMonth: month }),
  setActiveInvestmentsWorkspace: (id) => set({ activeInvestmentsWorkspaceId: id }),
  setActiveInvestmentsMonth: (month) => set({ activeInvestmentsMonth: month }),
  setActiveFGTSWorkspace: (id) => set({ activeFGTSWorkspaceId: id })
}))
