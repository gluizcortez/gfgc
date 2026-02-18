import { useMemo } from 'react'
import { Pause, Play } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { formatCurrency } from '@/lib/formatters'
import { useIncomeStore } from '@/stores/useIncomeStore'
import { INCOME_CATEGORY_LABELS } from '@/types/models'
import type { IncomeEntry, IncomeCategory } from '@/types/models'

interface RecurringIncomeModalProps {
  open: boolean
  onClose: () => void
}

interface RecurringGroup {
  key: string
  name: string
  category: IncomeCategory
  amount: number
  latestEntry: IncomeEntry
  isActive: boolean
}

export function RecurringIncomeModal({ open, onClose }: RecurringIncomeModalProps): React.JSX.Element {
  const entries = useIncomeStore((s) => s.entries)
  const updateEntry = useIncomeStore((s) => s.updateEntry)

  const recurringGroups = useMemo((): RecurringGroup[] => {
    // Find the latest entry for each name+category combination
    const map = new Map<string, IncomeEntry>()
    for (const entry of entries) {
      const key = `${entry.name}::${entry.category}`
      const existing = map.get(key)
      if (!existing || entry.monthKey > existing.monthKey) {
        map.set(key, entry)
      }
    }

    // Only show entries that were ever recurring
    const allRecurring = entries.filter((e) => e.isRecurring)
    const recurringKeys = new Set(allRecurring.map((e) => `${e.name}::${e.category}`))

    return Array.from(recurringKeys)
      .map((key) => {
        const latest = map.get(key)!
        return {
          key,
          name: latest.name,
          category: latest.category,
          amount: latest.amount,
          latestEntry: latest,
          isActive: latest.isRecurring
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [entries])

  const handleToggle = (group: RecurringGroup): void => {
    updateEntry(group.latestEntry.id, { isRecurring: !group.isActive })
  }

  return (
    <Modal open={open} onClose={onClose} title="Receitas Recorrentes">
      {recurringGroups.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          Nenhuma receita recorrente cadastrada.
        </p>
      ) : (
        <div className="space-y-1">
          <p className="mb-3 text-xs text-gray-400">
            Pause receitas que não devem mais ser geradas automaticamente nos próximos meses.
          </p>
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {recurringGroups.map((group) => (
              <div key={group.key} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{group.name}</p>
                  <p className="text-xs text-gray-400">
                    {INCOME_CATEGORY_LABELS[group.category]} · {formatCurrency(group.amount)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    group.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {group.isActive ? 'Ativo' : 'Pausado'}
                </span>
                <SimpleTooltip label={group.isActive ? 'Pausar recorrência' : 'Reativar recorrência'}>
                  <button
                    onClick={() => handleToggle(group)}
                    className={`rounded-md p-1.5 ${
                      group.isActive
                        ? 'text-green-500 hover:bg-amber-50 hover:text-amber-600'
                        : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    {group.isActive ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </SimpleTooltip>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
