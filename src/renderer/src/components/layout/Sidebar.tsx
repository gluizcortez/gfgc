import { clsx } from 'clsx'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  Receipt,
  TrendingUp,
  Target,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Wallet,
  DollarSign,
  HelpCircle
} from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import type { AppSection } from '@/types/models'

const NAV_ITEMS: { section: AppSection; label: string; icon: typeof Receipt; description: string }[] = [
  { section: 'dashboard', label: 'Painel', icon: LayoutDashboard, description: 'Visão geral da sua situação financeira' },
  { section: 'income', label: 'Receitas', icon: DollarSign, description: 'Registre suas fontes de renda e receitas' },
  { section: 'bills', label: 'Contas Mensais', icon: Receipt, description: 'Gerencie suas contas e despesas do mês' },
  { section: 'investments', label: 'Investimentos', icon: TrendingUp, description: 'Acompanhe seus investimentos e rendimentos' },
  { section: 'fgts', label: 'FGTS', icon: Landmark, description: 'Registre e acompanhe seu saldo de FGTS' },
  { section: 'goals', label: 'Metas', icon: Target, description: 'Defina e monitore suas metas financeiras' },
  { section: 'networth', label: 'Patrimônio', icon: Wallet, description: 'Acompanhe a evolução do seu patrimônio' },
  { section: 'settings', label: 'Configurações', icon: Settings, description: 'Personalize o aplicativo' },
  { section: 'help', label: 'Como Usar', icon: HelpCircle, description: 'Guia completo de todas as funcionalidades' }
]

export function Sidebar(): React.JSX.Element {
  const activeSection = useUIStore((s) => s.activeSection)
  const setActiveSection = useUIStore((s) => s.setActiveSection)
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <aside
      className={clsx(
        'flex flex-col border-r border-gray-200 bg-white transition-all duration-200',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        {!collapsed && (
          <span className="text-lg font-bold text-primary-600">GFGC</span>
        )}
        <button
          onClick={toggleSidebar}
          className={clsx(
            'rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600',
            collapsed ? 'mx-auto' : 'ml-auto'
          )}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map(({ section, label, icon: Icon, description }) => (
          <Tooltip.Root key={section} delayDuration={400}>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => setActiveSection(section)}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  activeSection === section
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                sideOffset={8}
                className="z-50 max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg"
              >
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
                <Tooltip.Arrow className="fill-white" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3">
        {!collapsed && (
          <p className="text-center text-xs text-gray-400">
            Gestão Financeira
          </p>
        )}
      </div>
    </aside>
  )
}
