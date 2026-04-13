'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

interface Props {
  profile: Profile | null
  userEmail: string
}

export default function SettingsClient({ profile, userEmail }: Props) {
  const router = useRouter()
  const [childName, setChildName] = useState(profile?.child_name ?? '')
  const [birthDate, setBirthDate] = useState(profile?.child_birth_date ?? '')
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportFrom, setExportFrom] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  )
  const [exportTo, setExportTo] = useState(new Date().toISOString().split('T')[0])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').upsert({
      id: (await supabase.auth.getUser()).data.user!.id,
      child_name: childName || null,
      child_birth_date: birthDate || null,
    })
    setSaving(false)
    if (error) {
      toast.error('Ошибка при сохранении')
    } else {
      toast.success('✅ Настройки сохранены!')
      router.refresh()
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch(`/api/export?from=${exportFrom}&to=${exportTo}`)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `atopy-tracker-${exportFrom}-${exportTo}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('📥 CSV скачан!')
    } catch {
      toast.error('Ошибка при экспорте')
    }
    setExporting(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Настройки</h1>
        <p className="text-sm text-gray-500">{userEmail}</p>
      </div>

      {/* Profile */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-800 mb-4">👶 Данные ребёнка</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Имя ребёнка</label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Например: Лёша"
              className="input"
            />
          </div>
          <div>
            <label className="label">Дата рождения</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="input"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Сохраняю...' : '✓ Сохранить'}
          </button>
        </form>
      </div>

      {/* Export */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-800 mb-2">📄 Экспорт для врача</h2>
        <p className="text-sm text-gray-500 mb-4">
          Скачайте все данные в CSV — можно открыть в Excel или отправить врачу.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="label">С</label>
            <input
              type="date"
              value={exportFrom}
              onChange={(e) => setExportFrom(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">По</label>
            <input
              type="date"
              value={exportTo}
              onChange={(e) => setExportTo(e.target.value)}
              className="input"
            />
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-secondary w-full"
        >
          {exporting ? 'Подготовка...' : '⬇️ Скачать CSV'}
        </button>
      </div>

      {/* App info */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-800 mb-3">ℹ️ О приложении</h2>
        <div className="space-y-2 text-sm text-gray-500">
          <p>🌿 Атопи-трекер v0.1.0</p>
          <p>Все данные хранятся в вашем защищённом аккаунте Supabase.</p>
          <p>Никто, кроме вас, не имеет к ним доступа.</p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-2xl border-2 border-red-200 text-red-500 font-medium hover:bg-red-50 transition-colors min-h-[44px]"
      >
        Выйти из аккаунта
      </button>
    </div>
  )
}
