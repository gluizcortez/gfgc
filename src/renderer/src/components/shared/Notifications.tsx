import { clsx } from 'clsx'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info
}

const STYLES = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
}

export function Notifications(): React.JSX.Element | null {
  const notifications = useUIStore((s) => s.notifications)
  const removeNotification = useUIStore((s) => s.removeNotification)

  if (notifications.length === 0) return null

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
      {notifications.map((n) => {
        const Icon = ICONS[n.type]
        return (
          <div
            key={n.id}
            className={clsx(
              'flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg',
              STYLES[n.type]
            )}
          >
            <Icon size={18} />
            <span className="text-sm font-medium">{n.message}</span>
            <button
              onClick={() => removeNotification(n.id)}
              className="ml-2 rounded p-0.5 opacity-60 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
