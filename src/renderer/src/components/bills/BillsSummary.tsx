import { Receipt, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import type { BillEntry } from '@/types/models'
import { calculateBillsTotals } from '@/lib/calculations'

interface BillsSummaryProps {
  bills: BillEntry[]
}

export function BillsSummary({ bills }: BillsSummaryProps): React.JSX.Element {
  const { total, paid, pending, overdue } = calculateBillsTotals(bills)

  const cards = [
    { label: 'Total', value: total, icon: Receipt, color: 'text-gray-700', bg: 'bg-gray-50' },
    { label: 'Pago', value: paid, icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50' },
    { label: 'Pendente', value: pending, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Atrasado', value: overdue, icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-50' }
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className={`rounded-xl ${bg} p-4`}>
          <div className="flex items-center gap-2">
            <Icon size={18} className={color} />
            <span className={`text-sm font-medium ${color}`}>{label}</span>
          </div>
          <p className={`mt-1 text-xl font-bold ${color}`}>{formatCurrency(value)}</p>
        </div>
      ))}
    </div>
  )
}
