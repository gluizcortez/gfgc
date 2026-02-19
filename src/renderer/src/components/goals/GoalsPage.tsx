import { useState } from 'react'
import { Plus, Target, Eye, Calendar, CalendarDays } from 'lucide-react'
import { clsx } from 'clsx'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { MonthNavigator } from '@/components/layout/MonthNavigator'
import { GoalCard } from './GoalCard'
import { GoalFormModal } from './GoalFormModal'
import { ContributionFormModal } from './ContributionFormModal'
import { GoalChartModal } from './GoalChartModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { normalizePeriodKey } from '@/lib/calculations'
import { getCurrentMonthKey } from '@/lib/formatters'
import { PERIODICITY_LABELS } from '@/lib/constants'
import { useGoalsStore } from '@/stores/useGoalsStore'
import { useUIStore } from '@/stores/useUIStore'
import type { Goal } from '@/types/models'

type ViewMode = 'all' | 'yearly' | 'monthly'

export function GoalsPage(): React.JSX.Element {
  const goals = useGoalsStore((s) => s.goals)
  const addGoal = useGoalsStore((s) => s.addGoal)
  const updateGoal = useGoalsStore((s) => s.updateGoal)
  const deleteGoal = useGoalsStore((s) => s.deleteGoal)
  const toggleGoalActive = useGoalsStore((s) => s.toggleGoalActive)
  const addContribution = useGoalsStore((s) => s.addContribution)
  const addNotification = useUIStore((s) => s.addNotification)

  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [contributionGoal, setContributionGoal] = useState<Goal | null>(null)
  const [chartGoal, setChartGoal] = useState<Goal | null>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  const handleSaveGoal = (data: Omit<Goal, 'id' | 'createdAt' | 'contributions'>): void => {
    if (editingGoal) {
      updateGoal(editingGoal.id, data)
      addNotification('Meta atualizada', 'success')
    } else {
      addGoal(data)
      addNotification('Meta criada', 'success')
    }
    setEditingGoal(null)
  }

  const handleDeleteGoal = (): void => {
    if (deleteTarget) {
      deleteGoal(deleteTarget)
      addNotification('Meta excluída', 'success')
      setDeleteTarget(null)
    }
  }

  const handleAddContribution = (data: {
    periodKey: string
    targetAmount: number
    actualAmount: number
    date: string
    notes: string
  }): void => {
    if (contributionGoal) {
      addContribution(contributionGoal.id, data)
      addNotification('Aporte registrado', 'success')
    }
  }

  const handleViewDetails = (goal: Goal): void => {
    if (goal.periodicity === 'yearly') {
      setViewMode('yearly')
    } else {
      setViewMode('monthly')
    }
  }

  // Filter goals by view mode
  const getFilteredGoals = (): Goal[] => {
    if (viewMode === 'yearly') return goals.filter((g) => g.periodicity === 'yearly')
    if (viewMode === 'monthly') return goals.filter((g) => g.periodicity === 'monthly')
    return goals
  }

  const filteredGoals = getFilteredGoals()
  const activeGoals = filteredGoals.filter((g) => g.isActive)
  const inactiveGoals = filteredGoals.filter((g) => !g.isActive)

  // Period filter for GoalCards
  const getPeriodFilter = (goal: Goal): string => {
    if (viewMode === 'yearly') return `${selectedYear}`
    if (viewMode === 'monthly') return normalizePeriodKey(selectedMonth, 'monthly')
    return normalizePeriodKey(getCurrentMonthKey(), goal.periodicity)
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Metas</h1>
          {goals.length > 0 && (
            <div className="flex rounded-lg border border-gray-200">
              <button
                onClick={() => setViewMode('all')}
                className={clsx(
                  'rounded-l-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  viewMode === 'all' ? 'bg-primary-50 text-primary-700' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                Todos
              </button>
              <button
                onClick={() => setViewMode('yearly')}
                className={clsx(
                  'border-x border-gray-200 px-3 py-1.5 text-xs font-medium transition-colors',
                  viewMode === 'yearly' ? 'bg-primary-50 text-primary-700' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                Anual
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={clsx(
                  'rounded-r-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  viewMode === 'monthly' ? 'bg-primary-50 text-primary-700' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                Mensal
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {viewMode === 'monthly' && (
            <MonthNavigator monthKey={selectedMonth} onChange={setSelectedMonth} />
          )}
          {viewMode === 'yearly' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium focus:border-primary-500 focus:outline-none"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
          <SimpleTooltip label="Criar uma nova meta financeira (manual ou vinculada a investimentos)">
            <button
              onClick={() => {
                setEditingGoal(null)
                setShowGoalForm(true)
              }}
              className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              <Plus size={16} />
              Nova Meta
            </button>
          </SimpleTooltip>
        </div>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhuma meta criada"
          description="Crie metas para acompanhar seu progresso. Metas manuais ou vinculadas a investimentos."
          action={{
            label: 'Criar Primeira Meta',
            onClick: () => {
              setEditingGoal(null)
              setShowGoalForm(true)
            }
          }}
        />
      ) : viewMode === 'all' ? (
        /* Summary view: compact list */
        <div className="space-y-2">
          {goals.filter((g) => g.isActive).length > 0 && (
            <div className="space-y-2">
              {goals.filter((g) => g.isActive).map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-3.5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={clsx(
                        'flex h-8 w-8 items-center justify-center rounded-lg',
                        goal.periodicity === 'yearly' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                      )}
                    >
                      {goal.periodicity === 'yearly' ? <Calendar size={16} /> : <CalendarDays size={16} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{goal.name}</h3>
                      <p className="text-xs text-gray-400">
                        {PERIODICITY_LABELS[goal.periodicity]}
                        {goal.description && ` · ${goal.description}`}
                      </p>
                    </div>
                  </div>
                  <SimpleTooltip label="Ver detalhes da meta">
                    <button
                      onClick={() => handleViewDetails(goal)}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    >
                      <Eye size={14} />
                      Detalhes
                    </button>
                  </SimpleTooltip>
                </div>
              ))}
            </div>
          )}

          {goals.filter((g) => !g.isActive).length > 0 && (
            <>
              <h2 className="mt-4 mb-2 text-sm font-medium text-gray-400 uppercase tracking-wide">
                Metas Pausadas
              </h2>
              {goals.filter((g) => !g.isActive).map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-3.5 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                      {goal.periodicity === 'yearly' ? <Calendar size={16} /> : <CalendarDays size={16} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{goal.name}</h3>
                      <p className="text-xs text-gray-400">{PERIODICITY_LABELS[goal.periodicity]}</p>
                    </div>
                  </div>
                  <SimpleTooltip label="Ver detalhes da meta">
                    <button
                      onClick={() => handleViewDetails(goal)}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    >
                      <Eye size={14} />
                      Detalhes
                    </button>
                  </SimpleTooltip>
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        /* Detail view: full GoalCards */
        <>
          {filteredGoals.length === 0 && (
            <p className="py-12 text-center text-sm text-gray-400">
              Nenhuma meta {viewMode === 'yearly' ? 'anual' : 'mensal'} criada.
            </p>
          )}

          {activeGoals.length > 0 && (
            <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  periodFilter={getPeriodFilter(goal)}
                  onEdit={() => {
                    setEditingGoal(goal)
                    setShowGoalForm(true)
                  }}
                  onDelete={() => setDeleteTarget(goal.id)}
                  onToggleActive={() => toggleGoalActive(goal.id)}
                  onAddContribution={() => setContributionGoal(goal)}
                  onShowChart={() => setChartGoal(goal)}
                />
              ))}
            </div>
          )}

          {inactiveGoals.length > 0 && (
            <>
              <h2 className="mb-3 text-sm font-medium text-gray-400 uppercase tracking-wide">
                Metas Pausadas
              </h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {inactiveGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    periodFilter={getPeriodFilter(goal)}
                    onEdit={() => {
                      setEditingGoal(goal)
                      setShowGoalForm(true)
                    }}
                    onDelete={() => setDeleteTarget(goal.id)}
                    onToggleActive={() => toggleGoalActive(goal.id)}
                    onAddContribution={() => setContributionGoal(goal)}
                    onShowChart={() => setChartGoal(goal)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <GoalFormModal
        open={showGoalForm}
        onClose={() => {
          setShowGoalForm(false)
          setEditingGoal(null)
        }}
        onSave={handleSaveGoal}
        initialData={editingGoal}
      />

      <ContributionFormModal
        open={!!contributionGoal}
        onClose={() => setContributionGoal(null)}
        onSave={handleAddContribution}
        goal={contributionGoal}
      />

      <GoalChartModal
        open={!!chartGoal}
        onClose={() => setChartGoal(null)}
        goal={chartGoal}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteGoal}
        title="Excluir Meta"
        message="Tem certeza que deseja excluir esta meta e todo seu histórico de aportes?"
        confirmLabel="Excluir"
        danger
      />
    </div>
  )
}
