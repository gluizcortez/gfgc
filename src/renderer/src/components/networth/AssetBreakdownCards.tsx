import { formatCurrency } from '@/lib/formatters'
import { INVESTMENT_TYPE_LABELS } from '@/types/models'
import type { Investment, InvestmentType } from '@/types/models'

interface AssetBreakdownCardsProps {
  investments: Investment[]
  fgtsBalance: number
  netWorth: number
}

export function AssetBreakdownCards({ investments, fgtsBalance, netWorth }: AssetBreakdownCardsProps): React.JSX.Element {
  // Group by investment type
  const groups = new Map<string, number>()
  for (const inv of investments) {
    const current = groups.get(inv.type) || 0
    groups.set(inv.type, current + inv.currentBalance)
  }

  if (fgtsBalance > 0) {
    groups.set('fgts', fgtsBalance)
  }

  const entries = Array.from(groups.entries())
    .map(([type, amount]) => ({
      type,
      label: type === 'fgts' ? 'FGTS' : INVESTMENT_TYPE_LABELS[type as InvestmentType] || type,
      amount,
      percentage: netWorth > 0 ? (amount / netWorth) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)

  const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry, i) => (
        <div key={entry.type} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-sm font-medium text-gray-700">{entry.label}</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(entry.amount)}</p>
          <div className="mt-2">
            <div className="h-1.5 rounded-full bg-gray-100">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${Math.min(entry.percentage, 100)}%`, backgroundColor: colors[i % colors.length] }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">{Math.round(entry.percentage)}% do patrimônio</p>
          </div>
        </div>
      ))}
    </div>
  )
}
