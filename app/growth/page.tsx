'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { todayISO, formatDate } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

interface GrowthEntry {
  id: string
  date: string
  weight: number | null
  height: number | null
  notes: string | null
  created_at: string
}

export default function GrowthPage() {
  const [entries, setEntries] = useState<GrowthEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ date: todayISO(), weight: '', height: '', notes: '' })
  const [tab, setTab] = useState<'weight' | 'height'>('weight')

  const supabase = createClient()

  const fetchEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('growth_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
    setEntries((data as GrowthEntry[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchEntries() }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.weight && !form.height) return toast.error('Введите вес или рост')
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('growth_entries').insert({
      user_id: user.id,
      date: form.date,
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseFloat(form.height) : null,
      notes: form.notes || null,
    })
    setSaving(false)
    if (error) {
      toast.error('Ошибка при сохранении')
    } else {
      toast.success('📏 Запись добавлена!')
      setForm({ date: todayISO(), weight: '', height: '', notes: '' })
      fetchEntries()
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить запись?')) return
    setEntries((p) => p.filter((e) => e.id !== id))
    await supabase.from('growth_entries').delete().eq('id', id)
    toast.success('Запись удалена')
  }

  const latest = entries[entries.length - 1]
  const prev = entries[entries.length - 2]

  const chartData = entries.map((e) => ({
    date: format(parseISO(e.date), 'd MMM', { locale: ru }),
    weight: e.weight,
    height: e.height,
  }))

  const weightDelta = latest?.weight && prev?.weight ? (latest.weight - prev.weight).toFixed(1) : null
  const heightDelta = latest?.height && prev?.height ? (latest.height - prev.height).toFixed(1) : null

  return (
    <AppShell>
      <div className="max-w-lg mx-auto p-4 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Рост и вес</h1>
          <p className="text-sm text-gray-500">Динамика физического развития</p>
        </div>

        {/* Latest stats */}
        {latest && (
          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center py-4">
              <p className="text-3xl font-bold text-skin-500">{latest.weight ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">⚖️ кг</p>
              {weightDelta && (
                <p className={`text-xs mt-1 font-medium ${parseFloat(weightDelta) >= 0 ? 'text-sage-500' : 'text-orange-500'}`}>
                  {parseFloat(weightDelta) >= 0 ? '+' : ''}{weightDelta} с прошлого раза
                </p>
              )}
            </div>
            <div className="card text-center py-4">
              <p className="text-3xl font-bold text-blue-500">{latest.height ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">📏 см</p>
              {heightDelta && (
                <p className={`text-xs mt-1 font-medium ${parseFloat(heightDelta) >= 0 ? 'text-sage-500' : 'text-orange-500'}`}>
                  {parseFloat(heightDelta) >= 0 ? '+' : ''}{heightDelta} с прошлого раза
                </p>
              )}
            </div>
          </div>
        )}

        {/* Chart */}
        {entries.length >= 2 && (
          <div className="card">
            <div className="flex gap-2 mb-3">
              <button onClick={() => setTab('weight')}
                className={`px-3 py-1 rounded-xl text-sm font-medium transition-colors ${tab === 'weight' ? 'bg-skin-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                ⚖️ Вес
              </button>
              <button onClick={() => setTab('height')}
                className={`px-3 py-1 rounded-xl text-sm font-medium transition-colors ${tab === 'height' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                📏 Рост
              </button>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip formatter={(v) => [`${v} ${tab === 'weight' ? 'кг' : 'см'}`, tab === 'weight' ? 'Вес' : 'Рост']} />
                <Line type="monotone" dataKey={tab} stroke={tab === 'weight' ? '#ff7328' : '#3b82f6'}
                  strokeWidth={2.5} dot={{ r: 4, fill: tab === 'weight' ? '#ff7328' : '#3b82f6', stroke: 'white', strokeWidth: 2 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Add form */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 mb-4">+ Новое измерение</h2>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="label">Дата</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Вес (кг)</label>
                <input type="number" step="0.1" min="1" max="100" value={form.weight}
                  onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                  placeholder="8.5" className="input" />
              </div>
              <div>
                <label className="label">Рост (см)</label>
                <input type="number" step="0.1" min="30" max="200" value={form.height}
                  onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
                  placeholder="75" className="input" />
              </div>
            </div>
            <div>
              <label className="label">Заметки</label>
              <input type="text" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Плановый осмотр, 6 месяцев..." className="input" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Сохраняю...' : '✓ Сохранить'}
            </button>
          </form>
        </div>

        {/* History list */}
        {loading ? (
          <div className="card animate-pulse h-20" />
        ) : entries.length > 0 ? (
          <div className="card">
            <h2 className="text-base font-semibold text-gray-800 mb-3">История измерений</h2>
            <div className="space-y-2">
              {[...entries].reverse().map((e) => (
                <div key={e.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{formatDate(e.date, 'd MMMM yyyy')}</p>
                    <p className="text-xs text-gray-400">
                      {e.weight != null && `⚖️ ${e.weight} кг`}
                      {e.weight != null && e.height != null && ' · '}
                      {e.height != null && `📏 ${e.height} см`}
                      {e.notes && ` · ${e.notes}`}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(e.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1 text-lg leading-none">×</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-2">📏</p>
            <p className="text-sm">Добавьте первое измерение</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
