import { clsx } from 'clsx'
import type { BillStatus } from '@/types/models'
import { BILL_STATUS_LABELS } from '@/lib/constants'

interface StatusBadgeProps {
  status: BillStatus
  onClick?: () => void
}

const STATUS_STYLES: Record<BillStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  overdue: 'bg-red-50 text-red-700 border-red-200'
}

export function StatusBadge({ status, onClick }: StatusBadgeProps): React.JSX.Element {
  const Component = onClick ? 'button' : 'span'
  return (
    <Component
      onClick={onClick}
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status],
        onClick && 'cursor-pointer hover:opacity-80'
      )}
    >
      {BILL_STATUS_LABELS[status]}
    </Component>
  )
}
