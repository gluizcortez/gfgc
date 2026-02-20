import { useEffect, useRef } from 'react'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useBillsStore } from '@/stores/useBillsStore'
import { useInvestmentsStore } from '@/stores/useInvestmentsStore'
import { useGoalsStore } from '@/stores/useGoalsStore'
import { useFGTSStore } from '@/stores/useFGTSStore'
import { useIncomeStore } from '@/stores/useIncomeStore'
import type { AppData } from '@/types/models'

function collectAppData(): AppData {
  const { settings, workspaces } = useSettingsStore.getState()
  const { bills, monthlyRecords: monthlyBillRecords } = useBillsStore.getState()
  const { investments, transactions: investmentTransactions } = useInvestmentsStore.getState()
  const { goals } = useGoalsStore.getState()
  const { records: fgtsRecords } = useFGTSStore.getState()
  const { entries: incomeEntries } = useIncomeStore.getState()

  return {
    version: 1,
    settings,
    workspaces,
    bills,
    monthlyBillRecords,
    investments,
    investmentTransactions,
    goals,
    fgtsRecords,
    incomeEntries
  }
}

export function usePersistence(): void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const save = (): void => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        if (!window.api) return
        const data = collectAppData()
        window.api.saveData(data).catch((err) => console.error('Save failed:', err))
      }, 500)
    }

    const unsubs = [
      useSettingsStore.subscribe(save),
      useBillsStore.subscribe(save),
      useInvestmentsStore.subscribe(save),
      useGoalsStore.subscribe(save),
      useFGTSStore.subscribe(save),
      useIncomeStore.subscribe(save)
    ]

    // Flush pending save immediately when window is closing
    const flushOnClose = (): void => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
        if (window.api) {
          const data = collectAppData()
          window.api.saveData(data).catch(() => {})
        }
      }
    }
    window.addEventListener('beforeunload', flushOnClose)

    return () => {
      unsubs.forEach((unsub) => unsub())
      window.removeEventListener('beforeunload', flushOnClose)
      flushOnClose()
    }
  }, [])
}

export async function loadAndHydrate(): Promise<void> {
  if (!window.api) {
    console.warn('window.api not available, using defaults')
    return
  }

  try {
    const raw = (await window.api.loadData()) as AppData
    if (!raw) return

    if (raw.settings && raw.workspaces) {
      useSettingsStore.getState().hydrate(raw.settings, raw.workspaces)
    }
    if (raw.bills || raw.monthlyBillRecords) {
      useBillsStore.getState().hydrate(raw.bills || [], raw.monthlyBillRecords || [])
    }
    if (raw.investments || raw.investmentTransactions) {
      useInvestmentsStore.getState().hydrate(raw.investments || [], raw.investmentTransactions || [])
    }
    if (raw.goals) {
      useGoalsStore.getState().hydrate(raw.goals)
    }
    if (raw.fgtsRecords) {
      useFGTSStore.getState().hydrate(raw.fgtsRecords)
    }
    if (raw.incomeEntries) {
      useIncomeStore.getState().hydrate(raw.incomeEntries)
    }
  } catch (err) {
    console.error('Error loading data:', err)
  }
}
