import { useMemo } from 'react'
import { FileDown } from 'lucide-react'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { AnnualBarChart } from '@/components/annual/AnnualBarChart'
import { AnnualCategoryPieChart } from '@/components/annual/AnnualCategoryPieChart'
import { IncomeBarChart } from './IncomeBarChart'
import { FGTSLineChart } from './FGTSLineChart'
import { formatCurrency } from '@/lib/formatters'
import { getYearMonths, getCategoryTotals, calculateInvestmentsTotals } from '@/lib/calculations'
import { MONTH_NAMES_PT } from '@/lib/constants'
import { INCOME_CATEGORY_LABELS } from '@/types/models'
import type {
  MonthlyBillRecord,
  Investment,
  InvestmentTransaction,
  Goal,
  FGTSRecord,
  IncomeEntry,
  Category,
  IncomeCategory
} from '@/types/models'

interface YearViewProps {
  year: number
  billRecords: MonthlyBillRecord[]
  investments: Investment[]
  transactions: InvestmentTransaction[]
  goals: Goal[]
  fgtsRecords: FGTSRecord[]
  incomeEntries: IncomeEntry[]
  categories: Category[]
  onExportCSV?: () => void
}

export function YearView({
  year,
  billRecords,
  investments,
  transactions,
  goals,
  fgtsRecords,
  incomeEntries,
  categories,
  onExportCSV
}: YearViewProps): React.JSX.Element {
  const months = useMemo(() => getYearMonths(year), [year])

  // Bills data
  const monthlyBillData = useMemo(() => {
    return months.map((monthKey, index) => {
      const bills = billRecords
        .filter((r) => r.monthKey === monthKey)
        .flatMap((r) => r.bills)
      const total = bills.reduce((sum, b) => sum + b.value, 0)
      const paid = bills.filter((b) => b.status === 'paid').reduce((sum, b) => sum + b.value, 0)
      return { monthKey, label: MONTH_NAMES_PT[index].substring(0, 3), total, paid, count: bills.length }
    })
  }, [months, billRecords])

  const yearBills = useMemo(
    () => billRecords.filter((r) => months.includes(r.monthKey)).flatMap((r) => r.bills),
    [billRecords, months]
  )
  const yearExpenses = yearBills.reduce((sum, b) => sum + b.value, 0)
  const yearPaid = yearBills.filter((b) => b.status === 'paid').reduce((sum, b) => sum + b.value, 0)
  const avgMonthly = yearExpenses / 12
  const categoryTotals = useMemo(() => getCategoryTotals(yearBills), [yearBills])

  // Investment data
  const yearTransactions = useMemo(
    () => transactions.filter((t) => months.includes(t.monthKey)),
    [transactions, months]
  )
  const investTotals = useMemo(
    () => calculateInvestmentsTotals(investments, yearTransactions),
    [investments, yearTransactions]
  )

  // FGTS data
  const yearFGTS = useMemo(() => {
    const records = fgtsRecords.filter((r) => months.includes(r.monthKey))
    return records.sort((a, b) => b.monthKey.localeCompare(a.monthKey))
  }, [fgtsRecords, months])
  const latestFGTS = yearFGTS[0]?.balance || 0
  const firstFGTS = yearFGTS[yearFGTS.length - 1]?.balance || 0
  const fgtsGrowth = latestFGTS - firstFGTS

  // Income data
  const yearIncome = useMemo(
    () => incomeEntries.filter((e) => months.includes(e.monthKey)),
    [incomeEntries, months]
  )
  const totalIncome = yearIncome.reduce((sum, e) => sum + e.amount, 0)
  const incomeByCategory = useMemo(() => {
    const map = new Map<IncomeCategory, number>()
    for (const entry of yearIncome) {
      map.set(entry.category, (map.get(entry.category) || 0) + entry.amount)
    }
    return map
  }, [yearIncome])

  // Goals data
  const activeGoals = goals.filter((g) => g.isActive)
  const onTrackGoals = activeGoals.filter((g) => {
    if (g.contributions.length === 0) return false
    const last = g.contributions[g.contributions.length - 1]
    return last.actualAmount >= g.targetAmount
  })

  return (
    <div className="space-y-6">
      {/* Export button */}
      {onExportCSV && (
        <div className="flex justify-end">
          <SimpleTooltip label="Exportar resumo anual em CSV">
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <FileDown size={16} />
              Exportar CSV
            </button>
          </SimpleTooltip>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Despesas</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(yearExpenses)}</p>
          <p className="text-xs text-gray-400">{yearBills.length} contas</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-medium text-green-600 uppercase">Total Pago</p>
          <p className="mt-1 text-xl font-bold text-green-700">{formatCurrency(yearPaid)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Média Mensal</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(avgMonthly)}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-medium text-emerald-600 uppercase">Total Receitas</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-emerald-500">{yearIncome.length} entrada(s)</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-medium text-blue-600 uppercase">Investimentos</p>
          <p className="mt-1 text-xl font-bold text-blue-700">{formatCurrency(investTotals.totalContributions)}</p>
          <p className="text-xs text-blue-500">aportado no ano</p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <p className="text-xs font-medium text-purple-600 uppercase">Metas no Alvo</p>
          <p className="mt-1 text-xl font-bold text-purple-700">{onTrackGoals.length}/{activeGoals.length}</p>
          <p className="text-xs text-purple-500">metas ativas</p>
        </div>
      </div>

      {/* Balance: Income vs Expenses */}
      {totalIncome > 0 && yearExpenses > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Balanço do Ano</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-emerald-600">Receitas: {formatCurrency(totalIncome)}</span>
                <span className="text-gray-500">Despesas: {formatCurrency(yearExpenses)}</span>
              </div>
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-red-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min((totalIncome / (totalIncome + yearExpenses)) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${totalIncome - yearExpenses >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {totalIncome - yearExpenses >= 0 ? '+' : ''}{formatCurrency(totalIncome - yearExpenses)}
              </p>
              <p className="text-xs text-gray-400">saldo</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row 1: Bills */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnnualBarChart data={monthlyBillData} />
        <AnnualCategoryPieChart categoryTotals={categoryTotals} categories={categories} />
      </div>

      {/* Charts Row 2: Income and FGTS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IncomeBarChart entries={yearIncome} year={year} />
        <FGTSLineChart records={fgtsRecords} year={year} />
      </div>

      {/* Investment Summary */}
      {yearTransactions.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Investimentos no Ano</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs text-blue-600">Total Aportado</p>
              <p className="text-lg font-bold text-blue-700">{formatCurrency(investTotals.totalContributions)}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-xs text-amber-600">Rendimentos</p>
              <p className="text-lg font-bold text-amber-700">{formatCurrency(investTotals.totalYields)}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-xs text-red-600">Retiradas</p>
              <p className="text-lg font-bold text-red-700">{formatCurrency(investTotals.totalWithdrawals)}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-xs text-green-600">Saldo Total</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(investTotals.totalBalance)}</p>
            </div>
          </div>
        </div>
      )}

      {/* FGTS Summary */}
      {yearFGTS.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">FGTS no Ano</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Saldo Atual</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(latestFGTS)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Saldo Inicial (Ano)</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(firstFGTS)}</p>
            </div>
            <div className={`rounded-lg p-3 ${fgtsGrowth >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-xs ${fgtsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>Variação</p>
              <p className={`text-lg font-bold ${fgtsGrowth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {fgtsGrowth >= 0 ? '+' : ''}{formatCurrency(fgtsGrowth)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Income by Category */}
      {incomeByCategory.size > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Receitas por Categoria no Ano</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from(incomeByCategory.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amount]) => (
                <div key={cat} className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">{INCOME_CATEGORY_LABELS[cat]}</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(amount)}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
