import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { formatCurrency } from '@/lib/formatters'
import type { Goal } from '@/types/models'

interface GoalContributionsBarChartProps {
  goals: Goal[]
}

export function GoalContributionsBarChart({ goals }: GoalContributionsBarChartProps): React.JSX.Element {
  const data = useMemo(() => {
    return goals
      .filter((g) => g.isActive)
      .map((goal) => {
        const total = goal.contributions.reduce((sum, c) => sum + c.actualAmount, 0)
        return {
          name: goal.name.length > 15 ? goal.name.slice(0, 15) + '...' : goal.name,
          aportado: total / 100
        }
      })
      .filter((d) => d.aportado > 0)
  }, [goals])

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Aportes por Meta</h3>
        <p className="py-8 text-center text-sm text-gray-400">Sem aportes registrados</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Aportes por Meta</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `R$ ${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(Math.round(value * 100))}
              contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
            />
            <Bar dataKey="aportado" name="Aportado" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
