import { useState, useMemo } from 'react'
import { LayoutDashboard, Calendar as CalendarIcon, FileDown, FileText } from 'lucide-react'
import { clsx } from 'clsx'
import { MonthNavigator } from '@/components/layout/MonthNavigator'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { SummaryCards } from './SummaryCards'
import { AlertCards } from './AlertCards'
import { ExpensePieChart } from './ExpensePieChart'
import { InvestmentLineChart } from './InvestmentLineChart'
import { PlannedVsActualBarChart } from './PlannedVsActualBarChart'
import { GoalContributionsBarChart } from './GoalContributionsBarChart'
import { FGTSDashboardChart } from './FGTSDashboardChart'
import { PortfolioPieChart } from './PortfolioPieChart'
import { InvestmentBreakdownChart } from './InvestmentBreakdownChart'
import { ExpenseTrendChart } from './ExpenseTrendChart'
import { CategoryTrendChart } from './CategoryTrendChart'
import { IncomePieChart } from './IncomePieChart'
import { YearView } from './YearView'
import { MonthlyReportModal } from './MonthlyReportModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useBillsStore } from '@/stores/useBillsStore'
import { useInvestmentsStore } from '@/stores/useInvestmentsStore'
import { useGoalsStore } from '@/stores/useGoalsStore'
import { useFGTSStore } from '@/stores/useFGTSStore'
import { useIncomeStore } from '@/stores/useIncomeStore'
import { useUIStore } from '@/stores/useUIStore'
import { getCurrentMonthKey, formatCurrency, formatDate, formatMonthYear } from '@/lib/formatters'
import { getYearMonths, getCategoryTotals } from '@/lib/calculations'
import { MONTH_NAMES_PT } from '@/lib/constants'

export function DashboardPage(): React.JSX.Element {
  const [month, setMonth] = useState(getCurrentMonthKey())
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month')
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)

  const workspaces = useSettingsStore((s) => s.workspaces)
  const categories = useSettingsStore((s) => s.settings.categories)
  const billRecords = useBillsStore((s) => s.monthlyRecords)
  const investments = useInvestmentsStore((s) => s.investments)
  const transactions = useInvestmentsStore((s) => s.transactions)
  const goals = useGoalsStore((s) => s.goals)
  const fgtsRecords = useFGTSStore((s) => s.records)
  const incomeEntries = useIncomeStore((s) => s.entries)
  const addNotification = useUIStore((s) => s.addNotification)

  const billWorkspaces = useMemo(() => workspaces.filter((w) => w.type === 'bills'), [workspaces])
  const investWorkspaces = useMemo(() => workspaces.filter((w) => w.type === 'investments'), [workspaces])
  const incomeWorkspaces = useMemo(() => workspaces.filter((w) => w.type === 'income'), [workspaces])

  const [selectedBillWs, setSelectedBillWs] = useState<string[]>([])
  const [selectedInvestWs, setSelectedInvestWs] = useState<string[]>([])
  const [selectedIncomeWs, setSelectedIncomeWs] = useState<string[]>([])
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([])
  const [showReport, setShowReport] = useState(false)

  // Default: select all
  const activeBillWs = selectedBillWs.length > 0 ? selectedBillWs : billWorkspaces.map((w) => w.id)
  const activeInvestWs = selectedInvestWs.length > 0 ? selectedInvestWs : investWorkspaces.map((w) => w.id)
  const activeIncomeWs = selectedIncomeWs.length > 0 ? selectedIncomeWs : incomeWorkspaces.map((w) => w.id)

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

  const monthIncome = useMemo(
    () => incomeEntries.filter((e) => e.monthKey === month && activeIncomeWs.includes(e.workspaceId)),
    [incomeEntries, month, activeIncomeWs]
  )

  const activeGoals = useMemo(() => goals.filter((g) => g.isActive), [goals])
  const filteredGoals = useMemo(() => {
    if (selectedGoalIds.length === 0) return activeGoals
    return activeGoals.filter((g) => selectedGoalIds.includes(g.id))
  }, [activeGoals, selectedGoalIds])

  const hasAnyData = workspaces.length > 0

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  const handleExportYearCSV = (): void => {
    const months = getYearMonths(year)
    const yearBills = billRecords.filter((r) => months.includes(r.monthKey)).flatMap((r) => r.bills)
    const header = 'Mês,Total,Pago,Quantidade'
    const monthlyData = months.map((mk, i) => {
      const bills = billRecords.filter((r) => r.monthKey === mk).flatMap((r) => r.bills)
      const total = bills.reduce((sum, b) => sum + b.value, 0)
      const paid = bills.filter((b) => b.status === 'paid').reduce((sum, b) => sum + b.value, 0)
      return `${MONTH_NAMES_PT[i].substring(0, 3)} ${year},${(total / 100).toFixed(2)},${(paid / 100).toFixed(2)},${bills.length}`
    })
    const catHeader = '\n\nCategoria,Total'
    const categoryTotals = getCategoryTotals(yearBills)
    const catRows = Array.from(categoryTotals.entries()).map(([catId, total]) => {
      const cat = categories.find((c) => c.id === catId)
      return `${cat?.name || catId},${(total / 100).toFixed(2)}`
    })
    const csv = [header, ...monthlyData, catHeader, ...catRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gfgc-resumo-anual-${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addNotification('Relatório anual exportado', 'success')
  }

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
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Painel</h1>
          <div className="flex rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('month')}
              className={clsx(
                'rounded-l-lg px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'month' ? 'bg-primary-50 text-primary-700' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={clsx(
                'rounded-r-lg px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'year' ? 'bg-primary-50 text-primary-700' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              Ano
            </button>
          </div>
        </div>
        {viewMode === 'month' ? (
          <div className="flex items-center gap-2">
            <MonthNavigator monthKey={month} onChange={setMonth} />
            <SimpleTooltip label="Relatório mensal">
              <button
                onClick={() => setShowReport(true)}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                <FileText size={16} />
              </button>
            </SimpleTooltip>
          </div>
        ) : (
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium focus:border-primary-500 focus:outline-none"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}
      </div>

      {viewMode === 'year' ? (
        <YearView
          year={year}
          billRecords={billRecords}
          investments={wsInvestments}
          transactions={wsTransactions}
          goals={filteredGoals}
          fgtsRecords={fgtsRecords}
          incomeEntries={incomeEntries}
          categories={categories}
          onExportCSV={handleExportYearCSV}
        />
      ) : (
        <>
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
            {incomeWorkspaces.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-400 uppercase">Receitas</p>
                <div className="flex gap-1.5">
                  {incomeWorkspaces.map((ws) => {
                    const isActive = activeIncomeWs.includes(ws.id)
                    return (
                      <button
                        key={ws.id}
                        onClick={() => toggleFilter(ws.id, selectedIncomeWs, setSelectedIncomeWs, incomeWorkspaces.map((w) => w.id))}
                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                          isActive
                            ? 'border-green-200 bg-green-50 text-green-700'
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
            <IncomePieChart entries={monthIncome} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PlannedVsActualBarChart goals={filteredGoals} transactions={transactions} />
            <GoalContributionsBarChart goals={filteredGoals} />
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
        </>
      )}

      <MonthlyReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        monthKey={month}
      />
    </div>
  )
}
