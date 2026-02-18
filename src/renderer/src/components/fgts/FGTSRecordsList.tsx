import { Pencil, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency, formatMonthYear } from '@/lib/formatters'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import type { FGTSRecord } from '@/types/models'

interface FGTSRecordsListProps {
  records: FGTSRecord[]
  onEdit: (record: FGTSRecord) => void
  onDelete: (id: string) => void
}

export function FGTSRecordsList({
  records,
  onEdit,
  onDelete
}: FGTSRecordsListProps): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
              Mês
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
              Saldo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
              Variação
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
              Observações
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium tracking-wide text-gray-500 uppercase">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {records.map((record, idx) => {
            const prevRecord = records[idx + 1]
            const diff = prevRecord ? record.balance - prevRecord.balance : 0
            const hasPrev = !!prevRecord

            return (
              <tr key={record.id} className="transition-colors hover:bg-gray-50/50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {formatMonthYear(record.monthKey)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-green-700">
                  {formatCurrency(record.balance)}
                </td>
                <td className="px-4 py-3">
                  {hasPrev ? (
                    <div className="flex items-center gap-1">
                      {diff > 0 ? (
                        <TrendingUp size={14} className="text-green-500" />
                      ) : diff < 0 ? (
                        <TrendingDown size={14} className="text-red-500" />
                      ) : (
                        <Minus size={14} className="text-gray-400" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-400'
                        }`}
                      >
                        {diff > 0 ? '+' : ''}
                        {formatCurrency(diff)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                  {record.notes || '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <SimpleTooltip label="Editar registro">
                      <button
                        onClick={() => onEdit(record)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Pencil size={15} />
                      </button>
                    </SimpleTooltip>
                    <SimpleTooltip label="Excluir registro">
                      <button
                        onClick={() => onDelete(record.id)}
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
  )
}
