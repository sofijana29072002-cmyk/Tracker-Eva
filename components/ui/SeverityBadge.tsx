import { cn } from '@/lib/utils'
import { SEVERITY_LABELS } from '@/lib/utils'

const colors: Record<number, string> = {
  1: 'bg-sage-400 text-white',
  2: 'bg-yellow-200 text-yellow-800',
  3: 'bg-orange-200 text-orange-800',
  4: 'bg-orange-400 text-white',
  5: 'bg-red-500 text-white',
}

export function SeverityBadge({ severity, className }: { severity: number; className?: string }) {
  return (
    <span className={cn('badge font-semibold', colors[severity] ?? 'bg-gray-200 text-gray-600', className)}>
      {severity} — {SEVERITY_LABELS[severity] ?? '?'}
    </span>
  )
}

export function SeverityDot({ severity, size = 'md' }: { severity: number; size?: 'sm' | 'md' | 'lg' }) {
  const bg: Record<number, string> = {
    1: 'bg-sage-400',
    2: 'bg-yellow-300',
    3: 'bg-orange-300',
    4: 'bg-orange-500',
    5: 'bg-red-500',
  }
  const sizes = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' }
  return (
    <span className={cn('inline-block rounded-full', bg[severity] ?? 'bg-gray-300', sizes[size])} />
  )
}
