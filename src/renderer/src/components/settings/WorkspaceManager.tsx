import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useBillsStore } from '@/stores/useBillsStore'
import { useInvestmentsStore } from '@/stores/useInvestmentsStore'
import { useIncomeStore } from '@/stores/useIncomeStore'
import { useFGTSStore } from '@/stores/useFGTSStore'
import { useUIStore } from '@/stores/useUIStore'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { WORKSPACE_COLORS } from '@/lib/constants'
import type { Workspace } from '@/types/models'

export function WorkspaceManager(): React.JSX.Element {
  const workspaces = useSettingsStore((s) => s.workspaces)
  const addWorkspace = useSettingsStore((s) => s.addWorkspace)
  const updateWorkspace = useSettingsStore((s) => s.updateWorkspace)
  const deleteWorkspaceSettings = useSettingsStore((s) => s.deleteWorkspace)
  const deleteBillsData = useBillsStore((s) => s.deleteWorkspaceData)
  const deleteInvestmentsData = useInvestmentsStore((s) => s.deleteWorkspaceData)
  const deleteIncomeData = useIncomeStore((s) => s.deleteWorkspaceData)
  const deleteFGTSData = useFGTSStore((s) => s.deleteWorkspaceData)
  const addNotification = useUIStore((s) => s.addNotification)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('#6366f1')
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null)

  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'bills' | 'investments' | 'income'>('bills')

  const handleAdd = (): void => {
    if (!newName.trim()) return
    addWorkspace(newName.trim(), newType)
    setNewName('')
    setIsAdding(false)
    addNotification('Aba criada', 'success')
  }

  const handleSaveEdit = (id: string): void => {
    if (!editName.trim()) return
    updateWorkspace(id, { name: editName.trim(), color: editColor })
    setEditingId(null)
    addNotification('Aba atualizada', 'success')
  }

  const handleDelete = (): void => {
    if (!deleteTarget) return
    deleteWorkspaceSettings(deleteTarget.id)
    if (deleteTarget.type === 'bills') {
      deleteBillsData(deleteTarget.id)
    } else if (deleteTarget.type === 'investments') {
      deleteInvestmentsData(deleteTarget.id)
    } else if (deleteTarget.type === 'income') {
      deleteIncomeData(deleteTarget.id)
    } else if (deleteTarget.type === 'fgts') {
      deleteFGTSData(deleteTarget.id)
    }
    addNotification('Aba excluída', 'success')
    setDeleteTarget(null)
  }

  const billWs = workspaces.filter((w) => w.type === 'bills').sort((a, b) => a.sortOrder - b.sortOrder)
  const investWs = workspaces.filter((w) => w.type === 'investments').sort((a, b) => a.sortOrder - b.sortOrder)
  const incomeWs = workspaces.filter((w) => w.type === 'income').sort((a, b) => a.sortOrder - b.sortOrder)

  const renderWorkspaceGroup = (title: string, items: Workspace[]): React.JSX.Element => (
    <div className="mb-6">
      <h4 className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">{title}</h4>
      {items.length === 0 ? (
        <p className="py-3 text-center text-sm text-gray-400">Nenhuma aba</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((ws) => (
            <div
              key={ws.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5"
            >
              {editingId === ws.id ? (
                <>
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="h-6 w-6 cursor-pointer rounded border-0"
                  />
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(ws.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                  />
                  <button onClick={() => handleSaveEdit(ws.id)} className="rounded p-1 text-green-600 hover:bg-green-50">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: ws.color }} />
                  <span className="flex-1 text-sm font-medium text-gray-800">{ws.name}</span>
                  <button
                    onClick={() => {
                      setEditingId(ws.id)
                      setEditName(ws.name)
                      setEditColor(ws.color)
                    }}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(ws)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Abas / Workspaces</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100"
        >
          <Plus size={14} />
          Nova Aba
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50/30 p-3">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da aba"
            className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') setIsAdding(false)
            }}
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as 'bills' | 'investments' | 'income')}
            className="rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-primary-500 focus:outline-none"
          >
            <option value="bills">Contas Mensais</option>
            <option value="investments">Investimentos</option>
            <option value="income">Receitas</option>
          </select>
          <button onClick={handleAdd} className="rounded p-1.5 text-green-600 hover:bg-green-50">
            <Check size={18} />
          </button>
          <button onClick={() => setIsAdding(false)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
      )}

      {renderWorkspaceGroup('Contas Mensais', billWs)}
      {renderWorkspaceGroup('Investimentos', investWs)}
      {renderWorkspaceGroup('Receitas', incomeWs)}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir Aba"
        message={`Tem certeza que deseja excluir a aba "${deleteTarget?.name}"? Todos os dados associados serão perdidos permanentemente.`}
        confirmLabel="Excluir"
        danger
      />
    </div>
  )
}
