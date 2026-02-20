import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { Modal } from '@/components/shared/Modal'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { formatCurrency } from '@/lib/formatters'
import type { Goal } from '@/types/models'
import { getCurrentMonthKey } from '@/lib/formatters'

interface ContributionFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: { periodKey: string; targetAmount: number; actualAmount: number; date: string; notes: string }) => void
  goal: Goal | null
}

export function ContributionFormModal({
  open,
  onClose,
  onSave,
  goal
}: ContributionFormModalProps): React.JSX.Element {
  const [periodKey, setPeriodKey] = useState(getCurrentMonthKey())
  const [actualAmount, setActualAmount] = useState(0)
  const [notes, setNotes] = useState('')

  const targetAmount = goal?.targetAmount || 0

  useEffect(() => {
    if (goal && open) {
      setActualAmount(0)
      setPeriodKey(getCurrentMonthKey())
      setNotes('')
    }
  }, [goal, open])

  const diff = actualAmount - targetAmount
  const percentage = targetAmount > 0 ? Math.round((actualAmount / targetAmount) * 1000) / 10 : 0
  const isAbove = diff >= 0
  const showIndicator = actualAmount > 0

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onSave({
      periodKey,
      targetAmount,
      actualAmount,
      date: new Date().toISOString(),
      notes
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Registrar Aporte">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Período</label>
          <input
            required
            value={periodKey}
            onChange={(e) => setPeriodKey(e.target.value)}
            placeholder="2026-02"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Meta do Período</label>
          <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
            {formatCurrency(targetAmount)}
          </div>
        </div>

        <CurrencyInput label="Valor Aportado" value={actualAmount} onChange={setActualAmount} />

        {showIndicator && (
          <div
            className={clsx(
              'flex items-center justify-between rounded-lg border px-4 py-3',
              isAbove
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            )}
          >
            <span
              className={clsx(
                'text-sm font-semibold',
                isAbove ? 'text-green-700' : 'text-red-700'
              )}
            >
              {percentage}% da meta
            </span>
            <span
              className={clsx(
                'text-sm font-medium',
                isAbove ? 'text-green-600' : 'text-red-600'
              )}
            >
              {isAbove ? '+' : ''}{formatCurrency(diff)}
            </span>
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
            disabled={actualAmount <= 0}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Registrar
          </button>
        </div>
      </form>
    </Modal>
  )
}
