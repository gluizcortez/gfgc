import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useUIStore } from '@/stores/useUIStore'
import { parseCurrencyInput, formatCurrency } from '@/lib/formatters'
import type { Category } from '@/types/models'

export function CategoriesManager(): React.JSX.Element {
  const categories = useSettingsStore((s) => s.settings.categories)
  const addCategory = useSettingsStore((s) => s.addCategory)
  const updateCategory = useSettingsStore((s) => s.updateCategory)
  const deleteCategory = useSettingsStore((s) => s.deleteCategory)
  const addNotification = useUIStore((s) => s.addNotification)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('#6366f1')
  const [editType, setEditType] = useState<Category['type']>('bill')

  const [editBudget, setEditBudget] = useState('')

  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [newType, setNewType] = useState<Category['type']>('bill')
  const [newBudget, setNewBudget] = useState('')

  const handleAdd = (): void => {
    if (!newName.trim()) return
    const budget = newBudget ? parseCurrencyInput(newBudget) : undefined
    addCategory({ name: newName.trim(), color: newColor, type: newType, isDefault: false, budget })
    setNewName('')
    setNewColor('#6366f1')
    setNewType('bill')
    setNewBudget('')
    setIsAdding(false)
    addNotification('Categoria adicionada', 'success')
  }

  const handleSaveEdit = (id: string): void => {
    if (!editName.trim()) return
    const budget = editBudget ? parseCurrencyInput(editBudget) : undefined
    updateCategory(id, { name: editName.trim(), color: editColor, type: editType, budget })
    setEditingId(null)
    addNotification('Categoria atualizada', 'success')
  }

  const handleDelete = (id: string): void => {
    deleteCategory(id)
    addNotification('Categoria removida', 'success')
  }

  const typeLabel = (t: string): string => {
    if (t === 'bill') return 'Contas'
    if (t === 'investment') return 'Investimentos'
    return 'Ambos'
  }

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Categorias</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100"
        >
          <Plus size={14} />
          Nova Categoria
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Cor</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Orçamento</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isAdding && (
              <tr className="bg-primary-50/30">
                <td className="px-4 py-2">
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="h-6 w-6 cursor-pointer rounded border-0"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nome da categoria"
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAdd()
                      if (e.key === 'Escape') setIsAdding(false)
                    }}
                  />
                </td>
                <td className="px-4 py-2">
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as Category['type'])}
                    className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-primary-500 focus:outline-none"
                  >
                    <option value="bill">Contas</option>
                    <option value="investment">Investimentos</option>
                    <option value="both">Ambos</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="R$ 0,00"
                    className="w-24 rounded border border-gray-300 px-2 py-1 text-xs focus:border-primary-500 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={handleAdd} className="rounded p-1 text-green-600 hover:bg-green-50">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setIsAdding(false)} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                      <X size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {sorted.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-2">
                  {editingId === cat.id ? (
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="h-6 w-6 cursor-pointer rounded border-0"
                    />
                  ) : (
                    <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: cat.color }} />
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === cat.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(cat.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                    />
                  ) : (
                    <span className="text-sm text-gray-800">{cat.name}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === cat.id ? (
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as Category['type'])}
                      className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-primary-500 focus:outline-none"
                    >
                      <option value="bill">Contas</option>
                      <option value="investment">Investimentos</option>
                      <option value="both">Ambos</option>
                    </select>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {typeLabel(cat.type)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === cat.id ? (
                    <input
                      value={editBudget}
                      onChange={(e) => setEditBudget(e.target.value)}
                      placeholder="R$ 0,00"
                      className="w-24 rounded border border-gray-300 px-2 py-1 text-xs focus:border-primary-500 focus:outline-none"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">
                      {cat.budget ? formatCurrency(cat.budget) : '—'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-1">
                    {editingId === cat.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(cat.id)} className="rounded p-1 text-green-600 hover:bg-green-50">
                          <Check size={15} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                          <X size={15} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(cat.id)
                            setEditName(cat.name)
                            setEditColor(cat.color)
                            setEditType(cat.type)
                            setEditBudget(cat.budget ? (cat.budget / 100).toFixed(2).replace('.', ',') : '')
                          }}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Pencil size={15} />
                        </button>
                        {!cat.isDefault && (
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
