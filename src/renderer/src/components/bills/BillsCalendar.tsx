import { useMemo } from 'react'
import { clsx } from 'clsx'
import { formatCurrency } from '@/lib/formatters'
import { getEffectiveStatus } from '@/lib/billStatus'
import type { BillEntry } from '@/types/models'

interface BillsCalendarProps {
  bills: BillEntry[]
  monthKey: string
}

export function BillsCalendar({ bills, monthKey }: BillsCalendarProps): React.JSX.Element {
  const [year, month] = monthKey.split('-').map(Number)

  const calendarData = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay() // 0=Sun
    const daysInMonth = new Date(year, month, 0).getDate()
    const today = new Date()
    const todayDay = today.getFullYear() === year && today.getMonth() + 1 === month ? today.getDate() : -1

    // Group bills by day
    const billsByDay = new Map<number, BillEntry[]>()
    for (const bill of bills) {
      const day = parseInt(bill.dueDate.split('-')[2])
      if (!billsByDay.has(day)) billsByDay.set(day, [])
      billsByDay.get(day)!.push(bill)
    }

    return { firstDay, daysInMonth, todayDay, billsByDay }
  }, [bills, year, month])

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const cells: (number | null)[] = []
  for (let i = 0; i < calendarData.firstDay; i++) cells.push(null)
  for (let d = 1; d <= calendarData.daysInMonth; d++) cells.push(d)
  // Pad to fill last row
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {dayNames.map((name) => (
          <div key={name} className="px-2 py-2 text-center text-xs font-medium text-gray-400">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="min-h-[80px] border-b border-r border-gray-50 bg-gray-25" />
          }

          const dayBills = calendarData.billsByDay.get(day) || []
          const isToday = day === calendarData.todayDay
          const hasOverdue = dayBills.some((b) => getEffectiveStatus(b) === 'overdue')
          const hasPending = dayBills.some((b) => getEffectiveStatus(b) === 'pending')
          const allPaid = dayBills.length > 0 && dayBills.every((b) => getEffectiveStatus(b) === 'paid')

          return (
            <div
              key={day}
              className={clsx(
                'min-h-[80px] border-b border-r border-gray-50 p-1',
                isToday && 'bg-primary-50/50'
              )}
            >
              <div className="flex items-center justify-between px-1">
                <span
                  className={clsx(
                    'text-xs font-medium',
                    isToday
                      ? 'flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white'
                      : 'text-gray-500'
                  )}
                >
                  {day}
                </span>
                {dayBills.length > 0 && (
                  <span
                    className={clsx(
                      'h-1.5 w-1.5 rounded-full',
                      hasOverdue ? 'bg-red-500' : hasPending ? 'bg-amber-400' : allPaid ? 'bg-green-500' : 'bg-gray-300'
                    )}
                  />
                )}
              </div>
              <div className="mt-0.5 space-y-0.5">
                {dayBills.slice(0, 3).map((bill) => {
                  const effective = getEffectiveStatus(bill)
                  return (
                    <div
                      key={bill.id}
                      className={clsx(
                        'truncate rounded px-1 py-0.5 text-[10px] leading-tight',
                        effective === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : effective === 'overdue'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                      )}
                      title={`${bill.name} - ${formatCurrency(bill.value)}`}
                    >
                      {bill.name}
                    </div>
                  )
                })}
                {dayBills.length > 3 && (
                  <p className="px-1 text-[10px] text-gray-400">+{dayBills.length - 3}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
