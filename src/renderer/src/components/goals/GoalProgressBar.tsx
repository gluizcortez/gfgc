import { clsx } from 'clsx'
import type { GoalProgress } from '@/lib/calculations'
import { formatCurrency } from '@/lib/formatters'

interface GoalProgressBarProps {
  progress: GoalProgress
  showValues?: boolean
}

export function GoalProgressBar({ progress, showValues = true }: GoalProgressBarProps): React.JSX.Element {
  const pct = Math.min(progress.percentage, 100)

  return (
    <div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            progress.status === 'above' || progress.status === 'on_target'
              ? 'bg-green-500'
              : 'bg-red-400'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValues && (
        <div className="mt-1.5 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {formatCurrency(progress.actual)} de {formatCurrency(progress.target)}
          </span>
          <span
            className={clsx(
              'font-semibold',
              progress.status === 'above' || progress.status === 'on_target'
                ? 'text-green-600'
                : 'text-red-500'
            )}
          >
            {progress.percentage}%
          </span>
        </div>
      )}
    </div>
  )
}
