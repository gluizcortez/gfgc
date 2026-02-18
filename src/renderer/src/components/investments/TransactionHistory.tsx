import { useMemo } from 'react'
import { Trash2, ArrowUpCircle, ArrowDownCircle, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate, formatMonthYear } from '@/lib/formatters'
import { EmptyState } from '@/components/shared/EmptyState'
import { AttachmentList } from '@/components/shared/AttachmentList'
import type { InvestmentTransaction, Investment } from '@/types/models'

interface TransactionHistoryProps {
  transactions: InvestmentTransaction[]
  investments: Investment[]
  onDelete: (id: string) => void
}

interface GroupedTransactions {
  monthKey: string
  label: string
  transactions: InvestmentTransaction[]
  monthTotal: number
}

export function TransactionHistory({
  transactions,
  investments,
  onDelete
}: TransactionHistoryProps): React.JSX.Element {
  const investmentMap = useMemo(() => {
    const map = new Map<string, string>()
    investments.forEach((inv) => map.set(inv.id, inv.name))
    return map
  }, [investments])

  const grouped = useMemo((): GroupedTransactions[] => {
    const groups = new Map<string, InvestmentTransaction[]>()
    for (const tx of transactions) {
      const existing = groups.get(tx.monthKey) || []
      existing.push(tx)
      groups.set(tx.monthKey, existing)
    }

    return Array.from(groups.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([monthKey, txs]) => ({
        monthKey,
        label: formatMonthYear(monthKey),
        transactions: txs.sort((a, b) => b.date.localeCompare(a.date)),
        monthTotal: txs.reduce(
          (sum, tx) => sum + ((tx.type === 'contribution' || tx.type === 'yield') ? tx.amount : -tx.amount),
          0
        )
      }))
  }, [transactions])

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Nenhuma movimentação"
        description="Registre aportes ou retiradas para visualizar o histórico."
      />
    )
  }

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.monthKey}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">{group.label}</h3>
            <span
              className={`text-sm font-medium ${group.monthTotal >= 0 ? 'text-green-700' : 'text-red-600'}`}
            >
              {group.monthTotal >= 0 ? '+' : ''}
              {formatCurrency(group.monthTotal)}
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="divide-y divide-gray-100">
              {group.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50/50"
                >
                  {tx.type === 'contribution' ? (
                    <ArrowUpCircle size={20} className="shrink-0 text-green-500" />
                  ) : tx.type === 'yield' ? (
                    <TrendingUp size={20} className="shrink-0 text-amber-500" />
                  ) : (
                    <ArrowDownCircle size={20} className="shrink-0 text-red-500" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {investmentMap.get(tx.investmentId) || 'Investimento removido'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(tx.date)}
                      {tx.notes && ` — ${tx.notes}`}
                    </p>
                    {tx.attachments && tx.attachments.length > 0 && (
                      <div className="mt-0.5">
                        <AttachmentList attachments={tx.attachments} />
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-sm font-semibold ${tx.type === 'yield' ? 'text-amber-600' : tx.type === 'contribution' ? 'text-green-700' : 'text-red-600'}`}
                  >
                    {tx.type === 'withdrawal' ? '-' : '+'}
                    {formatCurrency(tx.amount)}
                  </span>
                  <button
                    onClick={() => onDelete(tx.id)}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Excluir movimentação"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
