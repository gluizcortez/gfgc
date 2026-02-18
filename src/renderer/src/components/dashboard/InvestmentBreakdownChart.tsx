import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { formatCurrency, formatMonthYear } from '@/lib/formatters'
import type { Investment, InvestmentTransaction } from '@/types/models'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

interface InvestmentBreakdownChartProps {
  investments: Investment[]
  transactions: InvestmentTransaction[]
  currentMonth: string
}

export function InvestmentBreakdownChart({
  investments,
  transactions,
  currentMonth
}: InvestmentBreakdownChartProps): React.JSX.Element {
  const { data, investmentNames } = useMemo(() => {
    if (investments.length === 0 || transactions.length === 0) {
      return { data: [], investmentNames: [] }
    }

    // Get last 6 months
    const months: string[] = []
    const [y, m] = currentMonth.split('-').map(Number)
    for (let i = 5; i >= 0; i--) {
      const date = new Date(y, m - 1 - i, 1)
      const mk = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months.push(mk)
    }

    const activeInvestments = investments.filter((inv) => {
      return transactions.some((t) => t.investmentId === inv.id && months.includes(t.monthKey))
    })

    const names = activeInvestments.map((inv) => inv.name)

    const chartData = months.map((mk) => {
      const row: Record<string, string | number> = { month: formatMonthYear(mk) }
      for (const inv of activeInvestments) {
        const invTxs = transactions.filter(
          (t) => t.investmentId === inv.id && t.monthKey === mk
        )
        const contributions = invTxs
          .filter((t) => t.type === 'contribution')
          .reduce((sum, t) => sum + t.amount, 0)
        const withdrawals = invTxs
          .filter((t) => t.type === 'withdrawal')
          .reduce((sum, t) => sum + t.amount, 0)
        row[inv.name] = (contributions - withdrawals) / 100
      }
      return row
    })

    return { data: chartData, investmentNames: names }
  }, [investments, transactions, currentMonth])

  if (data.length === 0 || investmentNames.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Movimentações por Investimento</h3>
        <p className="py-8 text-center text-sm text-gray-400">Sem dados no período</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Movimentações por Investimento</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={(v: number) =>
                `R$ ${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`
              }
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(Math.round(value * 100))}
              contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {investmentNames.map((name, idx) => (
              <Bar
                key={name}
                dataKey={name}
                fill={COLORS[idx % COLORS.length]}
                radius={[3, 3, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
