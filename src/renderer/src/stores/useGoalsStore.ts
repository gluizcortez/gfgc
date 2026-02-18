import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type { Goal, GoalContribution, EntityId } from '@/types/models'

interface GoalsState {
  goals: Goal[]

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'contributions'>) => EntityId
  updateGoal: (id: EntityId, updates: Partial<Goal>) => void
  deleteGoal: (id: EntityId) => void
  toggleGoalActive: (id: EntityId) => void

  addContribution: (goalId: EntityId, contribution: Omit<GoalContribution, 'id' | 'goalId'>) => void
  updateContribution: (goalId: EntityId, contributionId: EntityId, updates: Partial<GoalContribution>) => void
  deleteContribution: (goalId: EntityId, contributionId: EntityId) => void

  hydrate: (goals: Goal[]) => void
}

export const useGoalsStore = create<GoalsState>()(
  immer((set) => ({
    goals: [],

    addGoal: (goal) => {
      const id = nanoid()
      set((state) => {
        state.goals.push({
          ...goal,
          id,
          contributions: [],
          createdAt: new Date().toISOString()
        })
      })
      return id
    },

    updateGoal: (id, updates) =>
      set((state) => {
        const goal = state.goals.find((g) => g.id === id)
        if (goal) Object.assign(goal, updates)
      }),

    deleteGoal: (id) =>
      set((state) => {
        state.goals = state.goals.filter((g) => g.id !== id)
      }),

    toggleGoalActive: (id) =>
      set((state) => {
        const goal = state.goals.find((g) => g.id === id)
        if (goal) goal.isActive = !goal.isActive
      }),

    addContribution: (goalId, contribution) =>
      set((state) => {
        const goal = state.goals.find((g) => g.id === goalId)
        if (goal) {
          goal.contributions.push({
            ...contribution,
            id: nanoid(),
            goalId
          })
        }
      }),

    updateContribution: (goalId, contributionId, updates) =>
      set((state) => {
        const goal = state.goals.find((g) => g.id === goalId)
        if (goal) {
          const contrib = goal.contributions.find((c) => c.id === contributionId)
          if (contrib) Object.assign(contrib, updates)
        }
      }),

    deleteContribution: (goalId, contributionId) =>
      set((state) => {
        const goal = state.goals.find((g) => g.id === goalId)
        if (goal) {
          goal.contributions = goal.contributions.filter((c) => c.id !== contributionId)
        }
      }),

    hydrate: (goals) =>
      set((state) => {
        state.goals = goals
      })
  }))
)
