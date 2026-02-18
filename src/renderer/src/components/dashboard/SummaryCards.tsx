import { Receipt, TrendingUp, Target, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { calculateBillsTotals } from '@/lib/calculations'
import type { BillEntry, Investment, InvestmentTransaction, Goal } from '@/types/models'

interface SummaryCardsProps {
  bills: BillEntry[]
  investments: Investment[]
  monthTransactions: InvestmentTransaction[]
  goals: Goal[]
}

export function SummaryCards({ bills, investments, monthTransactions, goals }: SummaryCardsProps): React.JSX.Element {
  const billTotals = calculateBillsTotals(bills)

  const monthContributions = monthTransactions
    .filter((t) => t.type === 'contribution')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalBalance = investments.reduce((sum, i) => sum + i.currentBalance, 0)

  const onTrackGoals = goals.filter((g) => {
    if (g.contributions.length === 0) return false
    const last = g.contributions[g.contributions.length - 1]
    return last.actualAmount >= last.targetAmount
  })

  const cards = [
    {
      label: 'Total Contas',
      value: formatCurrency(billTotals.total),
      sub: `${billTotals.count} contas`,
      icon: Receipt,
      color: 'text-gray-700'
    },
    {
      label: 'Contas Pagas',
      value: formatCurrency(billTotals.paid),
      sub: `de ${formatCurrency(billTotals.total)}`,
      icon: CheckCircle,
      color: 'text-green-700'
    },
    {
      label: 'Aportes do Mês',
      value: formatCurrency(monthContributions),
      sub: `Saldo: ${formatCurrency(totalBalance)}`,
      icon: TrendingUp,
      color: 'text-blue-700'
    },
    {
      label: 'Metas no Alvo',
      value: `${onTrackGoals.length}/${goals.length}`,
      sub: 'metas ativas',
      icon: Target,
      color: 'text-purple-700'
    }
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color }) => (
        <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Icon size={18} className={color} />
            <span className="text-sm font-medium text-gray-500">{label}</span>
          </div>
          <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
          <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
        </div>
      ))}
    </div>
  )
}
