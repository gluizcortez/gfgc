import type { BillEntry, BillStatus } from '@/types/models'

/**
 * Computes the effective display status for a bill entry.
 * - If the user marked it as 'paid', it stays 'paid'
 * - If the stored status is 'pending' and the due date has passed, it becomes 'overdue'
 * - Otherwise it stays 'pending'
 */
export function getEffectiveStatus(entry: BillEntry): BillStatus {
  if (entry.status === 'paid') return 'paid'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(entry.dueDate + 'T00:00:00')
  if (due < today) return 'overdue'
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
