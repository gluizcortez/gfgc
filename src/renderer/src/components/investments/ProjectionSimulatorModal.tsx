import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { Modal } from '@/components/shared/Modal'
import { formatCurrency, parseCurrencyInput } from '@/lib/formatters'

interface ProjectionSimulatorModalProps {
  open: boolean
  onClose: () => void
}

export function ProjectionSimulatorModal({ open, onClose }: ProjectionSimulatorModalProps): React.JSX.Element | null {
  const [initialValue, setInitialValue] = useState('1000')
  const [monthlyContribution, setMonthlyContribution] = useState('500')
  const [annualRate, setAnnualRate] = useState('12')
  const [periodMonths, setPeriodMonths] = useState('60')

  const data = useMemo(() => {
    const initial = parseCurrencyInput(initialValue)
    const monthly = parseCurrencyInput(monthlyContribution)
    const rate = parseFloat(annualRate) || 0
    const months = parseInt(periodMonths) || 12

    const monthlyRate = Math.pow(1 + rate / 100, 1 / 12) - 1
    const points: { month: number; projected: number; contributed: number }[] = []

    let projectedBalance = initial
    let totalContributed = initial

    for (let m = 0; m <= months; m++) {
      points.push({
        month: m,
        projected: projectedBalance / 100,
        contributed: totalContributed / 100
      })
      projectedBalance = projectedBalance * (1 + monthlyRate) + monthly
      totalContributed += monthly
    }

    return points
  }, [initialValue, monthlyContribution, annualRate, periodMonths])

  const finalProjected = data.length > 0 ? data[data.length - 1].projected * 100 : 0
  const finalContributed = data.length > 0 ? data[data.length - 1].contributed * 100 : 0
  const totalYield = finalProjected - finalContributed

  return (
    <Modal open={open} onClose={onClose} title="Simulador de Projeção" wide>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Valor Inicial</label>
            <input
              value={initialValue}
              onChange={(e) => setInitialValue(e.target.value)}
              placeholder="1000,00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Aporte Mensal</label>
            <input
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              placeholder="500,00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Taxa Anual (%)</label>
            <input
              type="number"
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value)}
              step="0.5"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Período (meses)</label>
            <input
              type="number"
              value={periodMonths}
              onChange={(e) => setPeriodMonths(e.target.value)}
              min={1}
              max={360}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-primary-50 p-3">
            <p className="text-xs text-primary-600">Valor Projetado</p>
            <p className="text-sm font-bold text-primary-900">{formatCurrency(finalProjected)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Total Investido</p>
            <p className="text-sm font-bold text-gray-900">{formatCurrency(finalContributed)}</p>
          </div>
          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-xs text-green-600">Rendimento</p>
            <p className="text-sm font-bold text-green-700">{formatCurrency(totalYield)}</p>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10 }}
              label={{ value: 'Meses', position: 'insideBottom', offset: -5, fontSize: 11 }}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}K` : `R$${v}`}
            />
            <Tooltip formatter={(value: number) => formatCurrency(value * 100)} />
            <Legend />
            <Line type="monotone" dataKey="projected" name="Projeção" stroke="#6366f1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="contributed" name="Aportes" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Modal>
  )
}
