'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { todayISO, nowTime, CONTACT_TYPES, BODY_AREAS } from '@/lib/utils'
import { Autocomplete } from '@/components/ui/Autocomplete'

export default function ContactForm({ userId }: { userId: string }) {
  const [form, setForm] = useState({
    date: todayISO(),
    time: nowTime(),
    contact_type: '',
    contact_name: '',
    body_area: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.contact_type) return toast.error('Выберите тип контакта')
    if (!form.contact_name.trim()) return toast.error('Введите название')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('contact_entries').insert({
      user_id: userId,
      date: form.date,
      time: form.time || null,
      contact_type: form.contact_type,
      contact_name: form.contact_name.trim(),
      body_area: form.body_area || null,
      notes: form.notes || null,
    })

    setLoading(false)
    if (error) {
      toast.error('Ошибка при сохранении')
    } else {
      toast.success('🧴 Контакт записан!')
      setForm({ date: todayISO(), time: nowTime(), contact_type: '', contact_name: '', body_area: '', notes: '' })
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
        <label className="label">Тип контакта *</label>
        <div className="flex flex-wrap gap-2">
          {CONTACT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('contact_type', t)}
              className={`px-3 py-1.5 rounded-xl text-sm border transition-all min-h-[36px] ${
                form.contact_type === t
                  ? 'bg-blue-500 border-blue-500 text-white font-medium'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Название (конкретное) *</label>
        <Autocomplete
          table="contact_entries"
          column="contact_name"
          value={form.contact_name}
          onChange={(v) => set('contact_name', v)}
          placeholder="Например: стиральный порошок Tide..."
        />
      </div>

      <div>
        <label className="label">Зона контакта</label>
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
          placeholder="Особенности, реакция..."
          rows={2}
          className="input resize-none"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Сохраняю...' : '✓ Сохранить контакт'}
      </button>
    </form>
  )
}
