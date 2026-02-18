import { useState, useMemo } from 'react'
import { Plus, TrendingUp, Minus, Calculator } from 'lucide-react'
import { SimpleTooltip } from '@/components/shared/SimpleTooltip'
import { TabBar } from '@/components/layout/TabBar'
import { InvestmentsList } from './InvestmentsList'
import { TransactionHistory } from './TransactionHistory'
import { InvestmentFormModal } from './InvestmentFormModal'
import { TransactionFormModal } from './TransactionFormModal'
import { InvestmentDetailModal } from './InvestmentDetailModal'
import { ProjectionSimulatorModal } from './ProjectionSimulatorModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useInvestmentsStore } from '@/stores/useInvestmentsStore'
import { useUIStore } from '@/stores/useUIStore'
import { formatCurrency } from '@/lib/formatters'
import type { Investment, InvestmentType, TransactionType } from '@/types/models'

type ViewTab = 'portfolio' | 'history'

export function InvestmentsPage(): React.JSX.Element {
  const allWorkspaces = useSettingsStore((s) => s.workspaces)
  const workspaces = useMemo(() => allWorkspaces.filter((w) => w.type === 'investments'), [allWorkspaces])
  const addWorkspace = useSettingsStore((s) => s.addWorkspace)
  const updateWorkspace = useSettingsStore((s) => s.updateWorkspace)
  const deleteWorkspaceSettings = useSettingsStore((s) => s.deleteWorkspace)
  const deleteWorkspaceData = useInvestmentsStore((s) => s.deleteWorkspaceData)

  const activeId = useUIStore((s) => s.activeInvestmentsWorkspaceId)
  const setActiveId = useUIStore((s) => s.setActiveInvestmentsWorkspace)
  const addNotification = useUIStore((s) => s.addNotification)

  const investments = useInvestmentsStore((s) => s.investments)
  const transactions = useInvestmentsStore((s) => s.transactions)
  const addInvestment = useInvestmentsStore((s) => s.addInvestment)
  const updateInvestment = useInvestmentsStore((s) => s.updateInvestment)
  const deleteInvestmentAction = useInvestmentsStore((s) => s.deleteInvestment)
  const addTransaction = useInvestmentsStore((s) => s.addTransaction)
  const deleteTransaction = useInvestmentsStore((s) => s.deleteTransaction)

  const [viewTab, setViewTab] = useState<ViewTab>('portfolio')
  const [showInvestmentForm, setShowInvestmentForm] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [transactionType, setTransactionType] = useState<TransactionType>('contribution')
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleteTransactionTarget, setDeleteTransactionTarget] = useState<string | null>(null)
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
  const [showProjection, setShowProjection] = useState(false)

  const effectiveId = activeId || workspaces[0]?.id || null

  const wsInvestments = useMemo(
    () => investments.filter((i) => i.workspaceId === effectiveId && i.isActive),
    [investments, effectiveId]
  )

  const wsTransactions = useMemo(
    () => transactions.filter((t) => t.workspaceId === effectiveId).sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, effectiveId]
  )

  const totalBalance = useMemo(
    () => wsInvestments.reduce((sum, i) => sum + i.currentBalance, 0),
    [wsInvestments]
  )

  const handleCreateWorkspace = (name: string): void => {
    const id = addWorkspace(name, 'investments')
    setActiveId(id)
  }

  const handleDeleteWorkspace = (id: string): void => {
    deleteWorkspaceSettings(id)
    deleteWorkspaceData(id)
    if (effectiveId === id) {
      setActiveId(workspaces.find((w) => w.id !== id)?.id || null)
    }
  }

  const handleSaveInvestment = (data: { name: string; type: InvestmentType; notes: string }): void => {
    if (!effectiveId) return
    if (editingInvestment) {
      updateInvestment(editingInvestment.id, data)
      addNotification('Investimento atualizado', 'success')
    } else {
      addInvestment({ ...data, workspaceId: effectiveId })
      addNotification('Investimento criado', 'success')
    }
    setEditingInvestment(null)
  }

  const handleSaveTransaction = (data: { investmentId: string; amount: number; monthKey: string; notes: string }): void => {
    if (!effectiveId) return
    addTransaction({
      ...data,
      workspaceId: effectiveId,
      type: transactionType
    })
    const labels = { contribution: 'Aporte registrado', withdrawal: 'Retirada registrada', yield: 'Rendimento registrado' }
    addNotification(labels[transactionType], 'success')
  }

  const handleDeleteInvestment = (): void => {
    if (deleteTarget) {
      deleteInvestmentAction(deleteTarget)
      addNotification('Investimento removido', 'success')
      setDeleteTarget(null)
    }
  }

  const handleDeleteTransaction = (): void => {
    if (deleteTransactionTarget) {
      deleteTransaction(deleteTransactionTarget)
      addNotification('Movimentação removida', 'success')
      setDeleteTransactionTarget(null)
    }
  }

  if (workspaces.length === 0) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-xl font-bold text-gray-900">Investimentos</h1>
        <EmptyState
          icon={TrendingUp}
          title="Nenhuma aba criada"
          description="Crie uma aba para começar a acompanhar seus investimentos."
          action={{ label: 'Criar Primeira Aba', onClick: () => handleCreateWorkspace('Meus Investimentos') }}
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
            <p className="text-sm text-gray-500">Saldo Total</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBalance)}</p>
          </div>
          <div className="flex items-center gap-2">
            <SimpleTooltip label="Registrar um novo aporte em um investimento">
              <button
                onClick={() => { setTransactionType('contribution'); setShowTransactionForm(true) }}
                className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <Plus size={16} />
                Novo Aporte
              </button>
            </SimpleTooltip>
            <SimpleTooltip label="Registrar uma retirada de um investimento">
              <button
                onClick={() => { setTransactionType('withdrawal'); setShowTransactionForm(true) }}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Minus size={16} />
                Nova Retirada
              </button>
            </SimpleTooltip>
            <SimpleTooltip label="Registrar rendimento de um investimento">
              <button
                onClick={() => { setTransactionType('yield'); setShowTransactionForm(true) }}
                className="flex items-center gap-1.5 rounded-lg border border-amber-200 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50"
              >
                <TrendingUp size={16} />
                Rendimento
              </button>
            </SimpleTooltip>
            <SimpleTooltip label="Criar um novo investimento na carteira">
              <button
                onClick={() => { setEditingInvestment(null); setShowInvestmentForm(true) }}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <Plus size={16} />
                Novo Investimento
              </button>
            </SimpleTooltip>
            <SimpleTooltip label="Simular projeção de crescimento dos investimentos">
              <button
                onClick={() => setShowProjection(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <Calculator size={16} />
                Simulador
              </button>
            </SimpleTooltip>
          </div>
        </div>

        {/* View tabs */}
        <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setViewTab('portfolio')}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              viewTab === 'portfolio' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Carteira
          </button>
          <button
            onClick={() => setViewTab('history')}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              viewTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Histórico de Movimentações
          </button>
        </div>

        {viewTab === 'portfolio' ? (
          wsInvestments.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Nenhum investimento"
              description="Crie um investimento para começar a registrar aportes e retiradas."
              action={{ label: 'Criar Investimento', onClick: () => { setEditingInvestment(null); setShowInvestmentForm(true) } }}
            />
          ) : (
            <InvestmentsList
              investments={wsInvestments}
              transactions={transactions}
              onEdit={(inv) => { setEditingInvestment(inv); setShowInvestmentForm(true) }}
              onDelete={(id) => setDeleteTarget(id)}
              onView={(inv) => setSelectedInvestment(inv)}
            />
          )
        ) : (
          <TransactionHistory
            transactions={wsTransactions}
            investments={investments}
            onDelete={(id) => setDeleteTransactionTarget(id)}
          />
        )}
      </div>

      <InvestmentFormModal
        open={showInvestmentForm}
        onClose={() => { setShowInvestmentForm(false); setEditingInvestment(null) }}
        onSave={handleSaveInvestment}
        initialData={editingInvestment}
      />

      <TransactionFormModal
        open={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        onSave={handleSaveTransaction}
        type={transactionType}
        investments={wsInvestments}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteInvestment}
        title="Excluir Investimento"
        message="Tem certeza? Todas as movimentações deste investimento serão perdidas."
        confirmLabel="Excluir"
        danger
      />

      <ConfirmDialog
        open={!!deleteTransactionTarget}
        onClose={() => setDeleteTransactionTarget(null)}
        onConfirm={handleDeleteTransaction}
        title="Excluir Movimentação"
        message="Tem certeza que deseja excluir esta movimentação? O saldo do investimento será recalculado."
        confirmLabel="Excluir"
        danger
      />

      <InvestmentDetailModal
        open={!!selectedInvestment}
        onClose={() => setSelectedInvestment(null)}
        investment={selectedInvestment}
        transactions={transactions}
      />

      <ProjectionSimulatorModal
        open={showProjection}
        onClose={() => setShowProjection(false)}
      />
    </div>
  )
}
