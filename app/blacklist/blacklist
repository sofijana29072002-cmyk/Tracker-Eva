'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { formatDate, todayISO } from '@/lib/utils'

interface BlacklistItem {
  id: string
  item_name: string
  item_type: 'food' | 'contact'
  reason: string | null
  severity: number | null
  added_date: string
  notes: string | null
}

const SEVERITY_LABELS: Record<number, string> = {
  1: 'лёгкая', 2: 'умеренная', 3: 'средняя', 4: 'сильная', 5: 'тяжёлая',
}

const SEVERITY_COLORS: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-orange-100 text-orange-800',
  3: 'bg-orange-200 text-orange-900',
  4: 'bg-red-200 text-red-800',
  5: 'bg-red-500 text-white',
}

export default function BlacklistPage() {
  const [items, setItems] = useState<BlacklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'food' | 'contact'>('all')
  const [form, setForm] = useState({
    item_name: '',
    item_type: 'food' as 'food' | 'contact',
    reason: '',
    severity: 3,
    added_date: todayISO(),
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const fetchItems = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('blacklist_items')
      .select('*')
      .eq('user_id', user.id)
      .order('added_date', { ascending: false })
    setItems((data as BlacklistItem[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.item_name.trim()) return toast.error('Введите название')
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('blacklist_items').insert({
      user_id: user.id,
      item_name: form.item_name.trim(),
      item_type: form.item_type,
      reason: form.reason || null,
      severity: form.severity,
      added_date: form.added_date,
      notes: form.notes || null,
    })

    setSaving(false)
    if (error) {
      toast.error('Ошибка при сохранении')
    } else {
      toast.success('🚫 Добавлено в чёрный список')
      setForm({ item_name: '', item_type: 'food', reason: '', severity: 3, added_date: todayISO(), notes: '' })
      setShowForm(false)
      fetchItems()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Убрать "${name}" из чёрного списка?`)) return
    setItems((p) => p.filter((i) => i.id !== id))
    await supabase.from('blacklist_items').delete().eq('id', id)
    toast.success('Убрано из чёрного списка')
  }

  const filtered = filter === 'all' ? items : items.filter((i) => i.item_type === filter)
  const foodCount    = items.filter((i) => i.item_type === 'food').length
  const contactCount = items.filter((i) => i.item_type === 'contact').length

  return (
    <AppShell>
      <div className="max-w-lg mx-auto p-4 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">🚫 Чёрный список</h1>
            <p className="text-sm text-gray-500 mt-0.5">Продукты и контакты, которые нельзя</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4">
            {showForm ? 'Отмена' : '+ Добавить'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center py-3">
            <p className="text-2xl font-bold text-red-500">{foodCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">🍎 продуктов</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-2xl font-bold text-orange-500">{contactCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">🧴 контактов</p>
          </div>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="card border-red-100 bg-red-50">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Новый запрет</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              {/* Type toggle */}
              <div>
                <label className="label">Тип</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setForm((f) => ({ ...f, item_type: 'food' }))}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-medium border-2 transition-all ${
                      form.item_type === 'food' ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200 text-gray-600'
                    }`}>
                    🍎 Продукт питания
                  </button>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, item_type: 'contact' }))}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-medium border-2 transition-all ${
                      form.item_type === 'contact' ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200 text-gray-600'
                    }`}>
                    🧴 Контакт
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Название *</label>
                <input type="text" value={form.item_name}
                  onChange={(e) => setForm((f) => ({ ...f, item_name: e.target.value }))}
                  placeholder={form.item_type === 'food' ? 'Например: коровье молоко' : 'Например: стиральный порошок Tide'}
                  className="input bg-white" />
              </div>

              <div>
                <label className="label">Причина / реакция</label>
                <input type="text" value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  placeholder="Сыпь на щеках, отёк, зуд..."
                  className="input bg-white" />
              </div>

              <div>
                <label className="label">Тяжесть реакции</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button"
                      onClick={() => setForm((f) => ({ ...f, severity: n }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                        form.severity === n ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200 text-gray-500'
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1 text-center">{SEVERITY_LABELS[form.severity]}</p>
              </div>

              <div>
                <label className="label">Дата обнаружения</label>
                <input type="date" value={form.added_date}
                  onChange={(e) => setForm((f) => ({ ...f, added_date: e.target.value }))}
                  className="input bg-white" />
              </div>

              <div>
                <label className="label">Заметки</label>
                <textarea value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Подробности, что делали, куда обратились..."
                  rows={2} className="input bg-white resize-none" />
              </div>

              <button type="submit" disabled={saving}
                className="w-full py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors min-h-[44px]">
                {saving ? 'Сохраняю...' : '🚫 Добавить в чёрный список'}
              </button>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2">
          {(['all', 'food', 'contact'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                filter === f ? 'bg-red-500 text-white' : 'bg-white text-gray-500 border border-gray-200'
              }`}>
              {f === 'all' ? '🚫 Все' : f === 'food' ? '🍎 Продукты' : '🧴 Контакты'}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((n) => <div key={n} className="card animate-pulse h-16" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">✅</p>
            <p className="font-medium text-gray-600">Чёрный список пуст</p>
            <p className="text-sm mt-1">Это хорошо! Добавляйте сюда всё, на что появилась реакция.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="card border-l-4 border-l-red-400">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{item.item_type === 'food' ? '🍎' : '🧴'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800">{item.item_name}</p>
                      {item.severity && (
                        <span className={`badge text-xs ${SEVERITY_COLORS[item.severity] ?? 'bg-gray-100 text-gray-600'}`}>
                          {SEVERITY_LABELS[item.severity]}
                        </span>
                      )}
                    </div>
                    {item.reason && (
                      <p className="text-sm text-gray-500 mt-0.5">💬 {item.reason}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Добавлено {formatDate(item.added_date, 'd MMMM yyyy')}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-gray-400 italic mt-0.5">"{item.notes}"</p>
                    )}
                  </div>
                  <button onClick={() => handleDelete(item.id, item.item_name)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1 text-lg leading-none flex-shrink-0">
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <p className="text-center text-xs text-gray-400 pb-2">
            Нажмите × чтобы убрать из списка, когда реакция не подтвердится
          </p>
        )}
      </div>
    </AppShell>
  )
}
