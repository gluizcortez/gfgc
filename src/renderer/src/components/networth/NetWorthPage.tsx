import { useMemo, useState, useEffect } from 'react'
import { Wallet, Pencil, Plus, X } from 'lucide-react'
import { clsx } from 'clsx'
import { NetWorthEvolutionChart } from './NetWorthEvolutionChart'
import { AssetBreakdownCards } from './AssetBreakdownCards'
import { EmptyState } from '@/components/shared/EmptyState'
import { Modal } from '@/components/shared/Modal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
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

  const [activeTabId, setActiveTabId] = useState<string>('')
  const [tabModal, setTabModal] = useState<TabModalState>({ open: false, editId: null })
  const [tabName, setTabName] = useState('')
  const [tabInvWsIds, setTabInvWsIds] = useState<EntityId[]>([])
  const [tabFgtsWsIds, setTabFgtsWsIds] = useState<EntityId[]>([])
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // Default to first tab on load; reset when active tab is deleted
  useEffect(() => {
    if (!activeTabId || !customTabs.find((t) => t.id === activeTabId)) {
      setActiveTabId(customTabs[0]?.id || '')
    }
  }, [customTabs, activeTabId])

  const openCreateModal = (): void => {
    setTabName('')
    setTabInvWsIds([])
    setTabFgtsWsIds([])
    setTabModal({ open: true, editId: null })
  }

  const openEditModal = (id: string): void => {
    const tab = customTabs.find((t) => t.id === id)
    if (!tab) return
    setTabName(tab.name)
    setTabInvWsIds([...tab.investmentWorkspaceIds])
    setTabFgtsWsIds([...tab.fgtsWorkspaceIds])
    setTabModal({ open: true, editId: id })
  }

  const closeModal = (): void => {
    setTabModal({ open: false, editId: null })
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

  const handleConfirmDelete = (): void => {
    if (!deleteTarget) return
    deleteTab(deleteTarget)
    setDeleteTarget(null)
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
    if (!activeCustomTab) return []
    return active.filter((i) => activeCustomTab.investmentWorkspaceIds.includes(i.workspaceId))
  }, [investments, activeCustomTab])

  const filteredTransactions = useMemo(() => {
    if (!activeCustomTab) return []
    return transactions.filter((t) => activeCustomTab.investmentWorkspaceIds.includes(t.workspaceId))
  }, [transactions, activeCustomTab])

  const filteredFgtsRecords = useMemo(() => {
    if (!activeCustomTab) return []
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

  const deleteTargetName = deleteTarget
    ? customTabs.find((t) => t.id === deleteTarget)?.name ?? 'esta aba'
    : ''

  // No custom tabs yet — show empty state even if there's data
  if (customTabs.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-4 pt-2">
          <SimpleTooltip label="Criar nova aba de patrimônio">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1 rounded-t-lg px-2 py-1.5 text-sm text-gray-400 hover:text-gray-600"
            >
              <Plus size={16} />
            </button>
          </SimpleTooltip>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <h1 className="mb-6 text-xl font-bold text-gray-900">Patrimônio</h1>
          <EmptyState
            icon={Wallet}
            title="Nenhuma aba criada"
            description="Crie uma aba selecionando quais carteiras de investimentos e FGTS deseja acompanhar."
            action={{ label: 'Criar Primeira Aba', onClick: openCreateModal }}
          />
        </div>

        {/* Create modal */}
        <Modal open={tabModal.open} onClose={closeModal} title="Nova Aba de Patrimônio">
          {renderTabModalContent()}
        </Modal>
      </div>
    )
  }

  function renderTabModalContent(): React.JSX.Element {
    return (
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

        <div className="flex justify-end gap-2 pt-1">
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
    )
  }

  const hasTabData = filteredInvestments.length > 0 || filteredFgtsRecords.length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar — same style as TabBar component */}
      <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-4 pt-2">
        {customTabs.map((tab) => (
          <div
            key={tab.id}
            className={clsx(
              'group relative flex items-center gap-1.5 rounded-t-lg border border-b-0 px-3 py-1.5 text-sm font-medium transition-colors',
              activeTabId === tab.id
                ? 'border-gray-200 bg-gray-50 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-100 hover:bg-gray-50 hover:text-gray-700'
            )}
          >
            <button onClick={() => setActiveTabId(tab.id)} className="whitespace-nowrap">
              {tab.name}
            </button>

            {activeTabId === tab.id && (
              <div className="ml-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <SimpleTooltip label="Editar aba">
                  <button
                    onClick={() => openEditModal(tab.id)}
                    className="rounded p-0.5 text-gray-400 hover:text-gray-600"
                  >
                    <Pencil size={12} />
                  </button>
                </SimpleTooltip>
                <SimpleTooltip label="Excluir aba">
                  <button
                    onClick={() => setDeleteTarget(tab.id)}
                    className="rounded p-0.5 text-gray-400 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </SimpleTooltip>
              </div>
            )}
          </div>
        ))}

        <SimpleTooltip label="Criar nova aba de patrimônio">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1 rounded-t-lg px-2 py-1.5 text-sm text-gray-400 hover:text-gray-600"
          >
            <Plus size={16} />
          </button>
        </SimpleTooltip>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Patrimônio</h1>
          <p className="mt-1 text-xs text-gray-400">
            O cálculo de patrimônio considera apenas investimentos e FGTS. Metas financeiras não são incluídas.
          </p>
        </div>

        {!hasAnyData ? (
          <EmptyState
            icon={Wallet}
            title="Sem dados patrimoniais"
            description="Registre investimentos ou saldo do FGTS para acompanhar seu patrimônio."
          />
        ) : !hasTabData ? (
          <EmptyState
            icon={Wallet}
            title="Sem dados nesta aba"
            description="Nenhum investimento ou FGTS está vinculado a esta aba. Edite a aba para adicionar."
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
        {renderTabModalContent()}
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Aba"
        message={`Tem certeza que deseja excluir "${deleteTargetName}"?`}
        confirmLabel="Excluir"
        danger
      />
    </div>
  )
}
