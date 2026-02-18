import { clsx } from 'clsx'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { GoalContribution } from '@/types/models'

interface GoalContributionHistoryProps {
  contributions: GoalContribution[]
}

export function GoalContributionHistory({ contributions }: GoalContributionHistoryProps): React.JSX.Element {
  if (contributions.length === 0) {
    return <p className="py-2 text-center text-xs text-gray-400">Nenhum aporte registrado</p>
  }

  const sorted = [...contributions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="max-h-48 overflow-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="pb-1.5 text-left font-medium text-gray-400">Período</th>
            <th className="pb-1.5 text-right font-medium text-gray-400">Meta</th>
            <th className="pb-1.5 text-right font-medium text-gray-400">Real</th>
            <th className="pb-1.5 text-right font-medium text-gray-400">Diff</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sorted.map((c) => {
            const diff = c.actualAmount - c.targetAmount
            return (
              <tr key={c.id}>
                <td className="py-1.5 text-gray-600">{c.periodKey}</td>
                <td className="py-1.5 text-right text-gray-500">{formatCurrency(c.targetAmount)}</td>
                <td className="py-1.5 text-right font-medium text-gray-700">
                  {formatCurrency(c.actualAmount)}
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
  )
}
