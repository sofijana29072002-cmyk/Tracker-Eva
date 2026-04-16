'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/',           icon: '🏠', label: 'Главная'  },
  { href: '/log',        icon: '➕', label: 'Записать' },
  { href: '/history',    icon: '📋', label: 'Дневник'  },
  { href: '/analytics',  icon: '📊', label: 'Анализ'   },
  { href: '/favorites',  icon: '❤️', label: 'Любимое'  },
  { href: '/blacklist',  icon: '🚫', label: 'Запреты'  },
  { href: '/growth',     icon: '📏', label: 'Рост'     },
  { href: '/articles',   icon: '📚', label: 'Статьи'   },
  { href: '/settings',   icon: '⚙️',  label: 'Ещё'     },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-skin-50 flex flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-bold text-gray-800 text-lg">Атопи-трекер</span>
        </div>
        <Link href="/log" className="btn-primary text-sm py-2 px-4">
          + Добавить
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-nav overflow-x-hidden">
        {children}
      </main>

      {/* Bottom navigation — горизонтальный скролл */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
        <div className="flex overflow-x-auto scrollbar-hide h-16">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-shrink-0 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors px-3',
                  isActive
                    ? 'text-skin-600 font-semibold'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="leading-none whitespace-nowrap">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
