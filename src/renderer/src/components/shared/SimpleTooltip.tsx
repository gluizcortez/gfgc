import * as Tooltip from '@radix-ui/react-tooltip'

interface SimpleTooltipProps {
  label: string
  children: React.ReactElement
  side?: 'top' | 'bottom' | 'left' | 'right'
  delayDuration?: number
}

export function SimpleTooltip({
  label,
  children,
  side = 'bottom',
  delayDuration = 300
}: SimpleTooltipProps): React.JSX.Element {
  return (
    <Tooltip.Root delayDuration={delayDuration}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side={side}
          sideOffset={6}
          className="z-50 max-w-xs rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg animate-in fade-in-0 zoom-in-95"
        >
          {label}
          <Tooltip.Arrow className="fill-gray-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
