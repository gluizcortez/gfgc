import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthYear, getNextMonthKey, getPrevMonthKey } from '@/lib/formatters'

interface MonthNavigatorProps {
  monthKey: string
  onChange: (monthKey: string) => void
}

export function MonthNavigator({ monthKey, onChange }: MonthNavigatorProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(getPrevMonthKey(monthKey))}
        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="min-w-[160px] text-center text-base font-semibold text-gray-800">
        {formatMonthYear(monthKey)}
      </span>
      <button
        onClick={() => onChange(getNextMonthKey(monthKey))}
        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
