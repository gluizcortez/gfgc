import { useMemo, useState, useEffect } from 'react'
import { Wallet } from 'lucide-react'
import { clsx } from 'clsx'
import { NetWorthEvolutionChart } from './NetWorthEvolutionChart'
import { AssetBreakdownCards } from './AssetBreakdownCards'
import { EmptyState } from '@/components/shared/EmptyState'
import { useInvestmentsStore } from '@/stores/useInvestmentsStore'
import { useFGTSStore } from '@/stores/useFGTSStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { calculateNetWorth } from '@/lib/calculations'
import { formatCurrency, getCurrentMonthKey } from '@/lib/formatters'

export function NetWorthPage(): React.JSX.Element {
  const investments = useInvestmentsStore((s) => s.investments)
  const transactions = useInvestmentsStore((s) => s.transactions)
  const fgtsRecords = useFGTSStore((s) => s.records)
  const workspaces = useSettingsStore((s) => s.workspaces)

  const investmentWorkspaces = useMemo(
    () => workspaces.filter((w) => w.type === 'investments'),
    [workspaces]
  )
  const fgtsWorkspaces = useMemo(
    () => workspaces.filter((w) => w.type === 'fgts'),
    [workspaces]
  )

  // 'all' | workspace id
  const [activeTab, setActiveTab] = useState<string>('all')

  const tabs = useMemo(() => {
    const result: { id: string; label: string; type: 'all' | 'investments' | 'fgts' }[] = [
      { id: 'all', label: 'Todos', type: 'all' }
    ]
    for (const ws of investmentWorkspaces) {
      result.push({ id: ws.id, label: ws.name, type: 'investments' })
    }
    for (const ws of fgtsWorkspaces) {
      result.push({ id: ws.id, label: `FGTS · ${ws.name}`, type: 'fgts' })
    }
    return result
  }, [investmentWorkspaces, fgtsWorkspaces])

  // Reset to 'all' if the selected workspace tab no longer exists (was deleted)
  useEffect(() => {
    if (!tabs.find((t) => t.id === activeTab)) {
      setActiveTab('all')
    }
  }, [tabs, activeTab])

  const activeTabInfo = tabs.find((t) => t.id === activeTab) ?? tabs[0]

  const filteredInvestments = useMemo(() => {
    const active = investments.filter((i) => i.isActive)
    if (activeTabInfo.type === 'fgts') return []
    if (activeTabInfo.type === 'investments') return active.filter((i) => i.workspaceId === activeTab)
    return active
  }, [investments, activeTab, activeTabInfo])

  const filteredTransactions = useMemo(() => {
    if (activeTabInfo.type === 'fgts') return []
    if (activeTabInfo.type === 'investments') return transactions.filter((t) => t.workspaceId === activeTab)
    return transactions
  }, [transactions, activeTab, activeTabInfo])

  const filteredFgtsRecords = useMemo(() => {
    if (activeTabInfo.type === 'investments') return []
    if (activeTabInfo.type === 'fgts') return fgtsRecords.filter((r) => r.workspaceId === activeTab)
    return fgtsRecords
  }, [fgtsRecords, activeTab, activeTabInfo])

  const netWorth = useMemo(
    () => calculateNetWorth(filteredInvestments, filteredFgtsRecords),
    [filteredInvestments, filteredFgtsRecords]
  )

  const investTotal = useMemo(
    () => filteredInvestments.reduce((sum, i) => sum + i.currentBalance, 0),
    [filteredInvestments]
  )

  const fgtsLatest = useMemo(() => {
    const sorted = [...filteredFgtsRecords].sort((a, b) => b.monthKey.localeCompare(a.monthKey))
    return sorted[0]?.balance || 0
  }, [filteredFgtsRecords])

  const hasAnyData = investments.filter((i) => i.isActive).length > 0 || fgtsRecords.length > 0

  if (!hasAnyData) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-bold text-gray-900">Patrimônio</h1>
        <EmptyState
          icon={Wallet}
          title="Sem dados patrimoniais"
          description="Registre investimentos ou saldo do FGTS para acompanhar seu patrimônio."
        />
      </div>
    )
  }

  const hasTabData = filteredInvestments.length > 0 || filteredFgtsRecords.length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      {tabs.length > 1 && (
        <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-4 pt-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-b-2 border-primary-600 text-primary-700'
                  : 'text-gray-500 hover:text-gray-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Patrimônio</h1>
          <p className="mt-1 text-xs text-gray-400">
            O cálculo de patrimônio considera apenas investimentos e FGTS. Metas financeiras não são incluídas.
          </p>
        </div>

        {!hasTabData ? (
          <EmptyState
            icon={Wallet}
            title="Sem dados nesta aba"
            description="Não há investimentos ou registros de FGTS para este grupo."
          />
        ) : (
          <>
            {/* Total card */}
            <div className="mb-6 rounded-xl border border-primary-200 bg-primary-50 p-5">
              <p className="text-sm font-medium text-primary-600">Patrimônio Total</p>
              <p className="mt-1 text-3xl font-bold text-primary-900">{formatCurrency(netWorth)}</p>
              <div className="mt-2 flex gap-6 text-sm text-primary-700">
                {investTotal > 0 && <span>Investimentos: {formatCurrency(investTotal)}</span>}
                {fgtsLatest > 0 && <span>FGTS: {formatCurrency(fgtsLatest)}</span>}
              </div>
            </div>

            {/* Asset breakdown */}
            <div className="mb-6">
              <AssetBreakdownCards
                investments={filteredInvestments}
                fgtsBalance={fgtsLatest}
                netWorth={netWorth}
              />
            </div>

            {/* Evolution chart */}
            <NetWorthEvolutionChart
              investments={filteredInvestments}
              transactions={filteredTransactions}
              fgtsRecords={filteredFgtsRecords}
              currentMonth={getCurrentMonthKey()}
            />
          </>
        )}
      </div>
    </div>
  )
}
