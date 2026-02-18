import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts'
import { formatCurrency, formatMonthYear, getPrevMonthKey } from '@/lib/formatters'
import { reconstructHistoricalBalance } from '@/lib/calculations'
import type { Investment, InvestmentTransaction, FGTSRecord, MonthKey } from '@/types/models'

interface NetWorthEvolutionChartProps {
  investments: Investment[]
  transactions: InvestmentTransaction[]
  fgtsRecords: FGTSRecord[]
  currentMonth: MonthKey
}

function getLast12Months(current: MonthKey): MonthKey[] {
  const months: MonthKey[] = []
  let m = current
  for (let i = 0; i < 12; i++) {
    months.unshift(m)
    m = getPrevMonthKey(m)
  }
  return months
}

export function NetWorthEvolutionChart({ investments, transactions, fgtsRecords, currentMonth }: NetWorthEvolutionChartProps): React.JSX.Element {
  const months = useMemo(() => getLast12Months(currentMonth), [currentMonth])

  const data = useMemo(() => {
    return months.map((monthKey) => {
      // Sum all investment balances up to this month
      let investTotal = 0
      for (const inv of investments) {
        investTotal += reconstructHistoricalBalance(inv.id, transactions, monthKey)
      }

      // Get FGTS balance for this month (or closest prior)
      const fgtsForMonth = fgtsRecords
        .filter((r) => r.monthKey <= monthKey)
        .sort((a, b) => b.monthKey.localeCompare(a.monthKey))[0]?.balance || 0

      const total = investTotal + fgtsForMonth

      return {
        month: formatMonthYear(monthKey),
        investments: investTotal / 100,
        fgts: fgtsForMonth / 100,
        total: total / 100
      }
    })
  }, [months, investments, transactions, fgtsRecords])

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Evolução do Patrimônio (12 meses)</h3>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`} />
          <Tooltip formatter={(value: number) => formatCurrency(value * 100)} />
          <Area type="monotone" dataKey="investments" name="Investimentos" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
          <Area type="monotone" dataKey="fgts" name="FGTS" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
