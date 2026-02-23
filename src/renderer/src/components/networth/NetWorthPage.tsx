import { useMemo, useState, useEffect } from 'react'
import { Wallet, Pencil, Plus, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'
import { NetWorthEvolutionChart } from './NetWorthEvolutionChart'
import { AssetBreakdownCards } from './AssetBreakdownCards'
import { EmptyState } from '@/components/shared/EmptyState'
import { Modal } from '@/components/shared/Modal'
import { useInvestmentsStore } from '@/stores/useInvestmentsStore'
import { useFGTSStore } from '@/stores/useFGTSStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useNetWorthTabsStore } from '@/stores/useNetWorthTabsStore'
import { calculateNetWorth } from '@/lib/calculations'
import { formatCurrency, getCurrentMonthKey } from '@/lib/formatters'
import type { EntityId } from '@/types/models'

interface TabModalState {
  open: boolean
  editId: string | null
}

export function NetWorthPage(): React.JSX.Element {
  const investments = useInvestmentsStore((s) => s.investments)
  const transactions = useInvestmentsStore((s) => s.transactions)
  const fgtsRecords = useFGTSStore((s) => s.records)
  const workspaces = useSettingsStore((s) => s.workspaces)
  const customTabs = useNetWorthTabsStore((s) => s.tabs)
  const addTab = useNetWorthTabsStore((s) => s.addTab)
  const updateTab = useNetWorthTabsStore((s) => s.updateTab)
  const deleteTab = useNetWorthTabsStore((s) => s.deleteTab)

  const investmentWorkspaces = useMemo(
    () => workspaces.filter((w) => w.type === 'investments'),
    [workspaces]
  )
  const fgtsWorkspaces = useMemo(
    () => workspaces.filter((w) => w.type === 'fgts'),
    [workspaces]
  )

  const [activeTabId, setActiveTabId] = useState<string>('all')
  const [tabModal, setTabModal] = useState<TabModalState>({ open: false, editId: null })
  const [tabName, setTabName] = useState('')
  const [tabInvWsIds, setTabInvWsIds] = useState<EntityId[]>([])
  const [tabFgtsWsIds, setTabFgtsWsIds] = useState<EntityId[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Reset to 'all' if the active custom tab is deleted
  useEffect(() => {
    if (activeTabId !== 'all' && !customTabs.find((t) => t.id === activeTabId)) {
      setActiveTabId('all')
    }
  }, [customTabs, activeTabId])

  const openCreateModal = (): void => {
    setTabName('')
    setTabInvWsIds([])
    setTabFgtsWsIds([])
    setShowDeleteConfirm(false)
    setTabModal({ open: true, editId: null })
  }

  const openEditModal = (id: string): void => {
    const tab = customTabs.find((t) => t.id === id)
    if (!tab) return
    setTabName(tab.name)
    setTabInvWsIds([...tab.investmentWorkspaceIds])
    setTabFgtsWsIds([...tab.fgtsWorkspaceIds])
    setShowDeleteConfirm(false)
    setTabModal({ open: true, editId: id })
  }

  const closeModal = (): void => {
    setTabModal({ open: false, editId: null })
    setShowDeleteConfirm(false)
  }

  const handleSaveTab = (): void => {
    if (!tabName.trim()) return
    if (tabModal.editId) {
      updateTab(tabModal.editId, {
        name: tabName.trim(),
        investmentWorkspaceIds: tabInvWsIds,
        fgtsWorkspaceIds: tabFgtsWsIds
      })
    } else {
      const newId = addTab({
        name: tabName.trim(),
        investmentWorkspaceIds: tabInvWsIds,
        fgtsWorkspaceIds: tabFgtsWsIds
      })
      setActiveTabId(newId)
    }
    closeModal()
  }

  const handleDeleteTab = (): void => {
    if (!tabModal.editId) return
    deleteTab(tabModal.editId)
    closeModal()
  }

  const toggleInvWs = (id: EntityId): void => {
    setTabInvWsIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleFgtsWs = (id: EntityId): void => {
    setTabFgtsWsIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const activeCustomTab = customTabs.find((t) => t.id === activeTabId) ?? null

  const filteredInvestments = useMemo(() => {
    const active = investments.filter((i) => i.isActive)
    if (!activeCustomTab) return active
    return active.filter((i) => activeCustomTab.investmentWorkspaceIds.includes(i.workspaceId))
  }, [investments, activeCustomTab])

  const filteredTransactions = useMemo(() => {
    if (!activeCustomTab) return transactions
    return transactions.filter((t) => activeCustomTab.investmentWorkspaceIds.includes(t.workspaceId))
  }, [transactions, activeCustomTab])

  const filteredFgtsRecords = useMemo(() => {
    if (!activeCustomTab) return fgtsRecords
    return fgtsRecords.filter((r) => activeCustomTab.fgtsWorkspaceIds.includes(r.workspaceId))
  }, [fgtsRecords, activeCustomTab])

  const netWorth = useMemo(
    () => calculateNetWorth(filteredInvestments, filteredFgtsRecords),
    [filteredInvestments, filteredFgtsRecords]
  )

  const investTotal = useMemo(
    () => filteredInvestments.reduce((sum, i) => sum + i.currentBalance, 0),
    [filteredInvestments]
  )

  const fgtsLatest = useMemo(() => {
    const sorted = [...filteredFgtsRecords].sort((a, b) => b.monthKey.localeCompare(a.monthKey))
    return sorted[0]?.balance || 0
  }, [filteredFgtsRecords])

  const hasAnyData = investments.filter((i) => i.isActive).length > 0 || fgtsRecords.length > 0

  if (!hasAnyData) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-bold text-gray-900">Patrimônio</h1>
        <EmptyState
          icon={Wallet}
          title="Sem dados patrimoniais"
          description="Registre investimentos ou saldo do FGTS para acompanhar seu patrimônio."
        />
      </div>
    )
  }

  const hasTabData = filteredInvestments.length > 0 || filteredFgtsRecords.length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-4 pt-1">
        {/* All tab */}
        <button
          onClick={() => setActiveTabId('all')}
          className={clsx(
            'shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors',
            activeTabId === 'all'
              ? 'border-b-2 border-primary-600 text-primary-700'
              : 'text-gray-500 hover:text-gray-800'
          )}
        >
          Todos
        </button>

        {/* Custom tabs */}
        {customTabs.map((tab) => (
          <div key={tab.id} className="group relative flex shrink-0 items-center">
            <button
              onClick={() => setActiveTabId(tab.id)}
              className={clsx(
                'rounded-t-lg px-4 py-2.5 pr-7 text-sm font-medium transition-colors',
                activeTabId === tab.id
                  ? 'border-b-2 border-primary-600 text-primary-700'
                  : 'text-gray-500 hover:text-gray-800'
              )}
            >
              {tab.name}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); openEditModal(tab.id) }}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-300 opacity-0 transition-opacity hover:text-gray-600 group-hover:opacity-100"
              title="Editar aba"
            >
              <Pencil size={11} />
            </button>
          </div>
        ))}

        {/* Add new tab button */}
        <button
          onClick={openCreateModal}
          className="ml-1 flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          title="Nova aba"
        >
          <Plus size={13} />
          Nova Aba
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Patrimônio</h1>
          <p className="mt-1 text-xs text-gray-400">
            O cálculo de patrimônio considera apenas investimentos e FGTS. Metas financeiras não são incluídas.
          </p>
        </div>

        {!hasTabData ? (
          <EmptyState
            icon={Wallet}
            title="Sem dados nesta aba"
            description="Não há investimentos ou registros de FGTS para este grupo."
          />
        ) : (
          <>
            {/* Total card */}
            <div className="mb-6 rounded-xl border border-primary-200 bg-primary-50 p-5">
              <p className="text-sm font-medium text-primary-600">Patrimônio Total</p>
              <p className="mt-1 text-3xl font-bold text-primary-900">{formatCurrency(netWorth)}</p>
              <div className="mt-2 flex gap-6 text-sm text-primary-700">
                {investTotal > 0 && <span>Investimentos: {formatCurrency(investTotal)}</span>}
                {fgtsLatest > 0 && <span>FGTS: {formatCurrency(fgtsLatest)}</span>}
              </div>
            </div>

            {/* Asset breakdown */}
            <div className="mb-6">
              <AssetBreakdownCards
                investments={filteredInvestments}
                fgtsBalance={fgtsLatest}
                netWorth={netWorth}
              />
            </div>

            {/* Evolution chart */}
            <NetWorthEvolutionChart
              investments={filteredInvestments}
              transactions={filteredTransactions}
              fgtsRecords={filteredFgtsRecords}
              currentMonth={getCurrentMonthKey()}
            />
          </>
        )}
      </div>

      {/* Tab create/edit modal */}
      <Modal
        open={tabModal.open}
        onClose={closeModal}
        title={tabModal.editId ? 'Editar Aba' : 'Nova Aba de Patrimônio'}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Nome da aba</label>
            <input
              type="text"
              value={tabName}
              onChange={(e) => setTabName(e.target.value)}
              placeholder="Ex: Aposentadoria"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              autoFocus
            />
          </div>

          {investmentWorkspaces.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-600">Investimentos</label>
              <div className="space-y-1.5">
                {investmentWorkspaces.map((ws) => (
                  <label key={ws.id} className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={tabInvWsIds.includes(ws.id)}
                      onChange={() => toggleInvWs(ws.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{ws.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {fgtsWorkspaces.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-600">FGTS</label>
              <div className="space-y-1.5">
                {fgtsWorkspaces.map((ws) => (
                  <label key={ws.id} className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={tabFgtsWsIds.includes(ws.id)}
                      onChange={() => toggleFgtsWs(ws.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{ws.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {investmentWorkspaces.length === 0 && fgtsWorkspaces.length === 0 && (
            <p className="text-xs text-gray-400">Nenhum workspace de investimentos ou FGTS cadastrado.</p>
          )}

          {tabModal.editId && showDeleteConfirm && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="mb-2 text-sm text-red-700">Tem certeza que deseja excluir esta aba?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteTab}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                  Excluir
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            {tabModal.editId && !showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700"
              >
                <Trash2 size={13} />
                Excluir aba
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTab}
                disabled={!tabName.trim()}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
