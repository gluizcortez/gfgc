import { useMemo } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { formatCurrency } from '@/lib/formatters'
import { useIncomeStore } from '@/stores/useIncomeStore'
import { INCOME_CATEGORY_LABELS } from '@/types/models'
import type { IncomeEntry, IncomeCategory, EntityId } from '@/types/models'

interface RecurringIncomeModalProps {
  open: boolean
  onClose: () => void
  workspaceId: EntityId
}

interface RecurringGroup {
  key: string
  name: string
  category: IncomeCategory
  amount: number
  isActive: boolean
}

export function RecurringIncomeModal({ open, onClose, workspaceId }: RecurringIncomeModalProps): React.JSX.Element {
  const entries = useIncomeStore((s) => s.entries)
  const removeRecurrence = useIncomeStore((s) => s.removeRecurrence)
  const restoreRecurrence = useIncomeStore((s) => s.restoreRecurrence)

  const recurringGroups = useMemo((): RecurringGroup[] => {
    const wsEntries = entries.filter((e) => e.workspaceId === workspaceId)

    // Find the latest entry for each name+category combination
    const latestMap = new Map<string, IncomeEntry>()
    for (const entry of wsEntries) {
      const key = `${entry.name}::${entry.category}`
      const existing = latestMap.get(key)
      if (!existing || entry.monthKey > existing.monthKey) {
        latestMap.set(key, entry)
      }
    }

    // A group should show if it has or had recurring entries
    const allKeys = new Set<string>()
    for (const entry of wsEntries) {
      allKeys.add(`${entry.name}::${entry.category}`)
    }

    const groupKeys = new Set<string>()
    for (const key of allKeys) {
      const keyEntries = wsEntries.filter((e) => `${e.name}::${e.category}` === key)
      const hasAnyRecurring = keyEntries.some((e) => e.isRecurring)
      const hasMultiple = keyEntries.length > 1
      if (hasAnyRecurring || hasMultiple) {
        groupKeys.add(key)
      }
    }

    return Array.from(groupKeys)
      .map((key) => {
        const latest = latestMap.get(key)!
        const hasAnyActive = wsEntries.some(
          (e) => e.name === latest.name && e.category === latest.category && e.isRecurring
        )
        return {
          key,
          name: latest.name,
          category: latest.category,
          amount: latest.amount,
          isActive: hasAnyActive
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [entries, workspaceId])

  const handleToggle = (group: RecurringGroup): void => {
    if (group.isActive) {
      removeRecurrence(group.name, group.category, workspaceId)
    } else {
      restoreRecurrence(group.name, group.category, workspaceId)
    }
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
            Remova receitas que não devem mais ser geradas automaticamente. A remoção é global — independente do mês atual.
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
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {group.isActive ? 'Ativo' : 'Removido'}
                </span>
                <SimpleTooltip label={group.isActive ? 'Remover recorrência' : 'Restaurar recorrência'}>
                  <button
                    onClick={() => handleToggle(group)}
                    className={`rounded-md p-1.5 ${
                      group.isActive
                        ? 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                        : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    {group.isActive ? <X size={16} /> : <RotateCcw size={16} />}
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
