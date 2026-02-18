import type { Category } from '@/types/models'

export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export const PERIODICITY_LABELS: Record<string, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  yearly: 'Anual',
  custom: 'Personalizado'
}

export const BILL_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Atrasado'
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Moradia', color: '#6366f1', type: 'bill', isDefault: true, sortOrder: 0 },
  { id: 'cat-2', name: 'Transporte', color: '#f59e0b', type: 'bill', isDefault: true, sortOrder: 1 },
  { id: 'cat-3', name: 'Alimentação', color: '#10b981', type: 'bill', isDefault: true, sortOrder: 2 },
  { id: 'cat-4', name: 'Saúde', color: '#ef4444', type: 'bill', isDefault: true, sortOrder: 3 },
  { id: 'cat-5', name: 'Educação', color: '#3b82f6', type: 'bill', isDefault: true, sortOrder: 4 },
  { id: 'cat-6', name: 'Lazer', color: '#8b5cf6', type: 'bill', isDefault: true, sortOrder: 5 },
  { id: 'cat-7', name: 'Serviços', color: '#06b6d4', type: 'bill', isDefault: true, sortOrder: 6 },
  { id: 'cat-8', name: 'Seguros', color: '#84cc16', type: 'bill', isDefault: true, sortOrder: 7 },
  { id: 'cat-9', name: 'Outros', color: '#737373', type: 'both', isDefault: true, sortOrder: 8 },
  { id: 'cat-10', name: 'Renda Fixa', color: '#0ea5e9', type: 'investment', isDefault: true, sortOrder: 9 },
  { id: 'cat-11', name: 'Renda Variável', color: '#f97316', type: 'investment', isDefault: true, sortOrder: 10 },
  { id: 'cat-12', name: 'Criptomoedas', color: '#a855f7', type: 'investment', isDefault: true, sortOrder: 11 }
]

export const WORKSPACE_COLORS = [
  '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#10b981',
  '#84cc16', '#f59e0b', '#f97316', '#ef4444', '#ec4899',
  '#8b5cf6', '#a855f7'
]
