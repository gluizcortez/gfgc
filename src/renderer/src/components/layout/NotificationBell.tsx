import { useState, useMemo, useRef, useEffect } from 'react'
import { Bell, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { useBillsStore } from '@/stores/useBillsStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useUIStore } from '@/stores/useUIStore'
import { getEffectiveStatus } from '@/lib/billStatus'
import { formatCurrency, formatDate, getCurrentMonthKey } from '@/lib/formatters'
import type { BillEntry } from '@/types/models'

interface BillAlert {
  id: string
  type: 'overdue' | 'today' | 'upcoming'
  bill: BillEntry
  workspaceId: string
  workspaceName: string
  monthKey: string
}

export function NotificationBell(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const monthlyRecords = useBillsStore((s) => s.monthlyRecords)
  const workspaces = useSettingsStore((s) => s.workspaces)
  const setActiveSection = useUIStore((s) => s.setActiveSection)
  const setActiveBillsWorkspace = useUIStore((s) => s.setActiveBillsWorkspace)
  const setActiveBillsMonth = useUIStore((s) => s.setActiveBillsMonth)

  const currentMonth = getCurrentMonthKey()

  const alerts = useMemo(() => {
    const result: BillAlert[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const billWorkspaces = workspaces.filter((w) => w.type === 'bills')
    const currentRecords = monthlyRecords.filter((r) => r.monthKey === currentMonth)

    for (const record of currentRecords) {
      const ws = billWorkspaces.find((w) => w.id === record.workspaceId)
      if (!ws) continue

      for (const bill of record.bills) {
        const effective = getEffectiveStatus(bill)
        if (effective === 'paid') continue

        const due = new Date(bill.dueDate + 'T00:00:00')
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (effective === 'overdue') {
          result.push({
            id: `${record.id}-${bill.id}`,
            type: 'overdue',
            bill,
            workspaceId: record.workspaceId,
            workspaceName: ws.name,
            monthKey: record.monthKey
          })
        } else if (diffDays === 0) {
          result.push({
            id: `${record.id}-${bill.id}`,
            type: 'today',
            bill,
            workspaceId: record.workspaceId,
            workspaceName: ws.name,
            monthKey: record.monthKey
          })
        } else if (diffDays > 0 && diffDays <= 3) {
          result.push({
            id: `${record.id}-${bill.id}`,
            type: 'upcoming',
            bill,
            workspaceId: record.workspaceId,
            workspaceName: ws.name,
            monthKey: record.monthKey
          })
        }
      }
    }

    // Sort: overdue first, then today, then upcoming
    const order = { overdue: 0, today: 1, upcoming: 2 }
    result.sort((a, b) => order[a.type] - order[b.type])

    return result
  }, [monthlyRecords, workspaces, currentMonth])

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleAlertClick = (alert: BillAlert): void => {
    setActiveBillsWorkspace(alert.workspaceId)
    setActiveBillsMonth(alert.monthKey)
    setActiveSection('bills')
    setIsOpen(false)
  }

  const overdueCount = alerts.filter((a) => a.type === 'overdue').length
  const totalCount = alerts.length

  const getAlertIcon = (type: BillAlert['type']) => {
    switch (type) {
      case 'overdue': return AlertTriangle
      case 'today': return Clock
      case 'upcoming': return Clock
    }
  }

  const getAlertStyle = (type: BillAlert['type']) => {
    switch (type) {
      case 'overdue': return 'text-red-600 bg-red-50'
      case 'today': return 'text-amber-600 bg-amber-50'
      case 'upcoming': return 'text-blue-600 bg-blue-50'
    }
  }

  const getAlertLabel = (type: BillAlert['type']) => {
    switch (type) {
      case 'overdue': return 'Atrasada'
      case 'today': return 'Vence hoje'
      case 'upcoming': return 'Vence em breve'
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
          isOpen
            ? 'bg-gray-100 text-gray-700'
            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
        )}
      >
        <Bell size={18} />
        {totalCount > 0 && (
          <span
            className={clsx(
              'absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white',
              overdueCount > 0 ? 'bg-red-500' : 'bg-amber-500'
            )}
          >
            {totalCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
            <p className="text-xs text-gray-400">
              {totalCount === 0
                ? 'Nenhuma pendência no momento'
                : `${totalCount} alerta(s) para o mês atual`}
            </p>
          </div>

          <div className="max-h-80 overflow-auto">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <CheckCircle size={24} className="text-green-400" />
                <p className="text-sm text-gray-400">Tudo em dia!</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const Icon = getAlertIcon(alert.type)
                return (
                  <button
                    key={alert.id}
                    onClick={() => handleAlertClick(alert)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className={clsx('mt-0.5 rounded-lg p-1.5', getAlertStyle(alert.type))}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{alert.bill.name}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium">{formatCurrency(alert.bill.value)}</span>
                        <span>·</span>
                        <span>{formatDate(alert.bill.dueDate)}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs">
                        <span className={clsx(
                          'rounded-full px-1.5 py-0.5 font-medium',
                          getAlertStyle(alert.type)
                        )}>
                          {getAlertLabel(alert.type)}
                        </span>
                        <span className="text-gray-400">{alert.workspaceName}</span>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
