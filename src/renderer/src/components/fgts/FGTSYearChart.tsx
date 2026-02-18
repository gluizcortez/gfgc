import { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { formatCurrency, formatMonthYear } from '@/lib/formatters'
import type { FGTSRecord } from '@/types/models'

interface FGTSYearChartProps {
  records: FGTSRecord[]
}

export function FGTSYearChart({ records }: FGTSYearChartProps): React.JSX.Element {
  const chartData = useMemo(() => {
    // Sort ascending by monthKey and take the 12 most recent
    const sorted = [...records].sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    const last12 = sorted.slice(-12)

    return last12.map((r) => ({
      month: formatMonthYear(r.monthKey),
      balance: r.balance / 100
    }))
  }, [records])

  if (chartData.length === 0) return <></>

  const firstMonth = chartData[0].month
  const lastMonth = chartData[chartData.length - 1].month
  const label = chartData.length === 1 ? firstMonth : `${firstMonth} — ${lastMonth}`

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Evolução FGTS — {label}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `R$ ${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(Math.round(value * 100)), 'Saldo']}
            labelStyle={{ fontWeight: 600 }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ r: 4, fill: '#0ea5e9' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
