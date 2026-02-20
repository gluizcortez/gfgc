import { useState, useEffect } from 'react'
import { Download, Upload, Sun, Moon, HardDrive, RefreshCw, Trash2, Loader2 } from 'lucide-react'
import { CategoriesManager } from './CategoriesManager'
import { WorkspaceManager } from './WorkspaceManager'
import { Modal } from '@/components/shared/Modal'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useUIStore } from '@/stores/useUIStore'
import { useBillsStore } from '@/stores/useBillsStore'
import { useInvestmentsStore } from '@/stores/useInvestmentsStore'
import { useGoalsStore } from '@/stores/useGoalsStore'
import { useFGTSStore } from '@/stores/useFGTSStore'
import { useIncomeStore } from '@/stores/useIncomeStore'
import { DEFAULT_CATEGORIES } from '@/lib/constants'
import type { AppData, AppSettings } from '@/types/models'
import type { UpdateAsset } from '../../../preload/index.d'

function collectAppData(): AppData {
  const { settings, workspaces } = useSettingsStore.getState()
  const { bills, monthlyRecords: monthlyBillRecords } = useBillsStore.getState()
  const { investments, transactions: investmentTransactions } = useInvestmentsStore.getState()
  const { goals } = useGoalsStore.getState()
  const { records: fgtsRecords } = useFGTSStore.getState()
  const { entries: incomeEntries } = useIncomeStore.getState()
  return { version: 1, settings, workspaces, bills, monthlyBillRecords, investments, investmentTransactions, goals, fgtsRecords, incomeEntries }
}

const CONFIRMATION_PHRASE = 'apagar a base de dados por completo'

type UpdateStatus = 'idle' | 'checking' | 'up_to_date' | 'update_available' | 'downloading' | 'downloaded' | 'error'

export function SettingsPage(): React.JSX.Element {
  const theme = useSettingsStore((s) => s.settings.theme)
  const updateTheme = useSettingsStore((s) => s.updateTheme)
  const backupEnabled = useSettingsStore((s) => s.settings.backupEnabled)
  const backupRetention = useSettingsStore((s) => s.settings.backupRetentionCount)
  const autoGenerate = useSettingsStore((s) => s.settings.autoGenerateRecurringBills)
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const addNotification = useUIStore((s) => s.addNotification)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetInput, setResetInput] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importConfirmOpen, setImportConfirmOpen] = useState(false)
  const [pendingImportData, setPendingImportData] = useState<AppData | null>(null)

  // Update state
  const [appVersion, setAppVersion] = useState('')
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle')
  const [latestVersion, setLatestVersion] = useState('')
  const [updateAssets, setUpdateAssets] = useState<UpdateAsset[]>([])
  const [updateError, setUpdateError] = useState('')

  const pendingUpdate = useUIStore((s) => s.pendingUpdate)

  useEffect(() => {
    window.api.getAppVersion().then((v) => setAppVersion(v))
  }, [])

  // Pre-populate from pendingUpdate if available
  useEffect(() => {
    if (pendingUpdate && updateStatus === 'idle') {
      setLatestVersion(pendingUpdate.version)
      setUpdateAssets(pendingUpdate.assets)
      setUpdateStatus('update_available')
    }
  }, [pendingUpdate])

  const handleCheckForUpdate = async (): Promise<void> => {
    setUpdateStatus('checking')
    setUpdateError('')
    try {
      const result = await window.api.checkForUpdate()
      setLatestVersion(result.latestVersion)
      setUpdateAssets(result.assets)
      if (result.hasUpdate) {
        setUpdateStatus('update_available')
      } else {
        setUpdateStatus('up_to_date')
      }
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Erro ao verificar atualizações')
      setUpdateStatus('error')
    }
  }

  const handleDownloadUpdate = async (asset: UpdateAsset): Promise<void> => {
    setUpdateStatus('downloading')
    try {
      const result = await window.api.downloadUpdate(asset.url, asset.name)
      if (result.success) {
        setUpdateStatus('downloaded')
        addNotification('Atualização baixada! A pasta do arquivo foi aberta.', 'success')
      } else {
        setUpdateError('Falha ao baixar a atualização')
        setUpdateStatus('error')
      }
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Erro ao baixar atualização')
      setUpdateStatus('error')
    }
  }

  const handleExport = async (): Promise<void> => {
    setIsExporting(true)
    try {
      const data = collectAppData()
      const result = await window.api.exportData(data)
      if (result.success) {
        addNotification('Dados exportados com sucesso', 'success')
      }
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (): Promise<void> => {
    setIsImporting(true)
    const result = await window.api.importData()
    if (result.success && result.data) {
      setPendingImportData(result.data as AppData)
      setImportConfirmOpen(true)
    }
    setIsImporting(false)
  }

  const confirmImport = (): void => {
    if (!pendingImportData) return
    const data = pendingImportData
    useSettingsStore.getState().hydrate(data.settings, data.workspaces)
    useBillsStore.getState().hydrate(data.bills || [], data.monthlyBillRecords || [])
    useInvestmentsStore.getState().hydrate(data.investments || [], data.investmentTransactions || [])
    useGoalsStore.getState().hydrate(data.goals || [])
    if (data.fgtsRecords) {
      useFGTSStore.getState().hydrate(data.fgtsRecords)
    }
    if (data.incomeEntries) {
      useIncomeStore.getState().hydrate(data.incomeEntries)
    }
    addNotification('Dados importados com sucesso', 'success')
    setPendingImportData(null)
    setImportConfirmOpen(false)
  }

  const handleResetDatabase = (): void => {
    if (resetInput.trim().toLowerCase() !== CONFIRMATION_PHRASE) return

    const defaultSettings: AppSettings = {
      currency: 'BRL',
      locale: 'pt-BR',
      theme: 'light',
      defaultView: 'dashboard',
      categories: DEFAULT_CATEGORIES,
      customFields: [],
      backupEnabled: true,
      backupRetentionCount: 10,
      autoGenerateRecurringBills: true
    }

    useSettingsStore.getState().hydrate(defaultSettings, [])
    useBillsStore.getState().hydrate([], [])
    useInvestmentsStore.getState().hydrate([], [])
    useGoalsStore.getState().hydrate([])
    useFGTSStore.getState().hydrate([])
    useIncomeStore.getState().hydrate([])

    setResetDialogOpen(false)
    setResetInput('')
    useUIStore.getState().setActiveSection('dashboard')
    addNotification('Base de dados apagada com sucesso', 'success')
  }

  const macAsset = updateAssets.find((a) => a.name.endsWith('.dmg'))
  const winAsset = updateAssets.find((a) => a.name.endsWith('.exe'))

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-bold text-gray-900">Configurações</h1>

      <div className="mx-auto max-w-3xl space-y-8">
        {/* Updates */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            <RefreshCw size={14} className="mr-1.5 inline" />
            Atualizações
          </h3>
          <div className="space-y-3">
            {appVersion && (
              <p className="text-xs text-gray-500">Versão atual: <span className="font-medium text-gray-700">v{appVersion}</span></p>
            )}

            {updateStatus === 'idle' && (
              <button
                onClick={handleCheckForUpdate}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <RefreshCw size={16} />
                Verificar Atualizações
              </button>
            )}

            {updateStatus === 'checking' && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                Verificando atualizações...
              </div>
            )}

            {updateStatus === 'up_to_date' && (
              <div className="space-y-2">
                <div className="rounded-lg bg-green-50 px-4 py-2.5">
                  <p className="text-sm font-medium text-green-700">Você está na versão mais recente (v{appVersion})</p>
                </div>
                <button
                  onClick={handleCheckForUpdate}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Verificar novamente
                </button>
              </div>
            )}

            {updateStatus === 'update_available' && (
              <div className="space-y-3">
                <div className="rounded-lg bg-blue-50 px-4 py-3">
                  <p className="text-sm font-medium text-blue-700">
                    Nova versão disponível: v{latestVersion}
                  </p>
                  <p className="mt-1 text-xs text-blue-500">
                    Sua versão: v{appVersion} → v{latestVersion}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {macAsset && (
                    <button
                      onClick={() => handleDownloadUpdate(macAsset)}
                      className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    >
                      <Download size={16} />
                      Baixar para macOS (.dmg)
                    </button>
                  )}
                  {winAsset && (
                    <button
                      onClick={() => handleDownloadUpdate(winAsset)}
                      className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    >
                      <Download size={16} />
                      Baixar para Windows (.exe)
                    </button>
                  )}
                </div>
              </div>
            )}

            {updateStatus === 'downloading' && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                Baixando atualização...
              </div>
            )}

            {updateStatus === 'downloaded' && (
              <div className="space-y-2">
                <div className="rounded-lg bg-green-50 px-4 py-2.5">
                  <p className="text-sm font-medium text-green-700">
                    Atualização baixada com sucesso!
                  </p>
                  <p className="mt-1 text-xs text-green-600">
                    A pasta contendo o instalador foi aberta. Execute o instalador para atualizar.
                  </p>
                </div>
                <button
                  onClick={() => setUpdateStatus('idle')}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Fechar
                </button>
              </div>
            )}

            {updateStatus === 'error' && (
              <div className="space-y-2">
                <div className="rounded-lg bg-red-50 px-4 py-2.5">
                  <p className="text-sm font-medium text-red-700">Erro ao verificar atualizações</p>
                  <p className="mt-1 text-xs text-red-500">{updateError}</p>
                </div>
                <button
                  onClick={handleCheckForUpdate}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Theme */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Aparência</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateTheme('light')}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                theme === 'light'
                  ? 'border-primary-300 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <Sun size={16} />
              Claro
            </button>
            <button
              onClick={() => updateTheme('dark')}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'border-primary-300 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <Moon size={16} />
              Escuro
            </button>
          </div>
        </div>

        {/* Backup */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            <HardDrive size={14} className="mr-1.5 inline" />
            Backup Automático
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={backupEnabled}
                onChange={(e) => updateSettings({ backupEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Realizar backup ao abrir o aplicativo</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Manter últimos</label>
              <input
                type="number"
                min={1}
                max={100}
                value={backupRetention}
                onChange={(e) => updateSettings({ backupRetentionCount: Math.min(100, Math.max(1, Number(e.target.value) || 1)) })}
                className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:border-primary-500 focus:outline-none"
              />
              <span className="text-sm text-gray-600">backups</span>
            </div>
          </div>
        </div>

        {/* Auto-generate */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            <RefreshCw size={14} className="mr-1.5 inline" />
            Contas Recorrentes
          </h3>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={autoGenerate}
              onChange={(e) => updateSettings({ autoGenerateRecurringBills: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Gerar contas recorrentes automaticamente ao navegar para um mês vazio</span>
          </label>
        </div>

        {/* Data Export/Import */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Dados</h3>
          <p className="mb-3 text-xs text-gray-500">
            Exporte seus dados para backup ou importe de um arquivo anterior.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {isExporting ? 'Exportando...' : 'Exportar Dados'}
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {isImporting ? 'Importando...' : 'Importar Dados'}
            </button>
          </div>
        </div>

        {/* Workspace Manager */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <WorkspaceManager />
        </div>

        {/* Categories Manager */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <CategoriesManager />
        </div>

        {/* Reset Database */}
        <div className="rounded-xl border border-red-200 bg-white p-5">
          <h3 className="mb-1 text-sm font-semibold text-red-700">
            <Trash2 size={14} className="mr-1.5 inline" />
            Zona de Perigo
          </h3>
          <p className="mb-3 text-xs text-gray-500">
            Esta ação é irreversível. Todos os seus dados serão apagados permanentemente.
          </p>
          <button
            onClick={() => setResetDialogOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
            Apagar Base de Dados
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Modal
        open={resetDialogOpen}
        onClose={() => { setResetDialogOpen(false); setResetInput('') }}
        title="Apagar Base de Dados"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-sm font-medium text-red-800">
              Atenção: esta ação é irreversível!
            </p>
            <p className="mt-1 text-xs text-red-600">
              Todos os seus dados (contas, investimentos, FGTS, metas, workspaces e categorias personalizadas) serão apagados permanentemente. O aplicativo voltará ao estado de fábrica.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-gray-700">
              Para confirmar, digite: <strong className="select-all text-red-600">{CONFIRMATION_PHRASE}</strong>
            </label>
            <input
              type="text"
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value)}
              placeholder="Digite a frase de confirmação"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
              autoComplete="off"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setResetDialogOpen(false); setResetInput('') }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleResetDatabase}
              disabled={resetInput.trim().toLowerCase() !== CONFIRMATION_PHRASE}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Apagar
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Confirmation Dialog */}
      <Modal
        open={importConfirmOpen}
        onClose={() => { setImportConfirmOpen(false); setPendingImportData(null) }}
        title="Confirmar Importação"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-amber-50 p-3">
            <p className="text-sm font-medium text-amber-800">
              Atenção: seus dados atuais serão substituídos!
            </p>
            <p className="mt-1 text-xs text-amber-600">
              Ao confirmar, todos os dados atuais (contas, investimentos, metas, receitas, FGTS e configurações) serão sobrescritos pelos dados do arquivo importado.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setImportConfirmOpen(false); setPendingImportData(null) }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={confirmImport}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Importar e Substituir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
