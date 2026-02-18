import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { Modal } from '@/components/shared/Modal'
import { formatCurrency, formatMonthYear, formatDate } from '@/lib/formatters'
import { INVESTMENT_TYPE_LABELS } from '@/types/models'
import { ArrowUpCircle, ArrowDownCircle, TrendingUp } from 'lucide-react'
import type { Investment, InvestmentTransaction } from '@/types/models'

interface InvestmentDetailModalProps {
  open: boolean
  onClose: () => void
  investment: Investment | null
  transactions: InvestmentTransaction[]
}

interface MonthData {
  month: string
  aportes: number
  retiradas: number
  rendimentos: number
  saldoAcumulado: number
}

export function InvestmentDetailModal({
  open,
  onClose,
  investment,
  transactions
}: InvestmentDetailModalProps): React.JSX.Element {
  const invTransactions = useMemo(() => {
    if (!investment) return []
    return transactions
      .filter((t) => t.investmentId === investment.id)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [investment, transactions])

  const monthlyData = useMemo((): MonthData[] => {
    if (invTransactions.length === 0) return []

    const months = new Map<string, { contributions: number; withdrawals: number; yields: number }>()
    for (const tx of invTransactions) {
      const existing = months.get(tx.monthKey) || { contributions: 0, withdrawals: 0, yields: 0 }
      if (tx.type === 'contribution') {
        existing.contributions += tx.amount
      } else if (tx.type === 'yield') {
        existing.yields += tx.amount
      } else {
        existing.withdrawals += tx.amount
      }
      months.set(tx.monthKey, existing)
    }

    const sorted = Array.from(months.entries()).sort((a, b) => a[0].localeCompare(b[0]))

    let runningBalance = 0
    return sorted.map(([monthKey, data]) => {
      runningBalance += data.contributions + data.yields - data.withdrawals
      return {
        month: formatMonthYear(monthKey),
        aportes: data.contributions / 100,
        retiradas: data.withdrawals / 100,
        rendimentos: data.yields / 100,
        saldoAcumulado: runningBalance / 100
      }
    })
  }, [invTransactions])

  const recentTransactions = useMemo(() => {
    return [...invTransactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)
  }, [invTransactions])

  const totalContributions = invTransactions
    .filter((t) => t.type === 'contribution')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawals = invTransactions
    .filter((t) => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalYields = invTransactions
    .filter((t) => t.type === 'yield')
    .reduce((sum, t) => sum + t.amount, 0)

  if (!investment) return <></>

  return (
    <Modal open={open} onClose={onClose} title={investment.name} wide>
      <div className="space-y-6">
        {/* Summary */}
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {INVESTMENT_TYPE_LABELS[investment.type]}
          </span>
          {investment.notes && (
            <span className="text-xs text-gray-400">{investment.notes}</span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-xs text-green-600">Saldo Atual</p>
            <p className="text-lg font-bold text-green-700">{formatCurrency(investment.currentBalance)}</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-blue-600">Total Aportado</p>
            <p className="text-lg font-bold text-blue-700">{formatCurrency(totalContributions)}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3">
            <p className="text-xs text-amber-600">Total Rendimentos</p>
            <p className="text-lg font-bold text-amber-700">{formatCurrency(totalYields)}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-xs text-red-600">Total Retirado</p>
            <p className="text-lg font-bold text-red-700">{formatCurrency(totalWithdrawals)}</p>
          </div>
        </div>

        {/* Balance evolution chart */}
        {monthlyData.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Evolução do Saldo</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v: number) => `R$ ${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(Math.round(value * 100))}
                    contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="saldoAcumulado"
                    name="Saldo"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Monthly contributions/withdrawals chart */}
        {monthlyData.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Aportes e Retiradas por Mês</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v: number) => `R$ ${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(Math.round(value * 100))}
                    contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="aportes" name="Aportes" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="rendimentos" name="Rendimentos" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="retiradas" name="Retiradas" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent transactions */}
        {recentTransactions.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">
              Últimas Movimentações
            </h4>
            <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 px-3 py-2">
                  {tx.type === 'contribution' ? (
                    <ArrowUpCircle size={16} className="shrink-0 text-green-500" />
                  ) : tx.type === 'yield' ? (
                    <TrendingUp size={16} className="shrink-0 text-amber-500" />
                  ) : (
                    <ArrowDownCircle size={16} className="shrink-0 text-red-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">
                      {formatDate(tx.date)}
                      {tx.notes && ` — ${tx.notes}`}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${tx.type === 'yield' ? 'text-amber-600' : tx.type === 'contribution' ? 'text-green-700' : 'text-red-600'}`}
                  >
                    {tx.type === 'withdrawal' ? '-' : '+'}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
