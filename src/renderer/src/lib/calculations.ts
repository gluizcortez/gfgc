import type { BillEntry, Investment, InvestmentTransaction, Goal, Category, MonthlyBillRecord, FGTSRecord, MonthKey, Periodicity } from '@/types/models'
import { getEffectiveStatus } from './billStatus'

export function calculateBillsTotals(bills: BillEntry[]) {
  const total = bills.reduce((sum, b) => sum + b.value, 0)
  const paid = bills.filter((b) => getEffectiveStatus(b) === 'paid').reduce((sum, b) => sum + b.value, 0)
  const pending = bills.filter((b) => getEffectiveStatus(b) === 'pending').reduce((sum, b) => sum + b.value, 0)
  const overdue = bills.filter((b) => getEffectiveStatus(b) === 'overdue').reduce((sum, b) => sum + b.value, 0)
  return { total, paid, pending, overdue, count: bills.length }
}

export function calculateInvestmentsTotals(investments: Investment[], transactions: InvestmentTransaction[]) {
  const totalBalance = investments.reduce((sum, i) => sum + i.currentBalance, 0)
  const totalContributions = transactions
    .filter((t) => t.type === 'contribution')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawals = transactions
    .filter((t) => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalYields = transactions
    .filter((t) => t.type === 'yield')
    .reduce((sum, t) => sum + t.amount, 0)
  return { totalBalance, totalContributions, totalWithdrawals, totalYields, count: investments.length }
}

export interface GoalProgress {
  target: number
  actual: number
  percentage: number
  status: 'above' | 'below' | 'on_target'
  difference: number
}

export function calculateGoalProgress(goal: Goal): GoalProgress {
  const contributions = goal.contributions
  if (contributions.length === 0) {
    return { target: goal.targetAmount, actual: 0, percentage: 0, status: 'below', difference: -goal.targetAmount }
  }

  const latest = contributions[contributions.length - 1]
  const percentage = latest.targetAmount > 0 ? (latest.actualAmount / latest.targetAmount) * 100 : 0
  const difference = latest.actualAmount - latest.targetAmount

  let status: GoalProgress['status'] = 'on_target'
  if (difference > 0) status = 'above'
  else if (difference < 0) status = 'below'

  return {
    target: latest.targetAmount,
    actual: latest.actualAmount,
    percentage: Math.round(percentage * 10) / 10,
    status,
    difference
  }
}

export function normalizePeriodKey(periodKey: string, periodicity: Periodicity): string {
  const parts = periodKey.split('-').map(Number)
  const year = parts[0]
  const month = parts[1] || 1
  switch (periodicity) {
    case 'yearly':
      return `${year}`
    case 'semiannual':
      return month <= 6 ? `${year}-H1` : `${year}-H2`
    case 'quarterly':
      return `${year}-Q${Math.ceil(month / 3)}`
    case 'monthly':
      return periodKey
    default:
      return periodKey // custom
  }
}

export function calculatePeriodGoalProgress(goal: Goal, periodFilter: string): GoalProgress {
  const contributions = goal.contributions.filter((c) => {
    const normalized = normalizePeriodKey(c.periodKey, goal.periodicity)
    return normalized === periodFilter
  })
  const totalActual = contributions.reduce((sum, c) => sum + c.actualAmount, 0)
  const target = goal.targetAmount
  const percentage = target > 0 ? (totalActual / target) * 100 : 0
  const difference = totalActual - target

  let status: GoalProgress['status'] = 'on_target'
  if (difference > 0) status = 'above'
  else if (difference < 0) status = 'below'

  return {
    target,
    actual: totalActual,
    percentage: Math.round(percentage * 10) / 10,
    status,
    difference
  }
}

export function calculateOverallGoalProgress(goal: Goal): GoalProgress {
  // Group contributions by normalized periodKey to count unique periods
  const periodMap = new Map<string, number>()
  for (const c of goal.contributions) {
    const normalizedKey = normalizePeriodKey(c.periodKey, goal.periodicity)
    periodMap.set(normalizedKey, (periodMap.get(normalizedKey) || 0) + c.actualAmount)
  }
  const totalTarget = periodMap.size * goal.targetAmount
  const totalActual = [...periodMap.values()].reduce((sum, v) => sum + v, 0)
  const percentage = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0
  const difference = totalActual - totalTarget

  let status: GoalProgress['status'] = 'on_target'
  if (difference > 0) status = 'above'
  else if (difference < 0) status = 'below'

  return {
    target: totalTarget,
    actual: totalActual,
    percentage: Math.round(percentage * 10) / 10,
    status,
    difference
  }
}

export function getCategoryTotals(bills: BillEntry[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const bill of bills) {
    const current = map.get(bill.categoryId) || 0
    map.set(bill.categoryId, current + bill.value)
  }
  return map
}

// Budget calculations
export interface BudgetStatus {
  categoryId: string
  budget: number
  spent: number
  percentage: number
  status: 'under' | 'near' | 'over'
}

export function calculateBudgetStatus(bills: BillEntry[], categories: Category[]): BudgetStatus[] {
  const totals = getCategoryTotals(bills)
  return categories
    .filter((c) => c.budget && c.budget > 0)
    .map((c) => {
      const spent = totals.get(c.id) || 0
      const percentage = (spent / c.budget!) * 100
      let status: BudgetStatus['status'] = 'under'
      if (percentage >= 100) status = 'over'
      else if (percentage >= 80) status = 'near'
      return { categoryId: c.id, budget: c.budget!, spent, percentage, status }
    })
    .sort((a, b) => b.percentage - a.percentage)
}

// Annual calculations
export function getYearMonths(year: number): MonthKey[] {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`)
}

export function calculateYearlyTotals(billRecords: MonthlyBillRecord[], year: number) {
  const months = getYearMonths(year)
  const yearBills = billRecords
    .filter((r) => months.includes(r.monthKey))
    .flatMap((r) => r.bills)

  const totalExpenses = yearBills.reduce((sum, b) => sum + b.value, 0)
  const categoryTotals = getCategoryTotals(yearBills)
  return { totalExpenses, categoryTotals, billCount: yearBills.length }
}

// Net worth
export function calculateNetWorth(investments: Investment[], fgtsRecords: FGTSRecord[]): number {
  const investTotal = investments.reduce((sum, i) => sum + i.currentBalance, 0)
  const fgtsLatest = [...fgtsRecords].sort((a, b) => b.monthKey.localeCompare(a.monthKey))[0]?.balance || 0
  return investTotal + fgtsLatest
}

// Goal projection
export interface GoalProjection {
  estimatedDate: string | null // "2027-08" format or null
  avgPerPeriod: number
  periodsRemaining: number
  hasEnoughData: boolean
}

export function calculateGoalProjection(
  goal: Goal,
  investmentTransactions?: InvestmentTransaction[]
): GoalProjection {
  const noData: GoalProjection = { estimatedDate: null, avgPerPeriod: 0, periodsRemaining: 0, hasEnoughData: false }
  let avgPerPeriod = 0

  if (goal.goalType === 'manual') {
    if (goal.contributions.length === 0) return noData
    const periodMap = new Map<string, number>()
    for (const c of goal.contributions) {
      const key = normalizePeriodKey(c.periodKey, goal.periodicity)
      periodMap.set(key, (periodMap.get(key) || 0) + c.actualAmount)
    }
    if (periodMap.size < 2) return noData
    const values = [...periodMap.values()]
    avgPerPeriod = values.reduce((a, b) => a + b, 0) / values.length
  } else if (goal.goalType === 'investment_linked' && investmentTransactions) {
    const relevant = investmentTransactions.filter((tx) => {
      if (tx.type !== 'contribution') return false
      if (goal.linkedInvestmentIds.length > 0) return goal.linkedInvestmentIds.includes(tx.investmentId)
      if (goal.linkedWorkspaceIds.length > 0) return goal.linkedWorkspaceIds.includes(tx.workspaceId)
      return true
    })
    const monthMap = new Map<string, number>()
    for (const tx of relevant) {
      monthMap.set(tx.monthKey, (monthMap.get(tx.monthKey) || 0) + tx.amount)
    }
    if (monthMap.size < 2) return noData
    const values = [...monthMap.values()]
    avgPerPeriod = values.reduce((a, b) => a + b, 0) / values.length
  } else {
    return noData
  }

  if (avgPerPeriod <= 0) return noData

  const periodsRemaining = Math.ceil(goal.targetAmount / avgPerPeriod)

  // Calculate estimated date by adding periods from now
  const now = new Date()
  let months = 0
  switch (goal.periodicity) {
    case 'monthly': months = periodsRemaining; break
    case 'quarterly': months = periodsRemaining * 3; break
    case 'semiannual': months = periodsRemaining * 6; break
    case 'yearly': months = periodsRemaining * 12; break
    default: months = periodsRemaining; break
  }

  const estimated = new Date(now.getFullYear(), now.getMonth() + months, 1)
  const estimatedDate = `${estimated.getFullYear()}-${String(estimated.getMonth() + 1).padStart(2, '0')}`

  return { estimatedDate, avgPerPeriod, periodsRemaining, hasEnoughData: true }
}

export function reconstructHistoricalBalance(
  investmentId: string,
  transactions: InvestmentTransaction[],
  upToMonth: MonthKey
): number {
  return transactions
    .filter((t) => t.investmentId === investmentId && t.monthKey <= upToMonth)
    .reduce((sum, t) => {
      if (t.type === 'contribution' || t.type === 'yield') return sum + t.amount
      return sum - t.amount
    }, 0)
}
