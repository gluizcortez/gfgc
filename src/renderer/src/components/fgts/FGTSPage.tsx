import { useState, useMemo } from 'react'
import { Plus, Landmark } from 'lucide-react'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { TabBar } from '@/components/layout/TabBar'
import { FGTSRecordsList } from './FGTSRecordsList'
import { FGTSFormModal } from './FGTSFormModal'
import { FGTSYearChart } from './FGTSYearChart'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useFGTSStore } from '@/stores/useFGTSStore'
import { useUIStore } from '@/stores/useUIStore'
import { formatCurrency } from '@/lib/formatters'

export function FGTSPage(): React.JSX.Element {
  const allWorkspaces = useSettingsStore((s) => s.workspaces)
  const workspaces = useMemo(() => allWorkspaces.filter((w) => w.type === 'fgts'), [allWorkspaces])
  const addWorkspace = useSettingsStore((s) => s.addWorkspace)
  const updateWorkspace = useSettingsStore((s) => s.updateWorkspace)
  const deleteWorkspaceSettings = useSettingsStore((s) => s.deleteWorkspace)
  const deleteWorkspaceData = useFGTSStore((s) => s.deleteWorkspaceData)

  const activeId = useUIStore((s) => s.activeFGTSWorkspaceId)
  const setActiveId = useUIStore((s) => s.setActiveFGTSWorkspace)
  const addNotification = useUIStore((s) => s.addNotification)

  const records = useFGTSStore((s) => s.records)
  const addRecord = useFGTSStore((s) => s.addRecord)
  const updateRecord = useFGTSStore((s) => s.updateRecord)
  const deleteRecordAction = useFGTSStore((s) => s.deleteRecord)

  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<typeof records[0] | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const effectiveId = activeId || workspaces[0]?.id || null

  const wsRecords = useMemo(
    () => records.filter((r) => r.workspaceId === effectiveId).sort((a, b) => b.monthKey.localeCompare(a.monthKey)),
    [records, effectiveId]
  )

  const latestBalance = wsRecords.length > 0 ? wsRecords[0].balance : 0

  const handleCreateWorkspace = (name: string): void => {
    const id = addWorkspace(name, 'fgts')
    setActiveId(id)
  }

  const handleDeleteWorkspace = (id: string): void => {
    deleteWorkspaceSettings(id)
    deleteWorkspaceData(id)
    if (effectiveId === id) {
      setActiveId(workspaces.find((w) => w.id !== id)?.id || null)
    }
  }

  const handleSaveRecord = (data: { monthKey: string; balance: number; notes: string }): void => {
    if (!effectiveId) return
    if (editingRecord) {
      updateRecord(editingRecord.id, data)
      addNotification('Registro atualizado', 'success')
    } else {
      addRecord({ ...data, workspaceId: effectiveId })
      addNotification('Registro adicionado', 'success')
    }
    setEditingRecord(null)
  }

  const handleDeleteRecord = (): void => {
    if (deleteTarget) {
      deleteRecordAction(deleteTarget)
      addNotification('Registro removido', 'success')
      setDeleteTarget(null)
    }
  }

  if (workspaces.length === 0) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-bold text-gray-900">FGTS</h1>
        <EmptyState
          icon={Landmark}
          title="Nenhuma conta FGTS"
          description="Adicione uma conta FGTS para acompanhar a evolução do seu saldo."
          action={{ label: 'Adicionar Conta FGTS', onClick: () => handleCreateWorkspace('Meu FGTS') }}
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
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Saldo Atual</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(latestBalance)}</p>
          </div>
          <SimpleTooltip label="Adicionar registro mensal de saldo do FGTS">
            <button
              onClick={() => { setEditingRecord(null); setShowForm(true) }}
              className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              <Plus size={16} />
              Novo Registro
            </button>
          </SimpleTooltip>
        </div>

        {/* Year chart */}
        {wsRecords.length > 0 && (
          <div className="mb-6">
            <FGTSYearChart records={wsRecords} />
          </div>
        )}

        {/* Records list */}
        {wsRecords.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title="Nenhum registro"
            description="Adicione registros mensais para acompanhar a evolução do FGTS."
            action={{ label: 'Adicionar Registro', onClick: () => { setEditingRecord(null); setShowForm(true) } }}
          />
        ) : (
          <FGTSRecordsList
            records={wsRecords}
            onEdit={(record) => { setEditingRecord(record); setShowForm(true) }}
            onDelete={(id) => setDeleteTarget(id)}
          />
        )}
      </div>

      <FGTSFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditingRecord(null) }}
        onSave={handleSaveRecord}
        initialData={editingRecord}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteRecord}
        title="Excluir Registro"
        message="Tem certeza que deseja excluir este registro de FGTS?"
        confirmLabel="Excluir"
        danger
      />
    </div>
  )
}
