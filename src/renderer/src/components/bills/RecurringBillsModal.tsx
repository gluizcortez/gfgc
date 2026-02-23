import { useState, useMemo } from 'react'
import { X, RotateCcw, Pencil, Trash2, Check, Plus, CalendarX2 } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatCurrency } from '@/lib/formatters'
import { useBillsStore } from '@/stores/useBillsStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import type { Bill, EntityId, MonthKey } from '@/types/models'

interface RecurringBillsModalProps {
  open: boolean
  onClose: () => void
  workspaceId: EntityId
  currentMonth: MonthKey
}

interface EditState {
  name: string
  value: number
  dueDay: number
  categoryId: string
  notes: string
}

export function RecurringBillsModal({ open, onClose, workspaceId, currentMonth }: RecurringBillsModalProps): React.JSX.Element {
  const bills = useBillsStore((s) => s.bills)
  const monthlyRecords = useBillsStore((s) => s.monthlyRecords)
  const addBill = useBillsStore((s) => s.addBill)
  const updateBill = useBillsStore((s) => s.updateBill)
  const deleteBill = useBillsStore((s) => s.deleteBill)
  const cancelFutureEntries = useBillsStore((s) => s.cancelFutureEntries)

  const allCategories = useSettingsStore((s) => s.settings.categories)
  const categories = useMemo(
    () => allCategories.filter((c) => c.type === 'bill' || c.type === 'both'),
    [allCategories]
  )

  const wsBills = useMemo(
    () => bills.filter((b) => b.workspaceId === workspaceId).sort((a, b) => a.name.localeCompare(b.name)),
    [bills, workspaceId]
  )

  const billStats = useMemo(() => {
    const stats = new Map<string, { monthCount: number; entryCount: number }>()
    for (const bill of wsBills) {
      let monthCount = 0
      let entryCount = 0
      for (const record of monthlyRecords) {
        if (record.workspaceId === workspaceId) {
          const entries = record.bills.filter((e) => e.billId === bill.id)
          if (entries.length > 0) {
            monthCount++
            entryCount += entries.length
          }
        }
      }
      stats.set(bill.id, { monthCount, entryCount })
    }
    return stats
  }, [wsBills, monthlyRecords, workspaceId])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ name: '', value: 0, dueDay: 1, categoryId: '', notes: '' })
  const [deleteTarget, setDeleteTarget] = useState<Bill | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Bill | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newBill, setNewBill] = useState<EditState>({ name: '', value: 0, dueDay: 1, categoryId: categories[0]?.id || '', notes: '' })

  const startEdit = (bill: Bill): void => {
    setEditingId(bill.id)
    setEditState({ name: bill.name, value: bill.value, dueDay: bill.dueDay, categoryId: bill.categoryId, notes: bill.notes })
  }

  const saveEdit = (): void => {
    if (!editingId) return
    updateBill(editingId, {
      name: editState.name,
      value: editState.value,
      dueDay: editState.dueDay,
      categoryId: editState.categoryId,
      notes: editState.notes
    })
    setEditingId(null)
  }

  const handleCreate = (): void => {
    if (!newBill.name || newBill.value <= 0) return
    addBill({
      workspaceId,
      name: newBill.name,
      value: newBill.value,
      dueDay: newBill.dueDay,
      categoryId: newBill.categoryId || categories[0]?.id || '',
      notes: newBill.notes,
      isRecurring: true,
      customFields: {}
    })
    setNewBill({ name: '', value: 0, dueDay: 1, categoryId: categories[0]?.id || '', notes: '' })
    setShowCreate(false)
  }

  const getCategoryName = (id: string): string =>
    categories.find((c) => c.id === id)?.name || 'Sem categoria'

  return (
    <Modal open={open} onClose={onClose} title="Contas Recorrentes (Templates)">
      <div className="space-y-3">
        <p className="text-xs text-gray-400">
          Templates são usados para gerar contas automaticamente a cada mês. Edite, pause ou remova conforme necessário.
        </p>

        {/* Create button */}
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-500 hover:border-primary-400 hover:text-primary-600"
          >
            <Plus size={15} />
            Novo Template
          </button>
        )}

        {/* Create form */}
        {showCreate && (
          <div className="rounded-lg border border-primary-200 bg-primary-50/40 p-3 space-y-2">
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Novo Template</p>
            <input
              autoFocus
              placeholder="Nome da conta"
              value={newBill.name}
              onChange={(e) => setNewBill((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <CurrencyInput label="Valor" value={newBill.value} onChange={(v) => setNewBill((p) => ({ ...p, value: v }))} />
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Dia de vencimento</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={newBill.dueDay}
                  onChange={(e) => setNewBill((p) => ({ ...p, dueDay: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
            <select
              value={newBill.categoryId}
              onChange={(e) => setNewBill((p) => ({ ...p, categoryId: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              placeholder="Observações (opcional)"
              value={newBill.notes}
              onChange={(e) => setNewBill((p) => ({ ...p, notes: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCreate}
                disabled={!newBill.name || newBill.value <= 0}
                className="flex-1 rounded-lg bg-primary-600 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-40"
              >
                Criar
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg px-4 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Bills list */}
        {wsBills.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Nenhum template cadastrado. Crie um template para gerar contas automaticamente a cada mês.</p>
        ) : (
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 max-h-[50vh] overflow-auto">
            {wsBills.map((bill) =>
              editingId === bill.id ? (
                /* Inline edit form */
                <div key={bill.id} className="p-3 space-y-2 bg-gray-50">
                  <input
                    autoFocus
                    value={editState.name}
                    onChange={(e) => setEditState((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <CurrencyInput label="Valor" value={editState.value} onChange={(v) => setEditState((p) => ({ ...p, value: v }))} />
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Dia vencimento</label>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={editState.dueDay}
                        onChange={(e) => setEditState((p) => ({ ...p, dueDay: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <select
                    value={editState.categoryId}
                    onChange={(e) => setEditState((p) => ({ ...p, categoryId: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <input
                    placeholder="Observações"
                    value={editState.notes}
                    onChange={(e) => setEditState((p) => ({ ...p, notes: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
                  />
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveEdit} className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700">
                      <Check size={14} /> Salvar
                    </button>
                    <button onClick={() => setEditingId(null)} className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal row */
                <div key={bill.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{bill.name}</p>
                    <p className="text-xs text-gray-400">
                      {getCategoryName(bill.categoryId)} · dia {bill.dueDay} · {formatCurrency(bill.value)}
                    </p>
                    {(() => {
                      const stats = billStats.get(bill.id)
                      return stats && stats.entryCount > 0 ? (
                        <p className="text-xs text-gray-400">{stats.entryCount} {stats.entryCount === 1 ? 'entrada gerada' : 'entradas geradas'} em {stats.monthCount} {stats.monthCount === 1 ? 'mês' : 'meses'}</p>
                      ) : (
                        <p className="text-xs text-gray-400">Nenhuma entrada gerada ainda</p>
                      )
                    })()}
                    {bill.notes && <p className="text-xs text-gray-400 truncate">{bill.notes}</p>}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      bill.isRecurring ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {bill.isRecurring ? 'Ativo' : 'Pausado'}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <SimpleTooltip label={bill.isRecurring ? 'Pausar geração automática' : 'Reativar geração automática'}>
                      <button
                        onClick={() => updateBill(bill.id, { isRecurring: !bill.isRecurring })}
                        className={`rounded-md p-1.5 ${
                          bill.isRecurring
                            ? 'text-gray-400 hover:bg-amber-50 hover:text-amber-500'
                            : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                        }`}
                      >
                        {bill.isRecurring ? <X size={15} /> : <RotateCcw size={15} />}
                      </button>
                    </SimpleTooltip>
                    <SimpleTooltip label="Cancelar ocorrências futuras a partir do mês atual">
                      <button
                        onClick={() => setCancelTarget(bill)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-orange-50 hover:text-orange-500"
                      >
                        <CalendarX2 size={15} />
                      </button>
                    </SimpleTooltip>
                    <SimpleTooltip label="Editar template">
                      <button
                        onClick={() => startEdit(bill)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Pencil size={15} />
                      </button>
                    </SimpleTooltip>
                    <SimpleTooltip label="Excluir template">
                      <button
                        onClick={() => setDeleteTarget(bill)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </SimpleTooltip>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteBill(deleteTarget.id)
            setDeleteTarget(null)
          }
        }}
        title="Excluir Template"
        message={deleteTarget ? `Excluir o template "${deleteTarget.name}"? Contas já geradas nos meses anteriores não serão afetadas.` : ''}
        confirmLabel="Excluir"
        danger
      />

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (cancelTarget) {
            cancelFutureEntries(cancelTarget.id, currentMonth)
            setCancelTarget(null)
          }
        }}
        title="Cancelar Ocorrências Futuras"
        message={cancelTarget ? `Cancelar todas as contas "${cancelTarget.name}" a partir do mês atual (${currentMonth}) e pausar o template? Contas de meses anteriores não serão afetadas.` : ''}
        confirmLabel="Cancelar Futuras"
        danger
      />
    </Modal>
  )
}
