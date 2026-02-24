import { useState, useMemo } from 'react'
import { CalendarX2 } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useBillsStore } from '@/stores/useBillsStore'
import type { EntityId, MonthKey } from '@/types/models'

interface RecurringBillsModalProps {
  open: boolean
  onClose: () => void
  workspaceId: EntityId
  currentMonth: MonthKey
}

export function RecurringBillsModal({ open, onClose, workspaceId, currentMonth }: RecurringBillsModalProps): React.JSX.Element {
  const monthlyRecords = useBillsStore((s) => s.monthlyRecords)
  const cancelSeriesEntries = useBillsStore((s) => s.cancelSeriesEntries)

  const existingSeries = useMemo(() => {
    const seriesMap = new Map<string, { baseName: string; total: number; remaining: number }>()
    for (const record of monthlyRecords) {
      if (record.workspaceId !== workspaceId) continue
      for (const entry of record.bills) {
        if (entry.billId !== '') continue
        const match = entry.name.match(/^(.+) \((\d+)\/(\d+)\)$/)
        if (!match) continue
        const baseName = match[1]
        const total = Number(match[3])
        const key = `${baseName}|||${total}`
        const current = seriesMap.get(key) || { baseName, total, remaining: 0 }
        if (record.monthKey >= currentMonth) current.remaining++
        seriesMap.set(key, current)
      }
    }
    return [...seriesMap.values()].sort((a, b) => a.baseName.localeCompare(b.baseName))
  }, [monthlyRecords, workspaceId, currentMonth])

  const [cancelSeriesTarget, setCancelSeriesTarget] = useState<{ baseName: string; total: number } | null>(null)

  return (
    <Modal open={open} onClose={onClose} title="Contas Recorrentes">
      <div className="space-y-3">
        <p className="text-xs text-gray-400">
          Contas criadas com &quot;Repetir nos próximos meses&quot; aparecem aqui. Cancele entradas futuras quando necessário.
        </p>

        {existingSeries.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            Nenhuma série encontrada. Ao criar uma conta com &quot;Repetir nos próximos meses&quot;, ela aparecerá aqui.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 max-h-[50vh] overflow-auto">
            {existingSeries.map((s) => (
              <div key={`${s.baseName}|||${s.total}`} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{s.baseName}</p>
                  <p className="text-xs text-gray-400">
                    {s.total} meses · {s.remaining} {s.remaining === 1 ? 'entrada restante' : 'entradas restantes'} a partir do mês atual
                  </p>
                </div>
                {s.remaining > 0 && (
                  <SimpleTooltip label="Cancelar entradas restantes a partir do mês atual">
                    <button
                      onClick={() => setCancelSeriesTarget({ baseName: s.baseName, total: s.total })}
                      className="shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-orange-50 hover:text-orange-500"
                    >
                      <CalendarX2 size={15} />
                    </button>
                  </SimpleTooltip>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!cancelSeriesTarget}
        onClose={() => setCancelSeriesTarget(null)}
        onConfirm={() => {
          if (cancelSeriesTarget) {
            cancelSeriesEntries(workspaceId, cancelSeriesTarget.baseName, cancelSeriesTarget.total, currentMonth)
            setCancelSeriesTarget(null)
          }
        }}
        title="Cancelar Série"
        message={cancelSeriesTarget ? `Cancelar as entradas restantes de "${cancelSeriesTarget.baseName}" a partir do mês atual? Meses anteriores não serão afetados.` : ''}
        confirmLabel="Cancelar Série"
        danger
      />
    </Modal>
  )
}
