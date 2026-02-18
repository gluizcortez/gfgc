import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts'
import { clsx } from 'clsx'
import { Modal } from '@/components/shared/Modal'
import { formatCurrency } from '@/lib/formatters'
import type { Goal } from '@/types/models'

interface GoalChartModalProps {
  open: boolean
  onClose: () => void
  goal: Goal | null
}

interface PeriodData {
  period: string
  aportado: number
  aportadoCents: number
}

export function GoalChartModal({ open, onClose, goal }: GoalChartModalProps): React.JSX.Element {
  const periodData = useMemo((): PeriodData[] => {
    if (!goal) return []

    const map = new Map<string, number>()
    for (const c of goal.contributions) {
      map.set(c.periodKey, (map.get(c.periodKey) || 0) + c.actualAmount)
    }

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([period, cents]) => ({
        period,
        aportado: cents / 100,
        aportadoCents: cents
      }))
  }, [goal])

  const totalActual = useMemo(
    () => (goal ? goal.contributions.reduce((sum, c) => sum + c.actualAmount, 0) : 0),
    [goal]
  )

  const totalTarget = useMemo(
    () => (goal ? periodData.length * goal.targetAmount : 0),
    [goal, periodData]
  )

  const percentage = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 1000) / 10 : 0

  if (!goal) return <></>

  const targetLine = goal.targetAmount / 100

  return (
    <Modal open={open} onClose={onClose} title={`Aportes — ${goal.name}`} wide>
      <div className="space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-blue-600">Total Aportado</p>
            <p className="text-lg font-bold text-blue-700">{formatCurrency(totalActual)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Meta Total ({periodData.length} períodos)</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalTarget)}</p>
          </div>
          <div className={`rounded-lg p-3 ${percentage >= 100 ? 'bg-green-50' : 'bg-amber-50'}`}>
            <p className={`text-xs ${percentage >= 100 ? 'text-green-600' : 'text-amber-600'}`}>Progresso</p>
            <p className={`text-lg font-bold ${percentage >= 100 ? 'text-green-700' : 'text-amber-700'}`}>
              {percentage}%
            </p>
          </div>
        </div>

        {/* Chart */}
        {periodData.length > 0 && (
          <div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={periodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: number) => `R$ ${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(Math.round(value * 100))}
                  contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                />
                <ReferenceLine
                  y={targetLine}
                  stroke="#ef4444"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{
                    value: `Meta: ${formatCurrency(goal.targetAmount)}`,
                    position: 'insideTopRight',
                    fill: '#ef4444',
                    fontSize: 11
                  }}
                />
                <Bar dataKey="aportado" name="Aportado" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        {periodData.length > 0 && (
          <div className="max-h-48 overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-1.5 text-left font-medium text-gray-400">Período</th>
                  <th className="pb-1.5 text-right font-medium text-gray-400">Aportado</th>
                  <th className="pb-1.5 text-right font-medium text-gray-400">Meta</th>
                  <th className="pb-1.5 text-right font-medium text-gray-400">Diferença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {periodData.map((p) => {
                  const diff = p.aportadoCents - goal.targetAmount
                  return (
                    <tr key={p.period}>
                      <td className="py-1.5 text-gray-600">{p.period}</td>
                      <td className="py-1.5 text-right font-medium text-gray-700">
                        {formatCurrency(p.aportadoCents)}
                      </td>
                      <td className="py-1.5 text-right text-gray-500">
                        {formatCurrency(goal.targetAmount)}
                      </td>
                      <td
                        className={clsx(
                          'py-1.5 text-right font-medium',
                          diff >= 0 ? 'text-green-600' : 'text-red-500'
                        )}
                      >
                        {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {periodData.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">Nenhum aporte registrado</p>
        )}
      </div>
    </Modal>
  )
}
