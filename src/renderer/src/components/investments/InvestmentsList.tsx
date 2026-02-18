import { useMemo } from 'react'
import { Pencil, Trash2, Eye } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { INVESTMENT_TYPE_LABELS } from '@/types/models'
import type { Investment, InvestmentTransaction } from '@/types/models'

interface InvestmentsListProps {
  investments: Investment[]
  transactions: InvestmentTransaction[]
  onEdit: (inv: Investment) => void
  onDelete: (id: string) => void
  onView: (inv: Investment) => void
}

export function InvestmentsList({
  investments,
  transactions,
  onEdit,
  onDelete,
  onView
}: InvestmentsListProps): React.JSX.Element {
  const investmentStats = useMemo(() => {
    return investments.map((inv) => {
      const invTxs = transactions.filter((t) => t.investmentId === inv.id)
      const totalContributions = invTxs
        .filter((t) => t.type === 'contribution')
        .reduce((sum, t) => sum + t.amount, 0)
      const totalWithdrawals = invTxs
        .filter((t) => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0)
      return {
        ...inv,
        totalContributions,
        totalWithdrawals,
        transactionCount: invTxs.length
      }
    })
  }, [investments, transactions])

  return (
    <div className="space-y-3">
      {investmentStats.map((inv) => (
        <div
          key={inv.id}
          className="rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{inv.name}</h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {INVESTMENT_TYPE_LABELS[inv.type]}
                </span>
              </div>
              {inv.notes && (
                <p className="mt-1 text-sm text-gray-500">{inv.notes}</p>
              )}
              <div className="mt-3 flex items-center gap-6">
                <div>
                  <p className="text-xs text-gray-400">Saldo Atual</p>
                  <p className="text-lg font-bold text-green-700">
                    {formatCurrency(inv.currentBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Aportado</p>
                  <p className="text-sm font-medium text-blue-700">
                    {formatCurrency(inv.totalContributions)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Retirado</p>
                  <p className="text-sm font-medium text-red-600">
                    {formatCurrency(inv.totalWithdrawals)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Movimentações</p>
                  <p className="text-sm font-medium text-gray-700">
                    {inv.transactionCount}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <SimpleTooltip label="Ver detalhes e histórico do investimento">
                <button
                  onClick={() => onView(inv)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600"
                >
                  <Eye size={15} />
                </button>
              </SimpleTooltip>
              <SimpleTooltip label="Editar investimento">
                <button
                  onClick={() => onEdit(inv)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <Pencil size={15} />
                </button>
              </SimpleTooltip>
              <SimpleTooltip label="Excluir investimento e movimentações">
                <button
                  onClick={() => onDelete(inv.id)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </SimpleTooltip>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
