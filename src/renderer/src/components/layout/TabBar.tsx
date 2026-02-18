import { useState } from 'react'
import { clsx } from 'clsx'
import { Plus, X, Pencil, Check } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import type { Workspace, EntityId } from '@/types/models'

interface TabBarProps {
  workspaces: Workspace[]
  activeId: EntityId | null
  onSelect: (id: EntityId) => void
  onCreate: (name: string) => void
  onRename: (id: EntityId, name: string) => void
  onDelete: (id: EntityId) => void
}

export function TabBar({
  workspaces,
  activeId,
  onSelect,
  onCreate,
  onRename,
  onDelete
}: TabBarProps): React.JSX.Element {
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<EntityId | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<EntityId | null>(null)

  const deleteTargetName = deleteTarget
    ? workspaces.find((w) => w.id === deleteTarget)?.name ?? 'esta aba'
    : ''

  const handleCreate = (): void => {
    if (newName.trim()) {
      onCreate(newName.trim())
      setNewName('')
      setIsCreating(false)
    }
  }

  const handleRename = (id: EntityId): void => {
    if (editName.trim()) {
      onRename(id, editName.trim())
      setEditingId(null)
      setEditName('')
    }
  }

  const handleConfirmDelete = (): void => {
    if (deleteTarget) {
      onDelete(deleteTarget)
      setDeleteTarget(null)
    }
  }

  const sorted = [...workspaces].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <>
      <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-4 pt-2">
        {sorted.map((ws) => (
          <div
            key={ws.id}
            className={clsx(
              'group relative flex items-center gap-1.5 rounded-t-lg border border-b-0 px-3 py-1.5 text-sm font-medium transition-colors',
              activeId === ws.id
                ? 'border-gray-200 bg-gray-50 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-100 hover:bg-gray-50 hover:text-gray-700'
            )}
          >
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: ws.color }}
            />

            {editingId === ws.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleRename(ws.id)
                }}
                className="flex items-center gap-1"
              >
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleRename(ws.id)}
                  className="w-20 rounded border border-gray-300 px-1 py-0.5 text-xs"
                />
                <button type="submit" className="text-green-600">
                  <Check size={12} />
                </button>
              </form>
            ) : (
              <button onClick={() => onSelect(ws.id)} className="whitespace-nowrap">
                {ws.name}
              </button>
            )}

            {activeId === ws.id && editingId !== ws.id && (
              <div className="ml-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <SimpleTooltip label="Renomear aba">
                  <button
                    onClick={() => {
                      setEditingId(ws.id)
                      setEditName(ws.name)
                    }}
                    className="rounded p-0.5 text-gray-400 hover:text-gray-600"
                  >
                    <Pencil size={12} />
                  </button>
                </SimpleTooltip>
                {workspaces.length > 1 && (
                  <SimpleTooltip label="Excluir aba">
                    <button
                      onClick={() => setDeleteTarget(ws.id)}
                      className="rounded p-0.5 text-gray-400 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </SimpleTooltip>
                )}
              </div>
            )}
          </div>
        ))}

        {isCreating ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleCreate()
            }}
            className="flex items-center gap-1 px-2"
          >
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => {
                if (!newName.trim()) setIsCreating(false)
                else handleCreate()
              }}
              placeholder="Nome..."
              className="w-24 rounded border border-gray-300 px-2 py-1 text-xs"
            />
          </form>
        ) : (
          <SimpleTooltip label="Criar nova aba de trabalho">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1 rounded-t-lg px-2 py-1.5 text-sm text-gray-400 hover:text-gray-600"
            >
              <Plus size={16} />
            </button>
          </SimpleTooltip>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Aba"
        message={`Tem certeza que deseja excluir "${deleteTargetName}"? Todos os dados desta aba serão perdidos.`}
        confirmLabel="Excluir"
        danger
      />
    </>
  )
}
