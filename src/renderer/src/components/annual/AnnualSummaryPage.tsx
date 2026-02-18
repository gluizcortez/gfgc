import { useState, useMemo } from 'react'
import { Calendar, FileDown } from 'lucide-react'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { useUIStore } from '@/stores/useUIStore'
import { AnnualBarChart } from './AnnualBarChart'
import { AnnualCategoryPieChart } from './AnnualCategoryPieChart'
import { EmptyState } from '@/components/shared/EmptyState'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useBillsStore } from '@/stores/useBillsStore'
import { formatCurrency } from '@/lib/formatters'
import { getYearMonths, getCategoryTotals } from '@/lib/calculations'
import { MONTH_NAMES_PT } from '@/lib/constants'

export function AnnualSummaryPage(): React.JSX.Element {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)

  const billRecords = useBillsStore((s) => s.monthlyRecords)
  const categories = useSettingsStore((s) => s.settings.categories)
  const workspaces = useSettingsStore((s) => s.workspaces)
  const billWorkspaces = useMemo(() => workspaces.filter((w) => w.type === 'bills'), [workspaces])

  const months = useMemo(() => getYearMonths(year), [year])

  const monthlyData = useMemo(() => {
    return months.map((monthKey, index) => {
      const bills = billRecords
        .filter((r) => r.monthKey === monthKey)
        .flatMap((r) => r.bills)
      const total = bills.reduce((sum, b) => sum + b.value, 0)
      const paid = bills.filter((b) => b.status === 'paid').reduce((sum, b) => sum + b.value, 0)
      return { monthKey, label: MONTH_NAMES_PT[index].substring(0, 3), total, paid, count: bills.length }
    })
  }, [months, billRecords])

  const yearTotal = monthlyData.reduce((sum, m) => sum + m.total, 0)
  const yearPaid = monthlyData.reduce((sum, m) => sum + m.paid, 0)
  const avgMonthly = yearTotal / 12

  const yearBills = useMemo(() => {
    return billRecords
      .filter((r) => months.includes(r.monthKey))
      .flatMap((r) => r.bills)
  }, [billRecords, months])

  const categoryTotals = useMemo(() => getCategoryTotals(yearBills), [yearBills])

  const addNotification = useUIStore((s) => s.addNotification)

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  const handleExportCSV = (): void => {
    const header = 'Mês,Total,Pago,Quantidade'
    const rows = monthlyData.map((m) =>
      `${m.label} ${year},${(m.total / 100).toFixed(2)},${(m.paid / 100).toFixed(2)},${m.count}`
    )
    const catHeader = '\n\nCategoria,Total'
    const catRows = Array.from(categoryTotals.entries()).map(([catId, total]) => {
      const cat = categories.find((c) => c.id === catId)
      return `${cat?.name || catId},${(total / 100).toFixed(2)}`
    })
    const csv = [header, ...rows, catHeader, ...catRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gfgc-resumo-anual-${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addNotification('Relatório exportado com sucesso', 'success')
  }

  if (billWorkspaces.length === 0) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-bold text-gray-900">Resumo Anual</h1>
        <EmptyState
          icon={Calendar}
          title="Sem dados"
          description="Crie abas de contas mensais e adicione dados para ver o resumo anual."
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Resumo Anual</h1>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium focus:border-primary-500 focus:outline-none"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <SimpleTooltip label="Exportar resumo anual com totais e categorias em CSV">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <FileDown size={16} />
              Exportar CSV
            </button>
          </SimpleTooltip>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Total do Ano</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(yearTotal)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Pago</p>
          <p className="mt-1 text-xl font-bold text-green-600">{formatCurrency(yearPaid)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Média Mensal</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(avgMonthly)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnnualBarChart data={monthlyData} />
        <AnnualCategoryPieChart categoryTotals={categoryTotals} categories={categories} />
      </div>
    </div>
  )
}
