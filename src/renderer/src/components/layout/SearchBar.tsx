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
import type { AppSection } from '@/types/models'

interface SearchItem {
  id: string
  label: string
  description: string
  icon: typeof Search
  section?: AppSection
  action?: () => void
}

function getSearchItems(
  setActiveSection: (s: AppSection) => void,
  openModal: (m: string) => void
): SearchItem[] {
  return [
    { id: 'nav-dashboard', label: 'Painel', description: 'Visão geral da sua situação financeira', icon: LayoutDashboard, section: 'dashboard' },
    { id: 'nav-bills', label: 'Contas Mensais', description: 'Gerencie suas contas e despesas do mês', icon: Receipt, section: 'bills' },
    { id: 'nav-investments', label: 'Investimentos', description: 'Acompanhe seus investimentos e rendimentos', icon: TrendingUp, section: 'investments' },
    { id: 'nav-fgts', label: 'FGTS', description: 'Registre e acompanhe seu saldo de FGTS', icon: Landmark, section: 'fgts' },
    { id: 'nav-goals', label: 'Metas', description: 'Defina e monitore suas metas financeiras', icon: Target, section: 'goals' },
    { id: 'nav-networth', label: 'Patrimônio', description: 'Acompanhe a evolução do seu patrimônio', icon: Wallet, section: 'networth' },
    { id: 'nav-settings', label: 'Configurações', description: 'Personalize o aplicativo', icon: Settings, section: 'settings' },
    { id: 'nav-income', label: 'Receitas', description: 'Registre suas fontes de renda e receitas', icon: DollarSign, section: 'income' },
    { id: 'nav-help', label: 'Como Usar', description: 'Guia completo de todas as funcionalidades', icon: HelpCircle, section: 'help' },
    { id: 'action-add-income', label: 'Nova Receita', description: 'Registrar uma nova receita', icon: Plus, action: () => setActiveSection('income') },
    { id: 'action-add-bill', label: 'Adicionar Conta', description: 'Criar uma nova conta mensal', icon: Plus, action: () => { setActiveSection('bills'); setTimeout(() => openModal('billForm'), 100) } },
    { id: 'action-add-investment', label: 'Novo Investimento', description: 'Registrar um novo investimento', icon: Plus, action: () => { setActiveSection('investments'); setTimeout(() => openModal('investmentForm'), 100) } },
    { id: 'action-add-goal', label: 'Criar Meta', description: 'Definir uma nova meta financeira', icon: Plus, action: () => { setActiveSection('goals'); setTimeout(() => openModal('goalForm'), 100) } },
    { id: 'action-add-fgts', label: 'Registrar FGTS', description: 'Adicionar registro de FGTS', icon: Plus, action: () => { setActiveSection('fgts'); setTimeout(() => openModal('fgtsForm'), 100) } },
    { id: 'action-export', label: 'Exportar Dados', description: 'Exportar seus dados para backup', icon: Download, action: () => setActiveSection('settings') },
    { id: 'action-import', label: 'Importar Dados', description: 'Importar dados de um arquivo', icon: Upload, action: () => setActiveSection('settings') }
  ]
}

export function SearchBar(): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const setActiveSection = useUIStore((s) => s.setActiveSection)
  const openModal = useUIStore((s) => s.openModal)

  const items = useMemo(() => getSearchItems(setActiveSection, openModal), [setActiveSection, openModal])

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    )
  }, [query, items])

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
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {filtered.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => executeItem(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={clsx(
                  'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                  index === selectedIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon size={18} className="shrink-0 text-gray-400" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="truncate text-xs text-gray-400">{item.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
