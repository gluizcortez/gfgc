import { useState } from 'react'
import { Pencil, Trash2, CircleCheck, Undo2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { getEffectiveStatus } from '@/lib/billStatus'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useSettingsStore } from '@/stores/useSettingsStore'
import type { BillEntry, BillStatus } from '@/types/models'

interface BillsTableProps {
  bills: BillEntry[]
  onEdit: (entry: BillEntry) => void
  onDelete: (entryId: string) => void
  onToggleStatus: (entryId: string, newStatus: BillStatus) => void
}

export function BillsTable({
  bills,
  onEdit,
  onDelete,
  onToggleStatus
}: BillsTableProps): React.JSX.Element {
  const categories = useSettingsStore((s) => s.settings.categories)
  const [payTarget, setPayTarget] = useState<BillEntry | null>(null)

  const getCategoryName = (id: string): string => {
    return categories.find((c) => c.id === id)?.name || 'Sem categoria'
  }

  const getCategoryColor = (id: string): string => {
    return categories.find((c) => c.id === id)?.color || '#737373'
  }

  const sorted = [...bills].sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Valor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Vencimento
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Categoria
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium tracking-wide text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((entry) => {
              const effective = getEffectiveStatus(entry)
              const isPaid = effective === 'paid'
              return (
                <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">{entry.name}</span>
                    {entry.notes && (
                      <p className="mt-0.5 text-xs text-gray-400 truncate max-w-[200px]">{entry.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">
                    {formatCurrency(entry.value)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(entry.dueDate)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: getCategoryColor(entry.categoryId) }}
                      />
                      {getCategoryName(entry.categoryId)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={effective} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {isPaid ? (
                        <SimpleTooltip label="Desfazer pagamento">
                          <button
                            onClick={() => onToggleStatus(entry.id, 'pending')}
                            className="rounded-md p-1.5 text-green-500 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <Undo2 size={15} />
                          </button>
                        </SimpleTooltip>
                      ) : (
                        <SimpleTooltip label="Confirmar pagamento desta conta">
                          <button
                            onClick={() => setPayTarget(entry)}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                          >
                            <CircleCheck size={15} />
                          </button>
                        </SimpleTooltip>
                      )}
                      <SimpleTooltip label="Editar conta">
                        <button
                          onClick={() => onEdit(entry)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Pencil size={15} />
                        </button>
                      </SimpleTooltip>
                      <SimpleTooltip label="Excluir conta">
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </SimpleTooltip>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!payTarget}
        onClose={() => setPayTarget(null)}
        onConfirm={() => {
          if (payTarget) {
            onToggleStatus(payTarget.id, 'paid')
            setPayTarget(null)
          }
        }}
        title="Confirmar Pagamento"
        message={payTarget ? `Deseja confirmar o pagamento de "${payTarget.name}" no valor de ${formatCurrency(payTarget.value)}?` : ''}
        confirmLabel="Confirmar Pagamento"
      />
    </>
  )
}
