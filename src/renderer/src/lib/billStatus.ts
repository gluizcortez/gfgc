import type { BillEntry, BillStatus } from '@/types/models'

/**
 * Computes the effective display status for a bill entry.
 * - If the user marked it as 'paid', it stays 'paid'
 * - If the stored status is 'pending' and the due date has passed, it becomes 'overdue'
 * - Otherwise it stays 'pending'
 */
export function getEffectiveStatus(entry: BillEntry): BillStatus {
  if (entry.status === 'paid') return 'paid'
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  if (entry.dueDate < todayStr) return 'overdue'
  return 'pending'
}

/**
 * Returns the next status when user clicks the status badge.
 * - paid → pending (unmark payment)
 * - pending/overdue → paid (mark as paid)
 */
export function getNextToggleStatus(effectiveStatus: BillStatus): BillStatus {
  return effectiveStatus === 'paid' ? 'pending' : 'paid'
}
