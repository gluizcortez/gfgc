import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency, formatMonthYear, getPrevMonthKey } from '@/lib/formatters'
import type { MonthlyBillRecord, Category } from '@/types/models'

interface CategoryTrendChartProps {
  billRecords: MonthlyBillRecord[]
  categories: Category[]
  currentMonth: string
  months?: number
}

export function CategoryTrendChart({
  billRecords,
  categories,
  currentMonth,
  months = 6
}: CategoryTrendChartProps): React.JSX.Element {
  const data = useMemo(() => {
    // Build list of months
    const monthKeys: string[] = []
    let m = currentMonth
    for (let i = 0; i < months; i++) {
      monthKeys.unshift(m)
      m = getPrevMonthKey(m)
    }

    // Aggregate bills by month and category
    const categoryTotals = new Map<string, number>()

    const rows = monthKeys.map((monthKey) => {
      const bills = billRecords
        .filter((r) => r.monthKey === monthKey)
        .flatMap((r) => r.bills)

      const row: Record<string, unknown> = { month: formatMonthYear(monthKey).split(' ')[0].substring(0, 3) }

      for (const bill of bills) {
        const catId = bill.categoryId
        const prev = (row[catId] as number) || 0
        row[catId] = prev + bill.value / 100
        categoryTotals.set(catId, (categoryTotals.get(catId) || 0) + bill.value)
      }

      return row
    })

    // Find top 5 categories by total spend
    const topCategories = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => categories.find((c) => c.id === id))
      .filter(Boolean) as Category[]

    return { rows, topCategories }
  }, [billRecords, categories, currentMonth, months])

  if (data.topCategories.length === 0) return <></>

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">
        Tendência por Categoria ({months} meses)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `R$${(v / 1000).toFixed(0)}K` : `R$${v}`
              }
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(Math.round(value * 100))}
              contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {data.topCategories.map((cat) => (
              <Line
                key={cat.id}
                type="monotone"
                dataKey={cat.id}
                name={cat.name}
                stroke={cat.color}
                strokeWidth={2}
                dot={{ r: 3, fill: cat.color }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
