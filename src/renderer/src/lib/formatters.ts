import { MONTH_NAMES_PT } from './constants'

export function formatCurrency(cents: number): string {
  const value = cents / 100
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, '').replace(',', '.')
  const value = parseFloat(cleaned)
  if (isNaN(value)) return 0
  return Math.round(value * 100)
}

export function formatMonthYear(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  return `${MONTH_NAMES_PT[month - 1]} ${year}`
}

export function getCurrentMonthKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function getNextMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  if (month === 12) return `${year + 1}-01`
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export function getPrevMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  if (month === 1) return `${year - 1}-12`
  return `${year}-${String(month - 1).padStart(2, '0')}`
}

export function formatDate(isoDate: string): string {
  // Parse date-only strings (YYYY-MM-DD) without timezone shift
  const parts = isoDate.split('T')[0].split('-')
  if (parts.length === 3) {
    const [y, m, d] = parts
    return `${d}/${m}/${y}`
  }
  const date = new Date(isoDate)
  return date.toLocaleDateString('pt-BR')
}

export function formatCompactNumber(cents: number): string {
  const value = cents / 100
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1)}K`
  return formatCurrency(cents)
}
