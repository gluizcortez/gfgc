import { useState, useEffect } from 'react'
import { Modal } from '@/components/shared/Modal'
import { INVESTMENT_TYPE_LABELS } from '@/types/models'
import type { Investment, InvestmentType } from '@/types/models'

interface InvestmentFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; type: InvestmentType; notes: string }) => void
  initialData?: Investment | null
}

const TYPE_OPTIONS = Object.entries(INVESTMENT_TYPE_LABELS) as [InvestmentType, string][]

export function InvestmentFormModal({
  open,
  onClose,
  onSave,
  initialData
}: InvestmentFormModalProps): React.JSX.Element {
  const [name, setName] = useState('')
  const [type, setType] = useState<InvestmentType>('renda_fixa')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    if (initialData) {
      setName(initialData.name)
      setType(initialData.type)
      setNotes(initialData.notes)
    } else {
      setName('')
      setType('renda_fixa')
      setNotes('')
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onSave({ name, type, notes })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? 'Editar Investimento' : 'Novo Investimento'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as InvestmentType)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          >
            {TYPE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nome</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Tesouro Selic 2029, IVVB11, CDB Banco X..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            {initialData ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
