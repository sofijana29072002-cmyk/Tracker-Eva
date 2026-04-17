'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { formatDate, SEVERITY_LABELS, SEVERITY_BG } from '@/lib/utils'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
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
const [avatarUrl, setAvatarUrl] = useState<string | null>((profile as any)?.avatar_url ?? null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (uploadError) {
      toast.error('Ошибка загрузки фото')
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const urlWithTs = `${publicUrl}?t=${Date.now()}`
    await supabase.from('profiles').update({ avatar_url: urlWithTs }).eq('id', user.id)
    setAvatarUrl(urlWithTs)
    toast.success('🌿 Фото обновлено!')
    setUploading(false)
  }

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
    <>
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          33% { transform: translateY(-18px) translateX(8px) scale(1.05); }
          66% { transform: translateY(-8px) translateX(-6px) scale(0.97); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          40% { transform: translateY(-24px) translateX(-10px) scale(1.08); }
          70% { transform: translateY(-12px) translateX(12px) scale(0.95); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-14px) scale(1.1); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
        @keyframes leaf-sway {
          0%, 100% { transform: rotate(-8deg) scale(1); }
          50% { transform: rotate(8deg) scale(1.05); }
        }
        .bubble-1 { animation: float1 7s ease-in-out infinite; }
        .bubble-2 { animation: float2 9s ease-in-out infinite; animation-delay: -3s; }
        .bubble-3 { animation: float3 6s ease-in-out infinite; animation-delay: -1.5s; }
        .bubble-4 { animation: float1 11s ease-in-out infinite; animation-delay: -5s; }
        .bubble-5 { animation: float2 8s ease-in-out infinite; animation-delay: -2s; }
        .leaf { animation: leaf-sway 4s ease-in-out infinite; }
        .shimmer { animation: shimmer 3s ease-in-out infinite; }
      `}</style>

      <div className="max-w-lg mx-auto">

        {/* ── Hero with animated background ── */}
        <div className="relative overflow-hidden px-4 pt-6 pb-8" style={{ background: 'linear-gradient(135deg, #fff7f0 0%, #fef3e8 50%, #f0faf0 100%)' }}>

          {/* Animated bubbles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="bubble-1 absolute top-4 right-8 w-16 h-16 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #ff9a6c, #ffb347)' }} />
            <div className="bubble-2 absolute top-12 right-28 w-10 h-10 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #a8e6cf, #7ec8a0)' }} />
            <div className="bubble-3 absolute bottom-4 right-16 w-8 h-8 rounded-full opacity-25" style={{ background: 'radial-gradient(circle, #ffd3b6, #ffb347)' }} />
            <div className="bubble-4 absolute top-2 left-1/2 w-6 h-6 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #c8e6c9, #81c784)' }} />
            <div className="bubble-5 absolute bottom-8 left-8 w-12 h-12 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #ffe0b2, #ffcc80)' }} />
            <div className="leaf shimmer absolute top-6 left-1/3 text-3xl select-none">🌿</div>
            <div className="leaf shimmer absolute bottom-4 right-6 text-2xl select-none" style={{ animationDelay: '-2s' }}>🌱</div>
            <div className="shimmer absolute top-2 right-4 text-xl select-none" style={{ animationDelay: '-1s' }}>✨</div>
          </div>

          {/* Content */}
          <div className="relative flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-orange-100 flex items-center justify-center transition-transform active:scale-95"
                title="Нажми чтобы сменить фото"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={childName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{uploading ? '⏳' : '👶'}</span>
                )}
                {/* Upload overlay */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-end justify-center pb-1">
                  <span className="text-white text-xs opacity-0 hover:opacity-100 transition-opacity font-medium drop-shadow">📷</span>
                </div>
              </button>
              {/* Camera badge */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center text-sm"
              >
                📷
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* Greeting */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-800">Привет! 👋</h1>
              <p className="text-gray-600 font-medium text-base truncate">{childName}</p>
              <p className="text-gray-400 text-sm">{formatDate(today, 'd MMMM')}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-5">

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
                    className="w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold min-w-[32px]"
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
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 flex-wrap">
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
              <Link href="/log?tab=food" className="text-xs text-skin-500 mt-2 inline-block">+ Добавить</Link>
            </div>
            <div className="card">
              <p className="text-3xl font-bold text-blue-500">{contactCount}</p>
              <p className="text-sm text-gray-500 mt-1">🧴 Контактов</p>
              <Link href="/log?tab=contact" className="text-xs text-blue-500 mt-2 inline-block">+ Добавить</Link>
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
      </div>
    </>
  )
}
