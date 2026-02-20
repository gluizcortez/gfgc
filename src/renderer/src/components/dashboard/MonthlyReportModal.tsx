import { useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Printer } from 'lucide-react'
import { useBillsStore } from '@/stores/useBillsStore'
import { useInvestmentsStore } from '@/stores/useInvestmentsStore'
import { useGoalsStore } from '@/stores/useGoalsStore'
import { useFGTSStore } from '@/stores/useFGTSStore'
import { useIncomeStore } from '@/stores/useIncomeStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { getEffectiveStatus } from '@/lib/billStatus'
import { formatMonthYear } from '@/lib/formatters'
import { BILL_STATUS_LABELS, PERIODICITY_LABELS } from '@/lib/constants'
import { INCOME_CATEGORY_LABELS } from '@/types/models'
import type { BillEntry, Category } from '@/types/models'

interface MonthlyReportModalProps {
  open: boolean
  onClose: () => void
  monthKey: string
}

function fmt(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string): string {
  const parts = iso.split('T')[0].split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return iso
}

function statusLabel(bill: BillEntry): string {
  const effective = getEffectiveStatus(bill)
  return BILL_STATUS_LABELS[effective] || effective
}

export function MonthlyReportModal({ open, onClose, monthKey }: MonthlyReportModalProps): React.JSX.Element {
  const billRecords = useBillsStore((s) => s.monthlyRecords)
  const investments = useInvestmentsStore((s) => s.investments)
  const transactions = useInvestmentsStore((s) => s.transactions)
  const goals = useGoalsStore((s) => s.goals)
  const fgtsRecords = useFGTSStore((s) => s.records)
  const incomeEntries = useIncomeStore((s) => s.entries)
  const categories = useSettingsStore((s) => s.settings.categories)

  const monthBills = useMemo(
    () => billRecords.filter((r) => r.monthKey === monthKey).flatMap((r) => r.bills),
    [billRecords, monthKey]
  )

  const monthIncome = useMemo(
    () => incomeEntries.filter((e) => e.monthKey === monthKey),
    [incomeEntries, monthKey]
  )

  const monthTx = useMemo(
    () => transactions.filter((t) => t.monthKey === monthKey),
    [transactions, monthKey]
  )

  const totalExpenses = monthBills.reduce((s, b) => s + b.value, 0)
  const totalPaid = monthBills.filter((b) => getEffectiveStatus(b) === 'paid').reduce((s, b) => s + b.value, 0)
  const totalPending = totalExpenses - totalPaid
  const totalIncome = monthIncome.reduce((s, e) => s + e.amount, 0)
  const balance = totalIncome - totalExpenses

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    for (const bill of monthBills) {
      map.set(bill.categoryId, (map.get(bill.categoryId) || 0) + bill.value)
    }
    return Array.from(map.entries())
      .map(([catId, total]) => {
        const cat = categories.find((c) => c.id === catId)
        return { name: cat?.name || 'Sem categoria', total, pct: totalExpenses > 0 ? (total / totalExpenses * 100) : 0 }
      })
      .sort((a, b) => b.total - a.total)
  }, [monthBills, categories, totalExpenses])

  const contributions = monthTx.filter((t) => t.type === 'contribution').reduce((s, t) => s + t.amount, 0)
  const withdrawals = monthTx.filter((t) => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0)
  const yields = monthTx.filter((t) => t.type === 'yield').reduce((s, t) => s + t.amount, 0)
  const totalBalance = investments.filter((i) => i.isActive).reduce((s, i) => s + i.currentBalance, 0)

  const activeGoals = goals.filter((g) => g.isActive)

  const latestFGTS = useMemo(() => {
    const sorted = [...fgtsRecords].sort((a, b) => b.monthKey.localeCompare(a.monthKey))
    return sorted[0] || null
  }, [fgtsRecords])

  const buildHTML = (): string => {
    const title = `GFGC — Relatório Mensal — ${formatMonthYear(monthKey)}`

    const billRows = monthBills
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .map((b) => {
        const cat = categories.find((c) => c.id === b.categoryId)
        return `<tr>
          <td>${b.name}</td>
          <td>${cat?.name || '-'}</td>
          <td style="text-align:right">${fmt(b.value)}</td>
          <td style="text-align:center">${fmtDate(b.dueDate)}</td>
          <td style="text-align:center">${statusLabel(b)}</td>
        </tr>`
      })
      .join('')

    const catRows = categoryBreakdown
      .map((c) => `<tr><td>${c.name}</td><td style="text-align:right">${fmt(c.total)}</td><td style="text-align:right">${c.pct.toFixed(1)}%</td></tr>`)
      .join('')

    const incomeRows = monthIncome
      .map((e) => `<tr><td>${e.name}</td><td>${INCOME_CATEGORY_LABELS[e.category]}</td><td style="text-align:right">${fmt(e.amount)}</td></tr>`)
      .join('')

    const goalRows = activeGoals
      .map((g) => {
        const totalContrib = g.contributions.reduce((s, c) => s + c.actualAmount, 0)
        const periods = new Set(g.contributions.map((c) => c.periodKey)).size
        return `<tr>
          <td>${g.name}</td>
          <td>${PERIODICITY_LABELS[g.periodicity]}</td>
          <td style="text-align:right">${fmt(g.targetAmount)}/per.</td>
          <td style="text-align:right">${fmt(totalContrib)}</td>
          <td style="text-align:center">${periods}</td>
        </tr>`
      })
      .join('')

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; padding: 40px; font-size: 13px; line-height: 1.5; }
    h1 { font-size: 20px; margin-bottom: 4px; color: #111; }
    .subtitle { color: #666; font-size: 13px; margin-bottom: 28px; }
    h2 { font-size: 15px; color: #333; margin: 24px 0 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e5e5; }
    .summary { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
    .summary-card { flex: 1; min-width: 140px; padding: 14px; border-radius: 8px; background: #f8f8f8; border: 1px solid #e5e5e5; }
    .summary-card .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-card .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
    .positive { color: #059669; }
    .negative { color: #dc2626; }
    .neutral { color: #1a1a1a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { text-align: left; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 10px; border-bottom: 2px solid #e5e5e5; }
    td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
    tr:last-child td { border-bottom: none; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #999; text-align: center; }
    @media print {
      body { padding: 20px; }
      .summary-card { break-inside: avoid; }
      table { break-inside: auto; }
      tr { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="subtitle">Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>

  <div class="summary">
    <div class="summary-card">
      <div class="label">Receitas</div>
      <div class="value positive">${fmt(totalIncome)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Despesas</div>
      <div class="value negative">${fmt(totalExpenses)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Saldo</div>
      <div class="value ${balance >= 0 ? 'positive' : 'negative'}">${fmt(balance)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Pago</div>
      <div class="value neutral">${fmt(totalPaid)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Pendente</div>
      <div class="value ${totalPending > 0 ? 'negative' : 'neutral'}">${fmt(totalPending)}</div>
    </div>
  </div>

  ${monthIncome.length > 0 ? `
  <h2>Receitas</h2>
  <table>
    <thead><tr><th>Nome</th><th>Categoria</th><th style="text-align:right">Valor</th></tr></thead>
    <tbody>${incomeRows}</tbody>
    <tfoot><tr><td colspan="2" style="font-weight:700">Total</td><td style="text-align:right;font-weight:700">${fmt(totalIncome)}</td></tr></tfoot>
  </table>` : ''}

  ${categoryBreakdown.length > 0 ? `
  <h2>Despesas por Categoria</h2>
  <table>
    <thead><tr><th>Categoria</th><th style="text-align:right">Valor</th><th style="text-align:right">%</th></tr></thead>
    <tbody>${catRows}</tbody>
    <tfoot><tr><td style="font-weight:700">Total</td><td style="text-align:right;font-weight:700">${fmt(totalExpenses)}</td><td style="text-align:right;font-weight:700">100%</td></tr></tfoot>
  </table>` : ''}

  ${monthBills.length > 0 ? `
  <h2>Contas do Mês</h2>
  <table>
    <thead><tr><th>Nome</th><th>Categoria</th><th style="text-align:right">Valor</th><th style="text-align:center">Vencimento</th><th style="text-align:center">Status</th></tr></thead>
    <tbody>${billRows}</tbody>
  </table>` : ''}

  <h2>Investimentos</h2>
  <div class="summary">
    <div class="summary-card">
      <div class="label">Saldo Total</div>
      <div class="value neutral">${fmt(totalBalance)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Aportes (mês)</div>
      <div class="value positive">${fmt(contributions)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Resgates (mês)</div>
      <div class="value negative">${fmt(withdrawals)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Rendimentos (mês)</div>
      <div class="value positive">${fmt(yields)}</div>
    </div>
  </div>

  ${activeGoals.length > 0 ? `
  <h2>Metas Ativas</h2>
  <table>
    <thead><tr><th>Meta</th><th>Periodicidade</th><th style="text-align:right">Alvo</th><th style="text-align:right">Total Contribuído</th><th style="text-align:center">Períodos</th></tr></thead>
    <tbody>${goalRows}</tbody>
  </table>` : ''}

  ${latestFGTS ? `
  <h2>FGTS</h2>
  <div class="summary">
    <div class="summary-card">
      <div class="label">Saldo Mais Recente (${formatMonthYear(latestFGTS.monthKey)})</div>
      <div class="value neutral">${fmt(latestFGTS.balance)}</div>
    </div>
  </div>` : ''}

  <div class="footer">GFGC — Gestão Financeira Gabriel &amp; Carol</div>
</body>
</html>`
  }

  const handlePrint = (): void => {
    const html = buildHTML()
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[700px] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl bg-white p-6 shadow-xl focus:outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-gray-900">
              Relatório Mensal — {formatMonthYear(monthKey)}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-md p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Preview */}
          <div className="space-y-4 text-sm text-gray-700">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-xs text-green-600">Receitas</p>
                <p className="text-base font-bold text-green-700">{fmt(totalIncome)}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-xs text-red-600">Despesas</p>
                <p className="text-base font-bold text-red-700">{fmt(totalExpenses)}</p>
              </div>
              <div className={`rounded-lg p-3 ${balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-xs ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>Saldo</p>
                <p className={`text-base font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(balance)}</p>
              </div>
            </div>

            {/* Category breakdown */}
            {categoryBreakdown.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase">Despesas por Categoria</h3>
                <div className="space-y-1.5">
                  {categoryBreakdown.map((c) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <span>{c.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{c.pct.toFixed(1)}%</span>
                        <span className="font-medium">{fmt(c.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Investments */}
            <div>
              <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase">Investimentos</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-gray-50 p-2">
                  <span className="text-gray-400">Saldo Total:</span>{' '}
                  <span className="font-semibold">{fmt(totalBalance)}</span>
                </div>
                <div className="rounded-md bg-gray-50 p-2">
                  <span className="text-gray-400">Aportes:</span>{' '}
                  <span className="font-semibold text-green-600">{fmt(contributions)}</span>
                </div>
                <div className="rounded-md bg-gray-50 p-2">
                  <span className="text-gray-400">Resgates:</span>{' '}
                  <span className="font-semibold text-red-600">{fmt(withdrawals)}</span>
                </div>
                <div className="rounded-md bg-gray-50 p-2">
                  <span className="text-gray-400">Rendimentos:</span>{' '}
                  <span className="font-semibold text-green-600">{fmt(yields)}</span>
                </div>
              </div>
            </div>

            {/* Goals */}
            {activeGoals.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase">Metas Ativas ({activeGoals.length})</h3>
                <div className="space-y-1">
                  {activeGoals.map((g) => (
                    <div key={g.id} className="flex items-center justify-between text-xs">
                      <span>{g.name}</span>
                      <span className="text-gray-400">{fmt(g.targetAmount)}/{PERIODICITY_LABELS[g.periodicity]?.toLowerCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FGTS */}
            {latestFGTS && (
              <div>
                <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase">FGTS</h3>
                <p className="text-xs text-gray-500">
                  Saldo mais recente ({formatMonthYear(latestFGTS.monthKey)}):{' '}
                  <span className="font-semibold text-gray-700">{fmt(latestFGTS.balance)}</span>
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Fechar
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              <Printer size={16} />
              Imprimir / Salvar PDF
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
