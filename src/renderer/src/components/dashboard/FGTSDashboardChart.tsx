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
import type { FGTSRecord } from '@/types/models'

interface FGTSDashboardChartProps {
  records: FGTSRecord[]
  currentMonth: string
}

export function FGTSDashboardChart({ records, currentMonth }: FGTSDashboardChartProps): React.JSX.Element {
  const data = useMemo(() => {
    const months: string[] = []
    let m = currentMonth
    for (let i = 0; i < 6; i++) {
      months.unshift(m)
      m = getPrevMonthKey(m)
    }

    return months.map((monthKey) => {
      // Sum all FGTS accounts for this month
      const monthRecords = records.filter((r) => r.monthKey === monthKey)
      const totalBalance = monthRecords.reduce((sum, r) => sum + r.balance, 0)

      return {
        month: formatMonthYear(monthKey),
        saldo: totalBalance / 100
      }
    })
  }, [records, currentMonth])

  const hasData = data.some((d) => d.saldo > 0)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">FGTS (6 meses)</h3>
      {!hasData ? (
        <p className="py-8 text-center text-sm text-gray-400">Sem dados de FGTS</p>
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
                formatter={(value: number) => [formatCurrency(Math.round(value * 100)), 'FGTS']}
                contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
              />
              <Line
                type="monotone"
                dataKey="saldo"
                name="Saldo FGTS"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 4, fill: '#0ea5e9' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
