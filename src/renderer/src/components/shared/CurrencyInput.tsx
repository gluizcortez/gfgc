import { useState, useEffect, useRef } from 'react'

interface CurrencyInputProps {
  value: number // cents
  onChange: (cents: number) => void
  label?: string
  placeholder?: string
  className?: string
}

export function CurrencyInput({
  value,
  onChange,
  label,
  placeholder = 'R$ 0,00',
  className = ''
}: CurrencyInputProps): React.JSX.Element {
  const [displayValue, setDisplayValue] = useState(() =>
    value ? (value / 100).toFixed(2).replace('.', ',') : ''
  )
  const isFocused = useRef(false)

  // Sync display when value changes externally (e.g. opening edit modal)
  useEffect(() => {
    if (isFocused.current) return
    setDisplayValue(value ? (value / 100).toFixed(2).replace('.', ',') : '')
  }, [value])

  const handleChange = (raw: string): void => {
    // Allow only digits and comma
    const cleaned = raw.replace(/[^\d,]/g, '')
    setDisplayValue(cleaned)

    const numericStr = cleaned.replace(',', '.')
    const num = parseFloat(numericStr)
    if (!isNaN(num) && num >= 0) {
      onChange(Math.round(Math.min(num, 9999999.99) * 100))
    } else if (cleaned === '') {
      onChange(0)
    }
  }

  const handleBlur = (): void => {
    if (value > 0) {
      setDisplayValue((value / 100).toFixed(2).replace('.', ','))
    } else {
      setDisplayValue('')
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
          R$
        </span>
        <input
          type="text"
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { isFocused.current = true }}
          onBlur={() => { isFocused.current = false; handleBlur() }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        />
      </div>
    </div>
  )
}
