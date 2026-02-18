import { useState, useMemo } from 'react'
import {
  Search,
  BookOpen,
  LayoutDashboard,
  Receipt,
  TrendingUp,
  Landmark,
  Target,
  Calendar,
  Wallet,
  Settings,
  Lightbulb,
  DollarSign,
  Info,
  ChevronRight
} from 'lucide-react'
import { clsx } from 'clsx'
import { HELP_SECTIONS } from './helpContent'
import type { HelpSection } from './helpContent'

const ICON_MAP: Record<string, typeof Search> = {
  info: Info,
  'layout-dashboard': LayoutDashboard,
  receipt: Receipt,
  'trending-up': TrendingUp,
  landmark: Landmark,
  target: Target,
  calendar: Calendar,
  wallet: Wallet,
  settings: Settings,
  lightbulb: Lightbulb,
  'dollar-sign': DollarSign
}

function renderMarkdown(text: string): React.JSX.Element {
  const lines = text.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (trimmed.startsWith('- **')) {
          const match = trimmed.match(/^- \*\*(.+?)\*\*:?\s*(.*)$/)
          if (match) {
            return (
              <div key={i} className="flex gap-2 pl-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                <p>
                  <strong className="text-gray-800">{match[1]}</strong>
                  {match[2] && <>: {match[2]}</>}
                </p>
              </div>
            )
          }
        }
        if (trimmed.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
              <p>{trimmed.slice(2)}</p>
            </div>
          )
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)\.\s(.*)$/)
          if (num) {
            return (
              <div key={i} className="flex gap-2 pl-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                  {num[1]}
                </span>
                <p>{renderInlineBold(num[2])}</p>
              </div>
            )
          }
        }
        if (trimmed === '') return <div key={i} className="h-2" />
        return <p key={i}>{renderInlineBold(trimmed)}</p>
      })}
    </div>
  )
}

function renderInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-gray-800">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export function HelpPage(): React.JSX.Element {
  const [activeTopicId, setActiveTopicId] = useState(HELP_SECTIONS[0].id)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return HELP_SECTIONS
    const q = searchQuery.toLowerCase()
    return HELP_SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.content.some(
          (b) => b.heading.toLowerCase().includes(q) || b.body.toLowerCase().includes(q)
        )
    )
  }, [searchQuery])

  const activeTopic: HelpSection | undefined =
    filteredSections.find((s) => s.id === activeTopicId) || filteredSections[0]

  return (
    <div className="flex h-full">
      {/* Sidebar / Índice */}
      <div className="flex w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-2 text-primary-700">
            <BookOpen size={20} />
            <h2 className="text-lg font-bold">Como Usar</h2>
          </div>
          <div className="relative mt-3">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tópico..."
              className="w-full rounded-md border border-gray-200 py-1.5 pl-8 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-auto p-2">
          {filteredSections.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-gray-400">
              Nenhum tópico encontrado.
            </p>
          )}
          {filteredSections.map((section) => {
            const Icon = ICON_MAP[section.icon] || Info
            const isActive = activeTopic?.id === section.id
            return (
              <button
                key={section.id}
                onClick={() => setActiveTopicId(section.id)}
                className={clsx(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-primary-50 font-medium text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1">{section.title}</span>
                {isActive && <ChevronRight size={14} className="shrink-0 text-primary-400" />}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-auto p-8">
        {activeTopic ? (
          <div className="mx-auto max-w-3xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{activeTopic.title}</h1>
              <p className="mt-1 text-gray-500">{activeTopic.summary}</p>
            </div>

            <div className="space-y-6">
              {activeTopic.content.map((block, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <h3 className="mb-3 text-sm font-semibold text-gray-800">
                    {block.heading}
                  </h3>
                  <div className="text-sm leading-relaxed text-gray-600">
                    {renderMarkdown(block.body)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-400">Selecione um tópico à esquerda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
