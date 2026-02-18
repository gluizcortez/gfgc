import { useState, useEffect } from 'react'
import { Modal } from '@/components/shared/Modal'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { AttachmentInput } from '@/components/shared/AttachmentInput'
import { getCurrentMonthKey, formatMonthYear } from '@/lib/formatters'
import type { Investment, TransactionType, Attachment } from '@/types/models'

interface TransactionFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: { investmentId: string; amount: number; monthKey: string; notes: string; attachments: Attachment[] }) => void
  type: TransactionType
  investments: Investment[]
}

const TYPE_TITLES: Record<TransactionType, string> = {
  contribution: 'Novo Aporte',
  withdrawal: 'Nova Retirada',
  yield: 'Registrar Rendimento'
}

const TYPE_LABELS: Record<TransactionType, string> = {
  contribution: 'Valor do Aporte',
  withdrawal: 'Valor da Retirada',
  yield: 'Valor do Rendimento'
}

const TYPE_BUTTONS: Record<TransactionType, string> = {
  contribution: 'Registrar Aporte',
  withdrawal: 'Registrar Retirada',
  yield: 'Registrar Rendimento'
}

export function TransactionFormModal({
  open,
  onClose,
  onSave,
  type,
  investments
}: TransactionFormModalProps): React.JSX.Element {
  const [investmentId, setInvestmentId] = useState('')
  const [amount, setAmount] = useState(0)
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey())
  const [notes, setNotes] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])

  useEffect(() => {
    if (!open) return
    setInvestmentId(investments[0]?.id || '')
    setAmount(0)
    setMonthKey(getCurrentMonthKey())
    setNotes('')
    setAttachments([])
  }, [open, investments])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!investmentId || amount <= 0) return
    onSave({ investmentId, amount, monthKey, notes, attachments })
    onClose()
  }

  // Generate month options (current month and 23 months back)
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
    <Modal open={open} onClose={onClose} title={TYPE_TITLES[type]}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Investimento</label>
          {investments.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum investimento criado. Crie um investimento primeiro.</p>
          ) : (
            <select
              value={investmentId}
              onChange={(e) => setInvestmentId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            >
              {investments.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <CurrencyInput label={TYPE_LABELS[type]} value={amount} onChange={setAmount} />

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
            disabled={investments.length === 0 || amount <= 0}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {TYPE_BUTTONS[type]}
          </button>
        </div>
      </form>
    </Modal>
  )
}
