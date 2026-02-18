import { useState, useEffect } from 'react'
import { Modal } from '@/components/shared/Modal'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { INCOME_CATEGORY_LABELS } from '@/types/models'
import type { IncomeEntry, IncomeCategory } from '@/types/models'

interface IncomeFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<IncomeEntry, 'id'>) => void
  initialData?: IncomeEntry | null
  defaultMonth: string
}

export function IncomeFormModal({ open, onClose, onSave, initialData, defaultMonth }: IncomeFormModalProps): React.JSX.Element {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(0)
  const [category, setCategory] = useState<IncomeCategory>('salary')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initialData) {
      setName(initialData.name)
      setAmount(initialData.amount)
      setCategory(initialData.category)
      setDate(initialData.date)
      setNotes(initialData.notes)
      setIsRecurring(initialData.isRecurring)
    } else {
      setName('')
      setAmount(0)
      setCategory('salary')
      setDate(new Date().toISOString().split('T')[0])
      setNotes('')
      setIsRecurring(false)
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    const [y, m] = date.split('-')
    const monthKey = `${y}-${m}`
    onSave({ name, amount, category, date, notes, isRecurring, monthKey })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'Editar Receita' : 'Nova Receita'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Descrição</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Salário, Freelance, Dividendos..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CurrencyInput label="Valor" value={amount} onChange={setAmount} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IncomeCategory)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            >
              {Object.entries(INCOME_CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Data</label>
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Observações</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Receita recorrente</span>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
            Cancelar
          </button>
          <button type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            {initialData ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
