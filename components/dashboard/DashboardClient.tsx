'use client'

import Link from 'next/link'
import { formatDate, SEVERITY_LABELS, SEVERITY_BG } from '@/lib/utils'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import type { Profile, SkinEntry } from '@/lib/supabase/types'

interface Props {
  profile: Profile | null
  skinEntries: SkinEntry[]
  foodCount: number
  contactCount: number
  weekSkin: { date: string; severity: number }[]
  today: string
}

const QUICK_ACTIONS = [
  { href: '/log?tab=food',    icon: '🍎', label: 'Еда',       color: 'bg-orange-50 text-orange-600' },
  { href: '/log?tab=contact', icon: '🧴', label: 'Контакт',   color: 'bg-blue-50 text-blue-600' },
  { href: '/log?tab=skin',    icon: '🩹', label: 'Кожа',      color: 'bg-pink-50 text-pink-600' },
  { href: '/log?tab=med',     icon: '💊', label: 'Лекарство', color: 'bg-purple-50 text-purple-600' },
  { href: '/log?tab=env',     icon: '🌡️', label: 'Среда',     color: 'bg-teal-50 text-teal-600' },
]

function getSeverityBg(severity: number) {
  return SEVERITY_BG[severity] ?? '#d1d5db'
}

export default function DashboardClient({ profile, skinEntries, foodCount, contactCount, weekSkin, today }: Props) {
  const latestSkin = skinEntries[0]
  const childName = profile?.child_name ?? 'Малыш'

  // Build a 7-day array
  const days: { date: string; label: string; severity: number | null }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const iso = d.toISOString().split('T')[0]
    const entry = weekSkin.find((s) => s.date === iso)
    const dayLabel = i === 0 ? 'Сег' : ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][d.getDay()]
    days.push({ date: iso, label: dayLabel, severity: entry?.severity ?? null })
  }

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto">
      {/* Greeting */}
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-800">
          Привет! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {childName} · {formatDate(today, 'd MMMM')}
        </p>
      </div>

      {/* Skin status card */}
      <div className="card relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 rounded-3xl"
          style={{ backgroundColor: latestSkin ? getSeverityBg(latestSkin.severity) : '#64aa68' }}
        />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Состояние кожи сегодня</p>
              {latestSkin ? (
                <>
                  <SeverityBadge severity={latestSkin.severity} className="text-sm px-3 py-1" />
                  {latestSkin.symptoms.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">{latestSkin.symptoms.join(', ')}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-400 text-sm">Нет записи</p>
              )}
            </div>
            <Link href="/log?tab=skin" className="btn-primary text-sm py-2 px-4 z-10">
              + Записать
            </Link>
          </div>
        </div>
      </div>

      {/* 7-day mini calendar */}
      <div className="card">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Последние 7 дней</p>
        <div className="flex gap-1">
          {days.map((d) => (
            <Link key={d.date} href={`/history?date=${d.date}`} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{d.label}</span>
              <div
                className="w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold text-white min-w-[32px]"
                style={{
                  backgroundColor: d.severity ? getSeverityBg(d.severity) : '#e5e7eb',
                  color: d.severity ? 'white' : '#9ca3af',
                }}
              >
                {d.severity ?? '·'}
              </div>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
          {[1,2,3,4,5].map((n) => (
            <div key={n} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getSeverityBg(n) }} />
              <span className="text-xs text-gray-400">{SEVERITY_LABELS[n]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-3xl font-bold text-skin-500">{foodCount}</p>
          <p className="text-sm text-gray-500 mt-1">🍎 Записей еды</p>
          <Link href="/log?tab=food" className="text-xs text-skin-500 mt-2 inline-block">
            + Добавить
          </Link>
        </div>
        <div className="card">
          <p className="text-3xl font-bold text-blue-500">{contactCount}</p>
          <p className="text-sm text-gray-500 mt-1">🧴 Контактов</p>
          <Link href="/log?tab=contact" className="text-xs text-blue-500 mt-2 inline-block">
            + Добавить
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Быстрые действия</p>
        <div className="grid grid-cols-5 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-gray-50 transition-colors min-h-[60px] justify-center"
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs text-gray-500 text-center leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation to analytics */}
      <Link href="/analytics" className="card flex items-center gap-4 hover:bg-gray-50 transition-colors">
        <div className="text-3xl">📊</div>
        <div>
          <p className="font-semibold text-gray-800">Анализ корреляций</p>
          <p className="text-sm text-gray-500">Найти подозрительные продукты</p>
        </div>
        <span className="ml-auto text-gray-400">→</span>
      </Link>
    </div>
  )
}
