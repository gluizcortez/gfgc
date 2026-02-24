import { useState, useEffect, useMemo } from 'react'
import { CheckCircle, Undo2 } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { AttachmentInput } from '@/components/shared/AttachmentInput'
import { getEffectiveStatus } from '@/lib/billStatus'
import { useSettingsStore } from '@/stores/useSettingsStore'
import type { BillEntry, BillStatus, EntityId, Attachment } from '@/types/models'

interface BillFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<BillEntry, 'id'>, isRecurring?: boolean) => void
  onToggleStatus?: (entryId: string, newStatus: BillStatus) => void
  initialData?: BillEntry | null
}

export function BillFormModal({
  open,
  onClose,
  onSave,
  onToggleStatus,
  initialData
}: BillFormModalProps): React.JSX.Element {
  const allCategories = useSettingsStore((s) => s.settings.categories)
  const categories = useMemo(
    () => allCategories.filter((c) => c.type === 'bill' || c.type === 'both'),
    [allCategories]
  )

  const [name, setName] = useState('')
  const [value, setValue] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [categoryId, setCategoryId] = useState<EntityId>('')
  const [notes, setNotes] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])

  useEffect(() => {
    if (!open) return
    if (initialData) {
      setName(initialData.name)
      setValue(initialData.value)
      setDueDate(initialData.dueDate)
      setCategoryId(initialData.categoryId)
      setNotes(initialData.notes)
      setIsRecurring(false)
      setAttachments(initialData.attachments || [])
    } else {
      setName('')
      setValue(0)
      setDueDate('')
      setCategoryId(categories[0]?.id || '')
      setNotes('')
      setIsRecurring(false)
      setAttachments([])
    }
  }, [initialData, open])

  const isPaste = initialData?.id === '__paste__'

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    const isEditing = !!initialData && !isPaste
    const wasPaid = isEditing && initialData!.status === 'paid'
    onSave(
      {
        billId: initialData?.billId || '',
        name,
        value,
        dueDate,
        categoryId,
        status: wasPaid ? 'paid' : 'pending',
        // Preserve paidDate explicitly so Object.assign doesn't rely on it already being there
        paidDate: wasPaid ? initialData!.paidDate : undefined,
        notes,
        customFields: initialData?.customFields || {},
        attachments
      },
      isRecurring || undefined
    )
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initialData && !isPaste ? 'Editar Conta' : isPaste ? 'Colar Conta' : 'Nova Conta'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nome</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Aluguel, Internet, Energia..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <CurrencyInput label="Valor" value={value} onChange={setValue} />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Vencimento</label>
          <input
            required
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Categoria</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {(!initialData || isPaste) && (
          <div className="rounded-lg border border-gray-200 p-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Esta conta é recorrente (repete todo mês)</span>
            </label>
            {isRecurring && (
              <p className="mt-1.5 pl-6 text-xs text-gray-400">
                Um template será criado. Gerencie em <strong>Recorrentes</strong> para pausar ou cancelar.
              </p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Anexos</label>
          <AttachmentInput attachments={attachments} onChange={setAttachments} />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            {initialData && !isPaste && onToggleStatus && (() => {
              const effective = getEffectiveStatus(initialData)
              const isPaid = effective === 'paid'
              return (
                <button
                  type="button"
                  onClick={() => {
                    onToggleStatus(initialData.id, isPaid ? 'pending' : 'paid')
                    onClose()
                  }}
                  className={
                    isPaid
                      ? 'flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50'
                      : 'flex items-center gap-1.5 rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50'
                  }
                >
                  {isPaid ? <Undo2 size={15} /> : <CheckCircle size={15} />}
                  {isPaid ? 'Desfazer Pagamento' : 'Marcar como Pago'}
                </button>
              )
            })()}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={value <= 0}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {initialData && !isPaste ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
