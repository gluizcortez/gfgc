import { useState, useEffect } from 'react'
import { Modal } from '@/components/shared/Modal'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { getCurrentMonthKey, formatMonthYear } from '@/lib/formatters'
import type { FGTSRecord } from '@/types/models'

interface FGTSFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: { monthKey: string; balance: number; notes: string }) => void
  initialData?: FGTSRecord | null
}

export function FGTSFormModal({
  open,
  onClose,
  onSave,
  initialData
}: FGTSFormModalProps): React.JSX.Element {
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey())
  const [balance, setBalance] = useState(0)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    if (initialData) {
      setMonthKey(initialData.monthKey)
      setBalance(initialData.balance)
      setNotes(initialData.notes)
    } else {
      setMonthKey(getCurrentMonthKey())
      setBalance(0)
      setNotes('')
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onSave({ monthKey, balance, notes })
    onClose()
  }

  // Generate month options
  const monthOptions: { key: string; label: string }[] = []
  const [cy, cm] = getCurrentMonthKey().split('-').map(Number)
  for (let i = 0; i < 24; i++) {
    let m = cm - i
    let y = cy
    while (m <= 0) { m += 12; y -= 1 }
    const key = `${y}-${String(m).padStart(2, '0')}`
    monthOptions.push({ key, label: formatMonthYear(key) })
  }

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'Editar Registro FGTS' : 'Novo Registro FGTS'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mês de Referência</label>
          <select
            value={monthKey}
            onChange={(e) => setMonthKey(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          >
            {monthOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <CurrencyInput label="Saldo FGTS" value={balance} onChange={setBalance} />

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
            {initialData ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
