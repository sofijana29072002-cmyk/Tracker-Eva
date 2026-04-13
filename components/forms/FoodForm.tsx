'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { todayISO, nowTime, FOOD_CATEGORIES } from '@/lib/utils'
import { Autocomplete } from '@/components/ui/Autocomplete'

export default function FoodForm({ userId }: { userId: string }) {
  const [form, setForm] = useState({
    date: todayISO(),
    time: nowTime(),
    food_name: '',
    category: '',
    is_new_product: false,
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.food_name.trim()) return toast.error('Введите название продукта')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('food_entries').insert({
      user_id: userId,
      date: form.date,
      time: form.time || null,
      food_name: form.food_name.trim(),
      category: form.category || null,
      is_new_product: form.is_new_product,
      notes: form.notes || null,
    })

    setLoading(false)
    if (error) {
      toast.error('Ошибка при сохранении')
    } else {
      toast.success('🍎 Запись добавлена!')
      setForm({ date: todayISO(), time: nowTime(), food_name: '', category: '', is_new_product: false, notes: '' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Дата</label>
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Время</label>
          <input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} className="input" />
        </div>
      </div>

      <div>
        <label className="label">Продукт / блюдо *</label>
        <Autocomplete
          table="food_entries"
          column="food_name"
          value={form.food_name}
          onChange={(v) => set('food_name', v)}
          placeholder="Например: банан, каша гречневая..."
        />
      </div>

      <div>
        <label className="label">Категория</label>
        <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input">
          <option value="">— выберите —</option>
          {FOOD_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => set('is_new_product', !form.is_new_product)}
          className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
            form.is_new_product ? 'bg-skin-500' : 'bg-gray-200'
          }`}
        >
          <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_new_product ? 'translate-x-6' : ''}`} />
        </div>
        <span className="text-sm text-gray-700">Первый раз пробует этот продукт</span>
      </label>

      <div>
        <label className="label">Заметки</label>
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Количество, реакция, особенности..."
          rows={2}
          className="input resize-none"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Сохраняю...' : '✓ Сохранить запись'}
      </button>
    </form>
  )
}
