import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Pencil, Trash2, Plus, Pause, Play, Link, BarChart3 } from 'lucide-react'
import { clsx } from 'clsx'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { GoalProgressBar } from './GoalProgressBar'
import { GoalContributionHistory } from './GoalContributionHistory'
import { calculateOverallGoalProgress, calculatePeriodGoalProgress, normalizePeriodKey, type GoalProgress } from '@/lib/calculations'
import { formatCurrency, getCurrentMonthKey } from '@/lib/formatters'
import { PERIODICITY_LABELS } from '@/lib/constants'
import { useInvestmentsStore } from '@/stores/useInvestmentsStore'
import type { Goal } from '@/types/models'

interface GoalCardProps {
  goal: Goal
  periodFilter?: string
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
  onAddContribution: () => void
  onShowChart: () => void
}

export function GoalCard({
  goal,
  periodFilter,
  onEdit,
  onDelete,
  onToggleActive,
  onAddContribution,
  onShowChart
}: GoalCardProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const transactions = useInvestmentsStore((s) => s.transactions)

  // For investment_linked goals, calculate current period from transactions
  const investmentProgress = useMemo((): GoalProgress | null => {
    if (goal.goalType !== 'investment_linked') return null

    const currentMonth = getCurrentMonthKey()
    const relevantTxs = transactions.filter((tx) => {
      if (tx.type !== 'contribution') return false
      if (tx.monthKey !== currentMonth) return false
      if (goal.linkedInvestmentIds.length > 0) {
        return goal.linkedInvestmentIds.includes(tx.investmentId)
      }
      if (goal.linkedWorkspaceIds.length > 0) {
        return goal.linkedWorkspaceIds.includes(tx.workspaceId)
      }
      return true
    })

    const actual = relevantTxs.reduce((sum, tx) => sum + tx.amount, 0)
    const target = goal.targetAmount
    const percentage = target > 0 ? Math.round((actual / target) * 1000) / 10 : 0
    const difference = actual - target

    let status: GoalProgress['status'] = 'on_target'
    if (difference > 0) status = 'above'
    else if (difference < 0) status = 'below'

    return { target, actual, percentage, status, difference }
  }, [goal, transactions])

  const investmentCurrentProgress = goal.goalType === 'investment_linked' && investmentProgress
    ? investmentProgress
    : null

  const manualProgress = useMemo(() => {
    if (goal.goalType !== 'manual') return null
    if (goal.contributions.length === 0) return null
    if (periodFilter) {
      return calculatePeriodGoalProgress(goal, periodFilter)
    }
    // Default: current period based on goal's periodicity
    const currentPeriod = normalizePeriodKey(getCurrentMonthKey(), goal.periodicity)
    return calculatePeriodGoalProgress(goal, currentPeriod)
  }, [goal, periodFilter])

  return (
    <div
      className={clsx(
        'rounded-xl border bg-white p-5 transition-shadow hover:shadow-md',
        goal.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">{goal.name}</h3>
            {goal.goalType === 'investment_linked' && (
              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                <Link size={10} />
                Investimentos
              </span>
            )}
          </div>
          {goal.description && (
            <p className="mt-0.5 text-xs text-gray-500">{goal.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {goal.goalType === 'manual' && goal.contributions.length > 0 && (
            <SimpleTooltip label="Ver gráfico de aportes">
              <button
                onClick={onShowChart}
                className="rounded-md p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600"
              >
                <BarChart3 size={14} />
              </button>
            </SimpleTooltip>
          )}
          <SimpleTooltip label={goal.isActive ? 'Pausar meta' : 'Reativar meta'}>
            <button
              onClick={onToggleActive}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              {goal.isActive ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </SimpleTooltip>
          <SimpleTooltip label="Editar meta">
            <button
              onClick={onEdit}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <Pencil size={14} />
            </button>
          </SimpleTooltip>
          <SimpleTooltip label="Excluir meta e histórico">
            <button
              onClick={onDelete}
              className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </SimpleTooltip>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium">
          {PERIODICITY_LABELS[goal.periodicity]}
        </span>
        <span>Meta: {formatCurrency(goal.targetAmount)}/período</span>
        {goal.endDate && (() => {
          const end = new Date(goal.endDate + 'T00:00:00')
          const now = new Date()
          const diffMs = end.getTime() - now.getTime()
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
          const diffMonths = Math.max(1, Math.ceil(diffDays / 30))
          const totalContributed = goal.contributions.reduce((sum, c) => sum + c.actualAmount, 0)
          const remaining = Math.max(0, goal.targetAmount * goal.contributions.length - totalContributed)
          const monthlyNeeded = remaining > 0 && diffMonths > 0 ? remaining / diffMonths : 0

          if (diffDays < 0) {
            return <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-600">Prazo expirado</span>
          }
          return (
            <>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-600">
                {diffDays <= 30 ? `${diffDays} dias restantes` : `${diffMonths} meses restantes`}
              </span>
              {monthlyNeeded > 0 && (
                <span className="text-gray-400">
                  ~ {formatCurrency(monthlyNeeded)}/mês para atingir
                </span>
              )}
            </>
          )
        })()}
      </div>

      {investmentCurrentProgress && (
        <div className="mb-2">
          <p className="mb-1 text-xs font-medium text-gray-500">Período Atual (automático)</p>
          <GoalProgressBar progress={investmentCurrentProgress} />
        </div>
      )}

      {manualProgress && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-medium text-gray-500">
            {periodFilter ? 'Progresso do Período' : 'Progresso Atual'}
          </p>
          <GoalProgressBar progress={manualProgress} />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        {goal.goalType === 'manual' ? (
          <SimpleTooltip label="Registrar um aporte manual para este período">
            <button
              onClick={onAddContribution}
              className="flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100"
            >
              <Plus size={14} />
              Registrar Aporte
            </button>
          </SimpleTooltip>
        ) : (
          <span className="text-xs text-gray-400">Aportes calculados dos investimentos</span>
        )}
        {goal.goalType === 'manual' && goal.contributions.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
          >
            Histórico
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {expanded && goal.goalType === 'manual' && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <GoalContributionHistory contributions={goal.contributions} />
        </div>
      )}
    </div>
  )
}
