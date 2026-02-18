import { useState, useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { useBillsStore } from '@/stores/useBillsStore'
import { useUIStore } from '@/stores/useUIStore'
import { formatMonthYear, formatCurrency, getCurrentMonthKey, getNextMonthKey, getPrevMonthKey } from '@/lib/formatters'
import type { MonthKey, EntityId } from '@/types/models'

interface DuplicateMonthModalProps {
  open: boolean
  onClose: () => void
  workspaceId: EntityId
  currentMonth: MonthKey
}

function generateMonthOptions(center: MonthKey): MonthKey[] {
  const options: MonthKey[] = []
  let m = center
  for (let i = 0; i < 6; i++) m = getPrevMonthKey(m)
  for (let i = 0; i < 13; i++) {
    options.push(m)
    m = getNextMonthKey(m)
  }
  return options
}

export function DuplicateMonthModal({ open, onClose, workspaceId, currentMonth }: DuplicateMonthModalProps): React.JSX.Element | null {
  const duplicateMonth = useBillsStore((s) => s.duplicateMonth)
  const monthlyRecords = useBillsStore((s) => s.monthlyRecords)
  const addNotification = useUIStore((s) => s.addNotification)

  const [sourceMonth, setSourceMonth] = useState(currentMonth)
  const [targetMonth, setTargetMonth] = useState(() => getNextMonthKey(currentMonth))

  const monthOptions = generateMonthOptions(getCurrentMonthKey())

  const targetRecord = monthlyRecords.find(
    (r) => r.workspaceId === workspaceId && r.monthKey === targetMonth
  )
  const targetHasData = targetRecord && targetRecord.bills.length > 0

  const sourceRecord = monthlyRecords.find(
    (r) => r.workspaceId === workspaceId && r.monthKey === sourceMonth
  )
  const sourceCount = sourceRecord?.bills.length || 0

  const handleDuplicate = (): void => {
    if (sourceMonth === targetMonth) return
    duplicateMonth(workspaceId, sourceMonth, targetMonth)
    addNotification(`${sourceCount} contas duplicadas para ${formatMonthYear(targetMonth)}`, 'success')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Duplicar Mês">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mês de Origem</label>
          <select
            value={sourceMonth}
            onChange={(e) => setSourceMonth(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>{formatMonthYear(m)}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {sourceCount > 0 ? `${sourceCount} contas encontradas` : 'Nenhuma conta neste mês'}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mês de Destino</label>
          <select
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>{formatMonthYear(m)}</option>
            ))}
          </select>
        </div>

        {/* Preview of bills to be copied */}
        {sourceRecord && sourceRecord.bills.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-600">Contas que serão copiadas:</p>
            <div className="max-h-40 overflow-auto rounded-lg border border-gray-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-gray-500">
                    <th className="px-3 py-1.5">Nome</th>
                    <th className="px-3 py-1.5 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sourceRecord.bills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="px-3 py-1.5 text-gray-700">{bill.name}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-gray-900">
                        {formatCurrency(bill.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td className="px-3 py-1.5 font-medium text-gray-700">Total</td>
                    <td className="px-3 py-1.5 text-right font-bold text-gray-900">
                      {formatCurrency(sourceRecord.bills.reduce((sum, b) => sum + b.value, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {targetHasData && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              O mês de destino já possui {targetRecord.bills.length} contas. Elas serão substituídas.
            </p>
          </div>
        )}

        {sourceMonth === targetMonth && (
          <p className="text-xs text-red-500">Selecione meses diferentes para origem e destino.</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDuplicate}
            disabled={sourceCount === 0 || sourceMonth === targetMonth}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Duplicar
          </button>
        </div>
      </div>
    </Modal>
  )
}
