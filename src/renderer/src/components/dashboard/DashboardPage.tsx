import { useState, useMemo } from 'react'
import { LayoutDashboard } from 'lucide-react'
import { MonthNavigator } from '@/components/layout/MonthNavigator'
import { SummaryCards } from './SummaryCards'
import { AlertCards } from './AlertCards'
import { ExpensePieChart } from './ExpensePieChart'
import { InvestmentLineChart } from './InvestmentLineChart'
import { PlannedVsActualBarChart } from './PlannedVsActualBarChart'
import { FGTSDashboardChart } from './FGTSDashboardChart'
import { PortfolioPieChart } from './PortfolioPieChart'
import { InvestmentBreakdownChart } from './InvestmentBreakdownChart'
import { ExpenseTrendChart } from './ExpenseTrendChart'
import { CategoryTrendChart } from './CategoryTrendChart'
import { EmptyState } from '@/components/shared/EmptyState'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useBillsStore } from '@/stores/useBillsStore'
import { useInvestmentsStore } from '@/stores/useInvestmentsStore'
import { useGoalsStore } from '@/stores/useGoalsStore'
import { useFGTSStore } from '@/stores/useFGTSStore'
import { getCurrentMonthKey } from '@/lib/formatters'

export function DashboardPage(): React.JSX.Element {
  const [month, setMonth] = useState(getCurrentMonthKey())

  const workspaces = useSettingsStore((s) => s.workspaces)
  const categories = useSettingsStore((s) => s.settings.categories)
  const billRecords = useBillsStore((s) => s.monthlyRecords)
  const investments = useInvestmentsStore((s) => s.investments)
  const transactions = useInvestmentsStore((s) => s.transactions)
  const goals = useGoalsStore((s) => s.goals)
  const fgtsRecords = useFGTSStore((s) => s.records)

  const billWorkspaces = useMemo(() => workspaces.filter((w) => w.type === 'bills'), [workspaces])
  const investWorkspaces = useMemo(() => workspaces.filter((w) => w.type === 'investments'), [workspaces])

  const [selectedBillWs, setSelectedBillWs] = useState<string[]>([])
  const [selectedInvestWs, setSelectedInvestWs] = useState<string[]>([])
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([])

  // Default: select all
  const activeBillWs = selectedBillWs.length > 0 ? selectedBillWs : billWorkspaces.map((w) => w.id)
  const activeInvestWs = selectedInvestWs.length > 0 ? selectedInvestWs : investWorkspaces.map((w) => w.id)

  const monthBills = useMemo(() => {
    return billRecords
      .filter((r) => r.monthKey === month && activeBillWs.includes(r.workspaceId))
      .flatMap((r) => r.bills)
  }, [billRecords, month, activeBillWs])

  const wsInvestments = useMemo(
    () => investments.filter((i) => activeInvestWs.includes(i.workspaceId) && i.isActive),
    [investments, activeInvestWs]
  )

  const wsTransactions = useMemo(
    () => transactions.filter((t) => activeInvestWs.includes(t.workspaceId)),
    [transactions, activeInvestWs]
  )

  const monthTransactions = useMemo(
    () => wsTransactions.filter((t) => t.monthKey === month),
    [wsTransactions, month]
  )

  const activeGoals = useMemo(() => goals.filter((g) => g.isActive), [goals])
  const filteredGoals = useMemo(() => {
    if (selectedGoalIds.length === 0) return activeGoals
    return activeGoals.filter((g) => selectedGoalIds.includes(g.id))
  }, [activeGoals, selectedGoalIds])

  const hasAnyData = workspaces.length > 0

  if (!hasAnyData) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-bold text-gray-900">Painel</h1>
        <EmptyState
          icon={LayoutDashboard}
          title="Sem dados para exibir"
          description="Comece adicionando contas mensais ou investimentos para visualizar seus dados no painel."
        />
      </div>
    )
  }

  const toggleFilter = (
    id: string,
    selected: string[],
    setSelected: (ids: string[]) => void,
    allIds: string[]
  ): void => {
    const active = selected.length > 0 ? selected : allIds
    if (active.includes(id)) {
      const next = active.filter((x) => x !== id)
      setSelected(next.length === allIds.length ? [] : next)
    } else {
      const next = [...active, id]
      setSelected(next.length === allIds.length ? [] : next)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Painel</h1>
        <MonthNavigator monthKey={month} onChange={setMonth} />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        {billWorkspaces.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-400 uppercase">Contas</p>
            <div className="flex gap-1.5">
              {billWorkspaces.map((ws) => {
                const isActive = activeBillWs.includes(ws.id)
                return (
                  <button
                    key={ws.id}
                    onClick={() => toggleFilter(ws.id, selectedBillWs, setSelectedBillWs, billWorkspaces.map((w) => w.id))}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? 'border-primary-200 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ws.color }} />
                    {ws.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {investWorkspaces.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-400 uppercase">Investimentos</p>
            <div className="flex gap-1.5">
              {investWorkspaces.map((ws) => {
                const isActive = activeInvestWs.includes(ws.id)
                return (
                  <button
                    key={ws.id}
                    onClick={() => toggleFilter(ws.id, selectedInvestWs, setSelectedInvestWs, investWorkspaces.map((w) => w.id))}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? 'border-primary-200 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ws.color }} />
                    {ws.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {activeGoals.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-400 uppercase">Metas</p>
            <div className="flex flex-wrap gap-1.5">
              {activeGoals.map((goal) => {
                const isActive = selectedGoalIds.length === 0 || selectedGoalIds.includes(goal.id)
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleFilter(goal.id, selectedGoalIds, setSelectedGoalIds, activeGoals.map((g) => g.id))}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? 'border-purple-200 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {goal.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <AlertCards bills={monthBills} categories={categories} currentMonth={month} />

      <SummaryCards
        bills={monthBills}
        investments={wsInvestments}
        monthTransactions={monthTransactions}
        goals={filteredGoals}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExpensePieChart bills={monthBills} categories={categories} />
        <PlannedVsActualBarChart goals={filteredGoals} transactions={transactions} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PortfolioPieChart investments={wsInvestments} />
        <InvestmentBreakdownChart
          investments={wsInvestments}
          transactions={wsTransactions}
          currentMonth={month}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExpenseTrendChart billRecords={billRecords} currentMonth={month} />
        <CategoryTrendChart billRecords={billRecords} categories={categories} currentMonth={month} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InvestmentLineChart
          transactions={wsTransactions}
          investments={wsInvestments}
          currentMonth={month}
        />
        <FGTSDashboardChart records={fgtsRecords} currentMonth={month} />
      </div>
    </div>
  )
}
