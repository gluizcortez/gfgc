import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, DollarSign, Pencil, Trash2, Repeat } from 'lucide-react'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { MonthNavigator } from '@/components/layout/MonthNavigator'
import { TabBar } from '@/components/layout/TabBar'
import { IncomeFormModal } from './IncomeFormModal'
import { RecurringIncomeModal } from './RecurringIncomeModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useIncomeStore } from '@/stores/useIncomeStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useUIStore } from '@/stores/useUIStore'
import { formatCurrency, formatDate, getCurrentMonthKey } from '@/lib/formatters'
import { INCOME_CATEGORY_LABELS } from '@/types/models'
import type { IncomeEntry, IncomeCategory } from '@/types/models'

const CATEGORY_COLORS: Record<IncomeCategory, string> = {
  salary: 'bg-green-100 text-green-700',
  freelance: 'bg-blue-100 text-blue-700',
  investments: 'bg-purple-100 text-purple-700',
  bonus: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700'
}

export function IncomePage(): React.JSX.Element {
  const [month, setMonth] = useState(getCurrentMonthKey())
  const [showForm, setShowForm] = useState(false)
  const [showRecurring, setShowRecurring] = useState(false)
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // Workspace state
  const allWorkspaces = useSettingsStore((s) => s.workspaces)
  const addWorkspace = useSettingsStore((s) => s.addWorkspace)
  const updateWorkspace = useSettingsStore((s) => s.updateWorkspace)
  const deleteWorkspaceSettings = useSettingsStore((s) => s.deleteWorkspace)

  const workspaces = useMemo(
    () => allWorkspaces.filter((w) => w.type === 'income'),
    [allWorkspaces]
  )

  const activeId = useUIStore((s) => s.activeIncomeWorkspaceId)
  const setActiveId = useUIStore((s) => s.setActiveIncomeWorkspace)

  const effectiveId = activeId || workspaces[0]?.id || null

  const entries = useIncomeStore((s) => s.entries)
  const addEntry = useIncomeStore((s) => s.addEntry)
  const updateEntry = useIncomeStore((s) => s.updateEntry)
  const deleteEntry = useIncomeStore((s) => s.deleteEntry)
  const generateRecurring = useIncomeStore((s) => s.generateRecurringForMonth)
  const deleteWorkspaceData = useIncomeStore((s) => s.deleteWorkspaceData)
  const addNotification = useUIStore((s) => s.addNotification)

  // Auto-generate recurring income entries
  const autoGenChecked = useRef<string>('')
  useEffect(() => {
    if (!effectiveId) return
    const key = `${effectiveId}::${month}`
    if (autoGenChecked.current === key) return
    autoGenChecked.current = key

    const count = generateRecurring(month, effectiveId)
    if (count > 0) {
      addNotification(`${count} receita(s) recorrente(s) gerada(s)`, 'info')
    }
  }, [month, effectiveId])

  const monthEntries = useMemo(
    () => entries
      .filter((e) => e.workspaceId === effectiveId && e.monthKey === month)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [entries, effectiveId, month]
  )

  const totalIncome = useMemo(
    () => monthEntries.reduce((sum, e) => sum + e.amount, 0),
    [monthEntries]
  )

  const byCategory = useMemo(() => {
    const map = new Map<IncomeCategory, number>()
    for (const entry of monthEntries) {
      map.set(entry.category, (map.get(entry.category) || 0) + entry.amount)
    }
    return map
  }, [monthEntries])

  const handleCreateWorkspace = (name: string): void => {
    const id = addWorkspace(name, 'income')
    setActiveId(id)
    addNotification('Aba de receitas criada', 'success')
  }

  const handleDeleteWorkspace = (id: string): void => {
    deleteWorkspaceSettings(id)
    deleteWorkspaceData(id)
    if (effectiveId === id) {
      setActiveId(workspaces.find((w) => w.id !== id)?.id || null)
    }
    addNotification('Aba de receitas excluída', 'success')
  }

  const handleSave = (data: Omit<IncomeEntry, 'id'>): void => {
    if (editingEntry) {
      updateEntry(editingEntry.id, data)
      addNotification('Receita atualizada', 'success')
    } else {
      addEntry({ ...data, workspaceId: effectiveId! })
      addNotification('Receita registrada', 'success')
    }
    setEditingEntry(null)
  }

  const handleDelete = (): void => {
    if (deleteTarget) {
      deleteEntry(deleteTarget)
      addNotification('Receita removida', 'success')
      setDeleteTarget(null)
    }
  }

  if (workspaces.length === 0) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-bold text-gray-900">Receitas</h1>
        <EmptyState
          icon={DollarSign}
          title="Crie uma aba para começar"
          description="Organize suas receitas em abas separadas (ex: Salário, Freelance)."
          action={{
            label: 'Criar Primeira Aba',
            onClick: () => handleCreateWorkspace('Receitas')
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <TabBar
        workspaces={workspaces}
        activeId={effectiveId}
        onSelect={setActiveId}
        onCreate={handleCreateWorkspace}
        onRename={(id, name) => updateWorkspace(id, { name })}
        onDelete={handleDeleteWorkspace}
      />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Receitas</h1>
          <div className="flex items-center gap-3">
            <MonthNavigator monthKey={month} onChange={setMonth} />
            <SimpleTooltip label="Gerenciar receitas recorrentes">
              <button
                onClick={() => setShowRecurring(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <Repeat size={16} />
                Recorrentes
              </button>
            </SimpleTooltip>
            <SimpleTooltip label="Registrar uma nova fonte de receita neste mês">
              <button
                onClick={() => { setEditingEntry(null); setShowForm(true) }}
                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <Plus size={16} />
                Nova Receita
              </button>
            </SimpleTooltip>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 rounded-xl border border-green-200 bg-green-50 p-4 sm:col-span-1 lg:col-span-2">
            <p className="text-xs font-medium text-green-600 uppercase">Total do Mês</p>
            <p className="mt-1 text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-green-500">{monthEntries.length} receita(s)</p>
          </div>
          {Array.from(byCategory.entries()).map(([cat, amount]) => (
            <div key={cat} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium text-gray-500">{INCOME_CATEGORY_LABELS[cat]}</p>
              <p className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(amount)}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        {monthEntries.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="Nenhuma receita neste mês"
            description="Registre suas fontes de renda para ter uma visão completa das suas finanças."
            action={{ label: 'Adicionar Receita', onClick: () => { setEditingEntry(null); setShowForm(true) } }}
          />
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {monthEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{entry.name}</p>
                        {entry.notes && <p className="text-xs text-gray-400">{entry.notes}</p>}
                        {entry.isRecurring && (
                          <span className="text-xs text-green-500">Recorrente</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[entry.category]}`}>
                        {INCOME_CATEGORY_LABELS[entry.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(entry.date)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-green-700">
                      +{formatCurrency(entry.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <SimpleTooltip label="Editar receita">
                          <button
                            onClick={() => { setEditingEntry(entry); setShowForm(true) }}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <Pencil size={14} />
                          </button>
                        </SimpleTooltip>
                        <SimpleTooltip label="Excluir receita">
                          <button
                            onClick={() => setDeleteTarget(entry.id)}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </SimpleTooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <IncomeFormModal
          open={showForm}
          onClose={() => { setShowForm(false); setEditingEntry(null) }}
          onSave={handleSave}
          initialData={editingEntry}
          defaultMonth={month}
        />

        <RecurringIncomeModal
          open={showRecurring}
          onClose={() => setShowRecurring(false)}
          workspaceId={effectiveId!}
        />

        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Excluir Receita"
          message="Tem certeza que deseja excluir esta receita?"
          confirmLabel="Excluir"
          danger
        />
      </div>
    </div>
  )
}
