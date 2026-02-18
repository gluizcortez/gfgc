import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { formatCurrency, formatMonthYear, getPrevMonthKey } from '@/lib/formatters'
import type { Investment, InvestmentTransaction } from '@/types/models'

interface InvestmentLineChartProps {
  transactions: InvestmentTransaction[]
  investments: Investment[]
  currentMonth: string
}

export function InvestmentLineChart({
  transactions,
  investments,
  currentMonth
}: InvestmentLineChartProps): React.JSX.Element {
  const data = useMemo(() => {
    // Get last 6 months
    const months: string[] = []
    let m = currentMonth
    for (let i = 0; i < 6; i++) {
      months.unshift(m)
      m = getPrevMonthKey(m)
    }

    return months.map((monthKey) => {
      const monthTxs = transactions.filter((t) => t.monthKey === monthKey)
      const contributions = monthTxs
        .filter((t) => t.type === 'contribution')
        .reduce((sum, t) => sum + t.amount, 0)
      const withdrawals = monthTxs
        .filter((t) => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        month: formatMonthYear(monthKey),
        aportes: contributions / 100,
        retiradas: withdrawals / 100,
        liquido: (contributions - withdrawals) / 100
      }
    })
  }, [transactions, currentMonth])

  const totalBalance = investments.reduce((sum, i) => sum + i.currentBalance, 0)
  const hasData = data.some((d) => d.aportes > 0 || d.retiradas > 0)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Movimentações (6 meses)
        </h3>
        <span className="text-xs text-gray-400">
          Saldo Total: {formatCurrency(totalBalance)}
        </span>
      </div>
      {!hasData ? (
        <p className="py-8 text-center text-sm text-gray-400">Sem dados no período</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => `R$ ${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(Math.round(value * 100))}
                contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
              />
              <Line
                type="monotone"
                dataKey="aportes"
                name="Aportes"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="retiradas"
                name="Retiradas"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="liquido"
                name="Líquido"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
