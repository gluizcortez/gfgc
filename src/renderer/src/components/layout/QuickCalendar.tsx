import { useState, useMemo, useRef, useEffect } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import * as Dialog from '@radix-ui/react-dialog'
import { useBillsStore } from '@/stores/useBillsStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { getEffectiveStatus } from '@/lib/billStatus'
import { formatCurrency, formatMonthYear, getNextMonthKey, getPrevMonthKey, getCurrentMonthKey } from '@/lib/formatters'
import { BILL_STATUS_LABELS } from '@/lib/constants'
import type { BillEntry } from '@/types/models'

export function QuickCalendar(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey())
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('all')

  const monthlyRecords = useBillsStore((s) => s.monthlyRecords)
  const allWorkspaces = useSettingsStore((s) => s.workspaces)
  const billWorkspaces = useMemo(() => allWorkspaces.filter((w) => w.type === 'bills'), [allWorkspaces])

  const [year, month] = monthKey.split('-').map(Number)

  const bills = useMemo(() => {
    const records = monthlyRecords.filter((r) => {
      if (r.monthKey !== monthKey) return false
      if (selectedWorkspaceId !== 'all' && r.workspaceId !== selectedWorkspaceId) return false
      return true
    })
    return records.flatMap((r) => r.bills)
  }, [monthlyRecords, monthKey, selectedWorkspaceId])

  const calendarData = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const today = new Date()
    const todayDay = today.getFullYear() === year && today.getMonth() + 1 === month ? today.getDate() : -1

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
  while (cells.length % 7 !== 0) cells.push(null)

  const totalMonth = bills.reduce((sum, b) => sum + b.value, 0)
  const paidMonth = bills.filter((b) => getEffectiveStatus(b) === 'paid').reduce((sum, b) => sum + b.value, 0)

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
        >
          <CalendarDays size={18} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 h-[70vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl bg-white p-0 shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <Dialog.Title className="text-base font-semibold text-gray-900">
              Calendário de Contas
            </Dialog.Title>
            <select
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 focus:border-primary-400 focus:outline-none"
            >
              <option value="all">Todas as abas</option>
              {billWorkspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          </div>

          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-3">
            <button
              onClick={() => setMonthKey(getPrevMonthKey(monthKey))}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-gray-900">{formatMonthYear(monthKey)}</span>
            <button
              onClick={() => setMonthKey(getNextMonthKey(monthKey))}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Mini summary */}
          <div className="mx-5 mb-3 flex gap-3">
            <div className="flex-1 rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-[10px] font-medium text-gray-400 uppercase">Total</p>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(totalMonth)}</p>
            </div>
            <div className="flex-1 rounded-lg bg-green-50 px-3 py-2">
              <p className="text-[10px] font-medium text-green-500 uppercase">Pago</p>
              <p className="text-sm font-bold text-green-700">{formatCurrency(paidMonth)}</p>
            </div>
            <div className="flex-1 rounded-lg bg-amber-50 px-3 py-2">
              <p className="text-[10px] font-medium text-amber-500 uppercase">Restante</p>
              <p className="text-sm font-bold text-amber-700">{formatCurrency(totalMonth - paidMonth)}</p>
            </div>
          </div>

          {/* Calendar */}
          <div className="flex-1 flex flex-col px-5 pb-5 min-h-0">
            <div className="rounded-xl border border-gray-200 flex-1 flex flex-col">
              <div className="grid grid-cols-7 border-b border-gray-100">
                {dayNames.map((name) => (
                  <div key={name} className="px-1 py-1.5 text-center text-[10px] font-medium text-gray-400">
                    {name}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 flex-1">
                {cells.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="min-h-[48px] border-b border-r border-gray-50" />
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
                        'min-h-[48px] border-b border-r border-gray-50 p-1',
                        isToday && 'bg-primary-50/50'
                      )}
                    >
                      <div className="flex items-center justify-between px-0.5">
                        <span
                          className={clsx(
                            'text-[10px] font-medium',
                            isToday
                              ? 'flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-white'
                              : 'text-gray-500'
                          )}
                        >
                          {day}
                        </span>
                        {dayBills.length > 0 && (
                          <span
                            className={clsx(
                              'h-1 w-1 rounded-full',
                              hasOverdue ? 'bg-red-500' : hasPending ? 'bg-amber-400' : allPaid ? 'bg-green-500' : 'bg-gray-300'
                            )}
                          />
                        )}
                      </div>
                      <div className="mt-0.5 space-y-px">
                        {dayBills.slice(0, 3).map((bill) => {
                          const effective = getEffectiveStatus(bill)
                          return (
                            <div
                              key={bill.id}
                              className={clsx(
                                'truncate rounded px-0.5 text-[9px] leading-tight',
                                effective === 'paid'
                                  ? 'bg-green-100 text-green-700'
                                  : effective === 'overdue'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-600'
                              )}
                              title={`${bill.name} - ${formatCurrency(bill.value)} - ${BILL_STATUS_LABELS[effective]}`}
                            >
                              {bill.name}
                            </div>
                          )
                        })}
                        {dayBills.length > 3 && (
                          <p className="px-0.5 text-[9px] text-gray-400">+{dayBills.length - 3}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
