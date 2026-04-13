'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface AutocompleteProps {
  table: 'food_entries' | 'contact_entries'
  column: 'food_name' | 'contact_name'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function Autocomplete({
  table, column, value, onChange, placeholder, className,
}: AutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) { setSuggestions([]); return }
    const supabase = createClient()
    const { data } = await supabase
      .from(table)
      .select(column)
      .ilike(column, `%${query}%`)
      .limit(5)

    if (data) {
      const unique = [...new Set(data.map((d) => (d as Record<string, string>)[column]))]
      setSuggestions(unique)
      setOpen(unique.length > 0)
    }
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          fetchSuggestions(e.target.value)
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={cn('input', className)}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(s); setOpen(false) }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-skin-50 transition-colors"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
