import { useState } from 'react'
import { Plus, Target } from 'lucide-react'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { GoalCard } from './GoalCard'
import { GoalFormModal } from './GoalFormModal'
import { ContributionFormModal } from './ContributionFormModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useGoalsStore } from '@/stores/useGoalsStore'
import { useUIStore } from '@/stores/useUIStore'
import type { Goal } from '@/types/models'

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

  const activeGoals = goals.filter((g) => g.isActive)
  const inactiveGoals = goals.filter((g) => !g.isActive)

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Metas</h1>
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
      ) : (
        <>
          {activeGoals.length > 0 && (
            <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => {
                    setEditingGoal(goal)
                    setShowGoalForm(true)
                  }}
                  onDelete={() => setDeleteTarget(goal.id)}
                  onToggleActive={() => toggleGoalActive(goal.id)}
                  onAddContribution={() => setContributionGoal(goal)}
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
                    onEdit={() => {
                      setEditingGoal(goal)
                      setShowGoalForm(true)
                    }}
                    onDelete={() => setDeleteTarget(goal.id)}
                    onToggleActive={() => toggleGoalActive(goal.id)}
                    onAddContribution={() => setContributionGoal(goal)}
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
