'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const MAIN_NAV = [
  { href: '/',          icon: '🏠', label: 'Главная'  },
  { href: '/log',       icon: '➕', label: 'Записать' },
  { href: '/history',   icon: '📋', label: 'Дневник'  },
  { href: '/analytics', icon: '📊', label: 'Анализ'   },
]

const MORE_NAV = [
  { href: '/favorites', icon: '❤️', label: 'Любимое'  },
  { href: '/blacklist', icon: '🚫', label: 'Запреты'  },
  { href: '/growth',    icon: '📏', label: 'Рост'     },
  { href: '/articles',  icon: '📚', label: 'Статьи'   },
  { href: '/settings',  icon: '⚙️', label: 'Настройки'},
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const isMoreActive = MORE_NAV.some((item) => pathname.startsWith(item.href))

  return (
    <div className="min-h-screen bg-skin-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-bold text-gray-800 text-lg">Атопи-трекер</span>
        </div>
        <Link href="/log" className="btn-primary text-sm py-2 px-4">
          + Добавить
        </Link>
      </header>

      <main className="flex-1 pb-nav overflow-x-hidden">
        {children}
      </main>

      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
        />
      )}

      <div className={cn(
        'fixed left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out',
        moreOpen ? 'translate-y-0' : 'translate-y-full',
        'bottom-[64px]'
      )}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-2">Разделы</p>
        <div className="grid grid-cols-5 gap-1 px-4 pb-6 pt-1">
          {MORE_NAV.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-3 rounded-2xl text-xs transition-colors',
                  isActive
                    ? 'bg-skin-50 text-skin-600 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50'
                )}
              >
                <span className="text-2xl leading-none">{item.icon}</span>
                <span className="leading-none text-center whitespace-nowrap">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around h-16 max-w-lg mx-auto">
          {MAIN_NAV.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 text-xs transition-colors flex-1',
                  isActive
                    ? 'text-skin-600 font-semibold'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="leading-none">{item.label}</span>
              </Link>
            )
          })}

          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 text-xs transition-colors flex-1',
              isMoreActive || moreOpen
                ? 'text-skin-600 font-semibold'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <span className="text-xl leading-none">☰</span>
            <span className="leading-none">Ещё</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
