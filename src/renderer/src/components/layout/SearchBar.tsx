import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Search,
  Receipt,
  TrendingUp,
  Landmark,
  Target,
  LayoutDashboard,
  Wallet,
  Settings,
  HelpCircle,
  DollarSign,
  Plus,
  Download,
  Upload
} from 'lucide-react'
import { clsx } from 'clsx'
import { useUIStore } from '@/stores/useUIStore'
import { useBillsStore } from '@/stores/useBillsStore'
import { useInvestmentsStore } from '@/stores/useInvestmentsStore'
import { useGoalsStore } from '@/stores/useGoalsStore'
import { useIncomeStore } from '@/stores/useIncomeStore'
import type { AppSection } from '@/types/models'

interface SearchItem {
  id: string
  label: string
  description: string
  icon: typeof Search
  group: string
  section?: AppSection
  action?: () => void
}

function getStaticItems(
  setActiveSection: (s: AppSection) => void,
  openModal: (m: string) => void
): SearchItem[] {
  return [
    { id: 'nav-dashboard', label: 'Painel', description: 'Visão geral da sua situação financeira', icon: LayoutDashboard, group: 'Navegação', section: 'dashboard' },
    { id: 'nav-bills', label: 'Contas Mensais', description: 'Gerencie suas contas e despesas do mês', icon: Receipt, group: 'Navegação', section: 'bills' },
    { id: 'nav-investments', label: 'Investimentos', description: 'Acompanhe seus investimentos e rendimentos', icon: TrendingUp, group: 'Navegação', section: 'investments' },
    { id: 'nav-fgts', label: 'FGTS', description: 'Registre e acompanhe seu saldo de FGTS', icon: Landmark, group: 'Navegação', section: 'fgts' },
    { id: 'nav-goals', label: 'Metas', description: 'Defina e monitore suas metas financeiras', icon: Target, group: 'Navegação', section: 'goals' },
    { id: 'nav-networth', label: 'Patrimônio', description: 'Acompanhe a evolução do seu patrimônio', icon: Wallet, group: 'Navegação', section: 'networth' },
    { id: 'nav-settings', label: 'Configurações', description: 'Personalize o aplicativo', icon: Settings, group: 'Navegação', section: 'settings' },
    { id: 'nav-income', label: 'Receitas', description: 'Registre suas fontes de renda e receitas', icon: DollarSign, group: 'Navegação', section: 'income' },
    { id: 'nav-help', label: 'Como Usar', description: 'Guia completo de todas as funcionalidades', icon: HelpCircle, group: 'Navegação', section: 'help' },
    { id: 'action-add-income', label: 'Nova Receita', description: 'Registrar uma nova receita', icon: Plus, group: 'Ações', action: () => setActiveSection('income') },
    { id: 'action-add-bill', label: 'Adicionar Conta', description: 'Criar uma nova conta mensal', icon: Plus, group: 'Ações', action: () => { setActiveSection('bills'); setTimeout(() => openModal('billForm'), 100) } },
    { id: 'action-add-investment', label: 'Novo Investimento', description: 'Registrar um novo investimento', icon: Plus, group: 'Ações', action: () => { setActiveSection('investments'); setTimeout(() => openModal('investmentForm'), 100) } },
    { id: 'action-add-goal', label: 'Criar Meta', description: 'Definir uma nova meta financeira', icon: Plus, group: 'Ações', action: () => { setActiveSection('goals'); setTimeout(() => openModal('goalForm'), 100) } },
    { id: 'action-add-fgts', label: 'Registrar FGTS', description: 'Adicionar registro de FGTS', icon: Plus, group: 'Ações', action: () => { setActiveSection('fgts'); setTimeout(() => openModal('fgtsForm'), 100) } },
    { id: 'action-export', label: 'Exportar Dados', description: 'Exportar seus dados para backup', icon: Download, group: 'Ações', action: () => setActiveSection('settings') },
    { id: 'action-import', label: 'Importar Dados', description: 'Importar dados de um arquivo', icon: Upload, group: 'Ações', action: () => setActiveSection('settings') }
  ]
}

const MAX_PER_GROUP = 5

export function SearchBar(): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const setActiveSection = useUIStore((s) => s.setActiveSection)
  const openModal = useUIStore((s) => s.openModal)

  // Data stores
  const monthlyRecords = useBillsStore((s) => s.monthlyRecords)
  const investments = useInvestmentsStore((s) => s.investments)
  const goals = useGoalsStore((s) => s.goals)
  const incomeEntries = useIncomeStore((s) => s.entries)

  const staticItems = useMemo(() => getStaticItems(setActiveSection, openModal), [setActiveSection, openModal])

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()

    // Filter static items
    const staticFiltered = staticItems.filter(
      (item) => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    )

    // Dynamic: Bills (deduplicate by name)
    const billNames = new Set<string>()
    const billItems: SearchItem[] = []
    for (const record of monthlyRecords) {
      for (const bill of record.bills) {
        if (bill.name.toLowerCase().includes(q) && !billNames.has(bill.name)) {
          billNames.add(bill.name)
          billItems.push({
            id: `bill-${bill.name}`,
            label: bill.name,
            description: 'Conta mensal',
            icon: Receipt,
            group: 'Contas',
            action: () => setActiveSection('bills')
          })
        }
      }
    }

    // Dynamic: Investments
    const investItems: SearchItem[] = investments
      .filter((i) => i.name.toLowerCase().includes(q))
      .map((i) => ({
        id: `invest-${i.id}`,
        label: i.name,
        description: i.isActive ? 'Investimento ativo' : 'Investimento inativo',
        icon: TrendingUp,
        group: 'Investimentos',
        action: () => setActiveSection('investments')
      }))

    // Dynamic: Goals
    const goalItems: SearchItem[] = goals
      .filter((g) => g.name.toLowerCase().includes(q))
      .map((g) => ({
        id: `goal-${g.id}`,
        label: g.name,
        description: g.isActive ? 'Meta ativa' : 'Meta pausada',
        icon: Target,
        group: 'Metas',
        action: () => setActiveSection('goals')
      }))

    // Dynamic: Income (deduplicate by name)
    const incomeNames = new Set<string>()
    const incomeItems: SearchItem[] = []
    for (const entry of incomeEntries) {
      if (entry.name.toLowerCase().includes(q) && !incomeNames.has(entry.name)) {
        incomeNames.add(entry.name)
        incomeItems.push({
          id: `income-${entry.name}`,
          label: entry.name,
          description: 'Receita',
          icon: DollarSign,
          group: 'Receitas',
          action: () => setActiveSection('income')
        })
      }
    }

    // Combine with limits per group
    return [
      ...staticFiltered.filter((i) => i.group === 'Navegação').slice(0, MAX_PER_GROUP),
      ...staticFiltered.filter((i) => i.group === 'Ações').slice(0, MAX_PER_GROUP),
      ...billItems.slice(0, MAX_PER_GROUP),
      ...investItems.slice(0, MAX_PER_GROUP),
      ...goalItems.slice(0, MAX_PER_GROUP),
      ...incomeItems.slice(0, MAX_PER_GROUP)
    ]
  }, [query, staticItems, monthlyRecords, investments, goals, incomeEntries, setActiveSection])

  useEffect(() => {
    setSelectedIndex(0)
  }, [filtered.length])

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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

  const executeItem = (item: SearchItem): void => {
    if (item.section) {
      setActiveSection(item.section)
    }
    if (item.action) {
      item.action()
    }
    setQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
      inputRef.current?.blur()
      return
    }
    if (!filtered.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => (i + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      executeItem(filtered[selectedIndex])
    }
  }

  // Group items for rendering
  const groups = useMemo(() => {
    const map = new Map<string, SearchItem[]>()
    for (const item of filtered) {
      const list = map.get(item.group) || []
      list.push(item)
      map.set(item.group, list)
    }
    return Array.from(map.entries())
  }, [filtered])

  // Flat index tracking for keyboard nav
  let flatIndex = -1

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-md">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Pesquisar... (⌘K)"
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
        />
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {groups.map(([groupName, groupItems], groupIdx) => (
            <div key={groupName}>
              {groupIdx > 0 && <div className="mx-3 my-1 border-t border-gray-100" />}
              <div className="px-3 pb-1 pt-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{groupName}</span>
              </div>
              {groupItems.map((item) => {
                flatIndex++
                const currentIdx = flatIndex
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => executeItem(item)}
                    onMouseEnter={() => setSelectedIndex(currentIdx)}
                    className={clsx(
                      'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                      currentIdx === selectedIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Icon size={16} className="shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="truncate text-xs text-gray-400">{item.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
