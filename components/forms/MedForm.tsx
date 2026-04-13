'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { todayISO, nowTime, MED_TYPES, BODY_AREAS } from '@/lib/utils'

export default function MedForm({ userId }: { userId: string }) {
  const [form, setForm] = useState({
    date: todayISO(),
    time: nowTime(),
    med_type: '',
    med_name: '',
    body_area: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.med_name.trim()) return toast.error('Введите название лекарства')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('medications').insert({
      user_id: userId,
      date: form.date,
      time: form.time || null,
      med_type: form.med_type || null,
      med_name: form.med_name.trim(),
      body_area: form.body_area || null,
      notes: form.notes || null,
    })

    setLoading(false)
    if (error) {
      toast.error('Ошибка при сохранении')
    } else {
      toast.success('💊 Лекарство записано!')
      setForm({ date: todayISO(), time: nowTime(), med_type: '', med_name: '', body_area: '', notes: '' })
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
        <label className="label">Тип</label>
        <div className="flex flex-wrap gap-2">
          {MED_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('med_type', t)}
              className={`px-3 py-1.5 rounded-xl text-sm border transition-all min-h-[36px] ${
                form.med_type === t
                  ? 'bg-purple-500 border-purple-500 text-white font-medium'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Название *</label>
        <input
          type="text"
          value={form.med_name}
          onChange={(e) => set('med_name', e.target.value)}
          placeholder="Например: Адвантан, Фенистил..."
          className="input"
        />
      </div>

      <div>
        <label className="label">Нанесено на</label>
        <select value={form.body_area} onChange={(e) => set('body_area', e.target.value)} className="input">
          <option value="">— не указывать —</option>
          {BODY_AREAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Заметки</label>
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Дозировка, реакция..."
          rows={2}
          className="input resize-none"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Сохраняю...' : '✓ Записать лекарство'}
      </button>
    </form>
  )
}
