import { useState, useEffect, useMemo } from 'react'
import { Modal } from '@/components/shared/Modal'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { PERIODICITY_LABELS } from '@/lib/constants'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useInvestmentsStore } from '@/stores/useInvestmentsStore'
import type { Goal, GoalType, Periodicity } from '@/types/models'

interface GoalFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Goal, 'id' | 'createdAt' | 'contributions'>) => void
  initialData?: Goal | null
}

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  manual: 'Manual (aportes registrados nas metas)',
  investment_linked: 'Vinculada a investimentos'
}

export function GoalFormModal({
  open,
  onClose,
  onSave,
  initialData
}: GoalFormModalProps): React.JSX.Element {
  const allWorkspaces = useSettingsStore((s) => s.workspaces)
  const investmentWorkspaces = useMemo(
    () => allWorkspaces.filter((w) => w.type === 'investments'),
    [allWorkspaces]
  )
  const allInvestments = useInvestmentsStore((s) => s.investments)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [goalType, setGoalType] = useState<GoalType>('manual')
  const [targetAmount, setTargetAmount] = useState(0)
  const [periodicity, setPeriodicity] = useState<Periodicity>('monthly')
  const [customPeriodDays, setCustomPeriodDays] = useState(30)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [linkedWorkspaceIds, setLinkedWorkspaceIds] = useState<string[]>([])
  const [linkedInvestmentIds, setLinkedInvestmentIds] = useState<string[]>([])

  const availableInvestments = useMemo(
    () =>
      linkedWorkspaceIds.length > 0
        ? allInvestments.filter((i) => linkedWorkspaceIds.includes(i.workspaceId) && i.isActive)
        : allInvestments.filter((i) => i.isActive),
    [allInvestments, linkedWorkspaceIds]
  )

  useEffect(() => {
    if (!open) return
    if (initialData) {
      setName(initialData.name)
      setDescription(initialData.description)
      setGoalType(initialData.goalType)
      setTargetAmount(initialData.targetAmount)
      setPeriodicity(initialData.periodicity)
      setCustomPeriodDays(initialData.customPeriodDays || 30)
      setStartDate(initialData.startDate)
      setEndDate(initialData.endDate || '')
      setLinkedWorkspaceIds(initialData.linkedWorkspaceIds)
      setLinkedInvestmentIds(initialData.linkedInvestmentIds)
    } else {
      setName('')
      setDescription('')
      setGoalType('manual')
      setTargetAmount(0)
      setPeriodicity('monthly')
      setCustomPeriodDays(30)
      setStartDate(new Date().toISOString().split('T')[0])
      setEndDate('')
      setLinkedWorkspaceIds([])
      setLinkedInvestmentIds([])
    }
  }, [initialData, open])

  const toggleWorkspace = (id: string): void => {
    setLinkedWorkspaceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleInvestment = (id: string): void => {
    setLinkedInvestmentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onSave({
      name,
      description,
      goalType,
      targetAmount,
      periodicity,
      customPeriodDays: periodicity === 'custom' ? customPeriodDays : undefined,
      startDate,
      endDate: endDate || undefined,
      linkedWorkspaceIds: goalType === 'investment_linked' ? linkedWorkspaceIds : [],
      linkedInvestmentIds: goalType === 'investment_linked' ? linkedInvestmentIds : [],
      isActive: initialData?.isActive ?? true
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'Editar Meta' : 'Nova Meta'} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nome da Meta</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Reserva de Emergência, Comprar Carro..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tipo da Meta</label>
          <select
            value={goalType}
            onChange={(e) => setGoalType(e.target.value as GoalType)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          >
            {Object.entries(GOAL_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">
            {goalType === 'manual'
              ? 'Aportes são registrados diretamente na aba de metas.'
              : 'Aportes são calculados automaticamente a partir dos investimentos.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CurrencyInput label="Valor Alvo por Período" value={targetAmount} onChange={setTargetAmount} />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Periodicidade</label>
            <select
              value={periodicity}
              onChange={(e) => setPeriodicity(e.target.value as Periodicity)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            >
              {Object.entries(PERIODICITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {periodicity === 'custom' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Período em dias
            </label>
            <input
              type="number"
              min={1}
              value={customPeriodDays}
              onChange={(e) => setCustomPeriodDays(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
        )}

        {goalType === 'investment_linked' && (
          <>
            {investmentWorkspaces.length > 0 && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Abas de Investimento (opcional - todas se vazio)
                </label>
                <div className="flex flex-wrap gap-2">
                  {investmentWorkspaces.map((ws) => (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => toggleWorkspace(ws.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        linkedWorkspaceIds.includes(ws.id)
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {ws.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableInvestments.length > 0 && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Investimentos Vinculados (opcional - todos se vazio)
                </label>
                <div className="max-h-32 overflow-auto rounded-lg border border-gray-200 p-2">
                  {availableInvestments.map((inv) => (
                    <label key={inv.id} className="flex items-center gap-2 px-2 py-1.5">
                      <input
                        type="checkbox"
                        checked={linkedInvestmentIds.includes(inv.id)}
                        onChange={() => toggleInvestment(inv.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{inv.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Data de Início</label>
            <input
              required
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Prazo / Data Limite <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
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
            {initialData ? 'Salvar' : 'Criar Meta'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
