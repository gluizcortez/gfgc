import { useMemo } from 'react'
import { Wallet } from 'lucide-react'
import { NetWorthEvolutionChart } from './NetWorthEvolutionChart'
import { AssetBreakdownCards } from './AssetBreakdownCards'
import { EmptyState } from '@/components/shared/EmptyState'
import { useInvestmentsStore } from '@/stores/useInvestmentsStore'
import { useFGTSStore } from '@/stores/useFGTSStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { calculateNetWorth } from '@/lib/calculations'
import { formatCurrency, getCurrentMonthKey } from '@/lib/formatters'
import type { Investment } from '@/types/models'

export function NetWorthPage(): React.JSX.Element {
  const investments = useInvestmentsStore((s) => s.investments)
  const transactions = useInvestmentsStore((s) => s.transactions)
  const fgtsRecords = useFGTSStore((s) => s.records)
  const workspaces = useSettingsStore((s) => s.workspaces)

  const activeInvestments = useMemo(() => investments.filter((i) => i.isActive), [investments])

  const netWorth = useMemo(
    () => calculateNetWorth(activeInvestments, fgtsRecords),
    [activeInvestments, fgtsRecords]
  )

  const investTotal = useMemo(
    () => activeInvestments.reduce((sum, i) => sum + i.currentBalance, 0),
    [activeInvestments]
  )

  const fgtsLatest = useMemo(() => {
    const sorted = [...fgtsRecords].sort((a, b) => b.monthKey.localeCompare(a.monthKey))
    return sorted[0]?.balance || 0
  }, [fgtsRecords])

  const hasData = activeInvestments.length > 0 || fgtsRecords.length > 0

  if (!hasData) {
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Patrimônio</h1>
      </div>

      {/* Total card */}
      <div className="mb-6 rounded-xl border border-primary-200 bg-primary-50 p-5">
        <p className="text-sm font-medium text-primary-600">Patrimônio Total</p>
        <p className="mt-1 text-3xl font-bold text-primary-900">{formatCurrency(netWorth)}</p>
        <div className="mt-2 flex gap-6 text-sm text-primary-700">
          <span>Investimentos: {formatCurrency(investTotal)}</span>
          {fgtsLatest > 0 && <span>FGTS: {formatCurrency(fgtsLatest)}</span>}
        </div>
      </div>

      {/* Asset breakdown */}
      <div className="mb-6">
        <AssetBreakdownCards
          investments={activeInvestments}
          fgtsBalance={fgtsLatest}
          netWorth={netWorth}
        />
      </div>

      {/* Evolution chart */}
      <NetWorthEvolutionChart
        investments={activeInvestments}
        transactions={transactions}
        fgtsRecords={fgtsRecords}
        currentMonth={getCurrentMonthKey()}
      />
    </div>
  )
}
