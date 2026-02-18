import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Receipt, Copy, CalendarDays, List, FileDown } from 'lucide-react'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { getNextMonthKey } from '@/lib/formatters'
import { TabBar } from '@/components/layout/TabBar'
import { MonthNavigator } from '@/components/layout/MonthNavigator'
import { BillsSummary } from './BillsSummary'
import { BillsTable } from './BillsTable'
import { BillFormModal } from './BillFormModal'
import { BudgetOverview } from './BudgetOverview'
import { DuplicateMonthModal } from './DuplicateMonthModal'
import { BillsCalendar } from './BillsCalendar'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useBillsStore } from '@/stores/useBillsStore'
import { useUIStore } from '@/stores/useUIStore'
import { formatCurrency, formatDate, formatMonthYear } from '@/lib/formatters'
import type { BillEntry, BillStatus } from '@/types/models'

export function BillsPage(): React.JSX.Element {
  const allWorkspaces = useSettingsStore((s) => s.workspaces)
  const workspaces = useMemo(() => allWorkspaces.filter((w) => w.type === 'bills'), [allWorkspaces])
  const addWorkspace = useSettingsStore((s) => s.addWorkspace)
  const updateWorkspace = useSettingsStore((s) => s.updateWorkspace)
  const deleteWorkspaceSettings = useSettingsStore((s) => s.deleteWorkspace)
  const deleteWorkspaceData = useBillsStore((s) => s.deleteWorkspaceData)
  const autoGenerate = useSettingsStore((s) => s.settings.autoGenerateRecurringBills)

  const activeId = useUIStore((s) => s.activeBillsWorkspaceId)
  const setActiveId = useUIStore((s) => s.setActiveBillsWorkspace)
  const month = useUIStore((s) => s.activeBillsMonth)
  const setMonth = useUIStore((s) => s.setActiveBillsMonth)
  const addNotification = useUIStore((s) => s.addNotification)

  const allBills = useBillsStore((s) => s.bills)
  const monthlyRecords = useBillsStore((s) => s.monthlyRecords)
  const addBillEntry = useBillsStore((s) => s.addBillEntry)
  const updateBillEntry = useBillsStore((s) => s.updateBillEntry)
  const deleteBillEntry = useBillsStore((s) => s.deleteBillEntry)
  const setBillEntryStatus = useBillsStore((s) => s.setBillEntryStatus)
  const generateMonthFromTemplates = useBillsStore((s) => s.generateMonthFromTemplates)

  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<BillEntry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const effectiveId = activeId || workspaces[0]?.id || null

  const currentRecord = useMemo(
    () =>
      monthlyRecords.find(
        (r) => r.workspaceId === effectiveId && r.monthKey === month
      ),
    [monthlyRecords, effectiveId, month]
  )

  const bills = currentRecord?.bills || []

  // Auto-generate recurring bills
  const autoGenChecked = useRef<string>('')
  useEffect(() => {
    if (!effectiveId || autoGenerate === false) return
    const key = `${effectiveId}-${month}`
    if (autoGenChecked.current === key) return
    autoGenChecked.current = key

    const record = monthlyRecords.find(
      (r) => r.workspaceId === effectiveId && r.monthKey === month
    )
    if (!record || record.bills.length === 0) {
      const templates = allBills.filter(
        (b) => b.workspaceId === effectiveId && b.isRecurring
      )
      if (templates.length > 0) {
        generateMonthFromTemplates(effectiveId, month)
        addNotification(`${templates.length} contas recorrentes geradas`, 'info')
      }
    }
  }, [effectiveId, month, autoGenerate])

  const handleCreateWorkspace = (name: string): void => {
    const id = addWorkspace(name, 'bills')
    setActiveId(id)
  }

  const handleDeleteWorkspace = (id: string): void => {
    deleteWorkspaceSettings(id)
    deleteWorkspaceData(id)
    if (effectiveId === id) {
      setActiveId(workspaces.find((w) => w.id !== id)?.id || null)
    }
  }

  const handleSaveBill = (data: Omit<BillEntry, 'id'>, recurrenceMonths?: number): void => {
    if (!effectiveId) return

    if (editingEntry) {
      if (currentRecord) {
        updateBillEntry(currentRecord.id, editingEntry.id, data)
        addNotification('Conta atualizada', 'success')
      }
    } else {
      if (recurrenceMonths && recurrenceMonths > 0) {
        const total = recurrenceMonths + 1
        addBillEntry(effectiveId, month, {
          ...data,
          name: `${data.name} (1/${total})`
        })
        let futureMonth = month
        const [, , dayStr] = data.dueDate.split('-')
        for (let i = 0; i < recurrenceMonths; i++) {
          futureMonth = getNextMonthKey(futureMonth)
          const [fy, fm] = futureMonth.split('-')
          const maxDay = new Date(Number(fy), Number(fm), 0).getDate()
          const day = Math.min(Number(dayStr), maxDay)
          addBillEntry(effectiveId, futureMonth, {
            ...data,
            name: `${data.name} (${i + 2}/${total})`,
            dueDate: `${fy}-${fm}-${String(day).padStart(2, '0')}`,
            status: 'pending',
            paidDate: undefined
          })
        }
        addNotification(`Conta adicionada para ${total} meses`, 'success')
      } else {
        addBillEntry(effectiveId, month, data)
        addNotification('Conta adicionada', 'success')
      }
    }
    setEditingEntry(null)
  }

  const handleDeleteBill = (): void => {
    if (currentRecord && deleteTarget) {
      deleteBillEntry(currentRecord.id, deleteTarget)
      addNotification('Conta removida', 'success')
      setDeleteTarget(null)
    }
  }

  const handleToggleStatus = (entryId: string, newStatus: BillStatus): void => {
    if (currentRecord) {
      setBillEntryStatus(currentRecord.id, entryId, newStatus)
    }
  }

  const handleExportMonth = (): void => {
    if (bills.length === 0) return
    const header = 'Nome,Valor,Vencimento,Status'
    const statusMap = { pending: 'Pendente', paid: 'Pago', overdue: 'Atrasado' }
    const rows = bills.map((b) =>
      `"${b.name}",${(b.value / 100).toFixed(2)},${formatDate(b.dueDate)},${statusMap[b.status]}`
    )
    const total = bills.reduce((sum, b) => sum + b.value, 0)
    rows.push(`"TOTAL",${(total / 100).toFixed(2)},,`)
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gfgc-contas-${month}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addNotification('Relatório mensal exportado', 'success')
  }

  if (workspaces.length === 0) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-bold text-gray-900">Contas Mensais</h1>
        <EmptyState
          icon={Receipt}
          title="Nenhuma aba criada"
          description="Crie uma aba para começar a gerenciar suas contas mensais. Ex: Gabriel, Carol, Casa..."
          action={{
            label: 'Criar Primeira Aba',
            onClick: () => handleCreateWorkspace('Minhas Contas')
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <TabBar
        workspaces={workspaces}
        activeId={effectiveId}
        onSelect={setActiveId}
        onCreate={handleCreateWorkspace}
        onRename={(id, name) => updateWorkspace(id, { name })}
        onDelete={handleDeleteWorkspace}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <MonthNavigator monthKey={month} onChange={setMonth} />
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-gray-200">
              <SimpleTooltip label="Visualização em lista">
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-l-lg px-2.5 py-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List size={16} />
                </button>
              </SimpleTooltip>
              <SimpleTooltip label="Visualização em calendário">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`rounded-r-lg px-2.5 py-2 ${viewMode === 'calendar' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <CalendarDays size={16} />
                </button>
              </SimpleTooltip>
            </div>
            {bills.length > 0 && (
              <SimpleTooltip label="Exportar contas do mês como arquivo CSV">
                <button
                  onClick={handleExportMonth}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <FileDown size={16} />
                </button>
              </SimpleTooltip>
            )}
            <SimpleTooltip label="Copiar todas as contas deste mês para outro mês">
              <button
                onClick={() => setShowDuplicateModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <Copy size={16} />
                Duplicar Mês
              </button>
            </SimpleTooltip>
            <SimpleTooltip label="Adicionar uma nova conta neste mês">
              <button
                onClick={() => {
                  setEditingEntry(null)
                  setShowForm(true)
                }}
                className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <Plus size={16} />
                Nova Conta
              </button>
            </SimpleTooltip>
          </div>
        </div>

        <BudgetOverview bills={bills} />

        <div className="mb-6">
          <BillsSummary bills={bills} />
        </div>

        {bills.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Nenhuma conta neste mês"
            description="Adicione contas manualmente ou gere a partir dos templates recorrentes."
            action={{
              label: 'Adicionar Conta',
              onClick: () => {
                setEditingEntry(null)
                setShowForm(true)
              }
            }}
          />
        ) : viewMode === 'calendar' ? (
          <BillsCalendar bills={bills} monthKey={month} />
        ) : (
          <BillsTable
            bills={bills}
            onEdit={(entry) => {
              setEditingEntry(entry)
              setShowForm(true)
            }}
            onDelete={(id) => setDeleteTarget(id)}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>

      <BillFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingEntry(null)
        }}
        onSave={handleSaveBill}
        onToggleStatus={handleToggleStatus}
        initialData={editingEntry}
      />

      {effectiveId && (
        <DuplicateMonthModal
          open={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          workspaceId={effectiveId}
          currentMonth={month}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteBill}
        title="Excluir Conta"
        message="Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
      />
    </div>
  )
}
