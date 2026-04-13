'use client'

import { cn } from '@/lib/utils'

interface MultiSelectProps {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  className?: string
}

export function MultiSelect({ options, value, onChange, className }: MultiSelectProps) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt))
    } else {
      onChange([...value, opt])
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={cn(
            'px-3 py-1.5 rounded-xl text-sm font-medium border transition-all min-h-[36px]',
            value.includes(opt)
              ? 'bg-skin-500 border-skin-500 text-white'
              : 'bg-white border-gray-200 text-gray-600 hover:border-skin-300'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
