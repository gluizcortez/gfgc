import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { formatCurrency, getCurrentMonthKey } from '@/lib/formatters'
import type { Goal, InvestmentTransaction } from '@/types/models'

interface PlannedVsActualBarChartProps {
  goals: Goal[]
  transactions: InvestmentTransaction[]
}

export function PlannedVsActualBarChart({ goals, transactions }: PlannedVsActualBarChartProps): React.JSX.Element {
  const currentMonth = getCurrentMonthKey()

  const data = useMemo(() => {
    return goals
      .filter((g) => g.isActive)
      .map((goal) => {
        let actual = 0

        if (goal.goalType === 'investment_linked') {
          // Calculate from transactions
          const relevantTxs = transactions.filter((tx) => {
            if (tx.type !== 'contribution') return false
            if (tx.monthKey !== currentMonth) return false
            if (goal.linkedInvestmentIds.length > 0) {
              return goal.linkedInvestmentIds.includes(tx.investmentId)
            }
            if (goal.linkedWorkspaceIds.length > 0) {
              return goal.linkedWorkspaceIds.includes(tx.workspaceId)
            }
            return true
          })
          actual = relevantTxs.reduce((sum, tx) => sum + tx.amount, 0)
        } else {
          // Manual: use last contribution
          if (goal.contributions.length > 0) {
            actual = goal.contributions[goal.contributions.length - 1].actualAmount
          }
        }

        return {
          name: goal.name.length > 15 ? goal.name.slice(0, 15) + '...' : goal.name,
          meta: goal.targetAmount / 100,
          real: actual / 100
        }
      })
  }, [goals, transactions, currentMonth])

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Metas: Planejado vs Real</h3>
        <p className="py-8 text-center text-sm text-gray-400">Sem metas ativas</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Metas: Planejado vs Real</h3>
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
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="meta" name="Meta" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
            <Bar dataKey="real" name="Real" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
