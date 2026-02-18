import { AlertTriangle, Clock, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { getEffectiveStatus } from '@/lib/billStatus'
import { calculateBudgetStatus } from '@/lib/calculations'
import type { BillEntry, Category } from '@/types/models'

interface AlertCardsProps {
  bills: BillEntry[]
  categories: Category[]
  currentMonth: string
}

interface Alert {
  id: string
  icon: typeof AlertTriangle
  title: string
  description: string
  color: string
}

export function AlertCards({ bills, categories, currentMonth }: AlertCardsProps): React.JSX.Element | null {
  const alerts: Alert[] = []

  // Overdue bills (using effective status)
  const overdueBills = bills.filter((b) => getEffectiveStatus(b) === 'overdue')
  if (overdueBills.length > 0) {
    const total = overdueBills.reduce((sum, b) => sum + b.value, 0)
    alerts.push({
      id: 'overdue',
      icon: AlertTriangle,
      title: `${overdueBills.length} conta(s) atrasada(s)`,
      description: `Total de ${formatCurrency(total)} em atraso`,
      color: 'border-red-200 bg-red-50 text-red-700'
    })
  }

  // Bills due soon (pending, due within 3 days)
  const today = new Date()
  const upcomingBills = bills.filter((b) => {
    if (getEffectiveStatus(b) !== 'pending') return false
    const due = new Date(b.dueDate + 'T00:00:00')
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 3
  })
  if (upcomingBills.length > 0) {
    const total = upcomingBills.reduce((sum, b) => sum + b.value, 0)
    alerts.push({
      id: 'upcoming',
      icon: Clock,
      title: `${upcomingBills.length} conta(s) vencendo em breve`,
      description: `${formatCurrency(total)} nos próximos 3 dias`,
      color: 'border-amber-200 bg-amber-50 text-amber-700'
    })
  }

  // Budget exceeded
  const budgetStatuses = calculateBudgetStatus(bills, categories)
  const overBudget = budgetStatuses.filter((b) => b.status === 'over')
  if (overBudget.length > 0) {
    const catNames = overBudget
      .map((b) => {
        const cat = categories.find((c) => c.id === b.categoryId)
        return cat?.name
      })
      .filter(Boolean)
      .join(', ')
    alerts.push({
      id: 'budget',
      icon: AlertCircle,
      title: `Orçamento estourado em ${overBudget.length} categoria(s)`,
      description: catNames,
      color: 'border-orange-200 bg-orange-50 text-orange-700'
    })
  }

  if (alerts.length === 0) return null

  return (
    <div className="mb-6 space-y-2">
      {alerts.map((alert) => {
        const Icon = alert.icon
        return (
          <div
            key={alert.id}
            className={`flex items-center gap-3 rounded-xl border p-3 ${alert.color}`}
          >
            <Icon size={18} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{alert.title}</p>
              <p className="text-xs opacity-80">{alert.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
