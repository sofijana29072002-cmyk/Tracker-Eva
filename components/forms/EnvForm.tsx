'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { todayISO, WEATHER_OPTIONS } from '@/lib/utils'

export default function EnvForm({ userId }: { userId: string }) {
  const [form, setForm] = useState({
    date: todayISO(),
    temperature: '',
    humidity: '',
    weather: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('environment_entries').insert({
      user_id: userId,
      date: form.date,
      temperature: form.temperature ? parseFloat(form.temperature) : null,
      humidity: form.humidity ? parseFloat(form.humidity) : null,
      weather: form.weather || null,
      notes: form.notes || null,
    })

    setLoading(false)
    if (error) {
      toast.error('Ошибка при сохранении')
    } else {
      toast.success('🌡️ Данные среды записаны!')
      setForm({ date: todayISO(), temperature: '', humidity: '', weather: '', notes: '' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Дата</label>
        <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="input" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Температура (°C)</label>
          <input
            type="number"
            step="0.1"
            min="10"
            max="40"
            value={form.temperature}
            onChange={(e) => set('temperature', e.target.value)}
            placeholder="22.5"
            className="input"
          />
        </div>
        <div>
          <label className="label">Влажность (%)</label>
          <input
            type="number"
            step="1"
            min="10"
            max="100"
            value={form.humidity}
            onChange={(e) => set('humidity', e.target.value)}
            placeholder="55"
            className="input"
          />
        </div>
      </div>

      {/* Humidity visual hint */}
      {form.humidity && (
        <div className="flex items-center gap-2 text-sm">
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(100, parseFloat(form.humidity))}%`,
                backgroundColor:
                  parseFloat(form.humidity) < 40 ? '#f97316' :
                  parseFloat(form.humidity) > 70 ? '#3b82f6' :
                  '#64aa68',
              }}
            />
          </div>
          <span className="text-gray-500">
            {parseFloat(form.humidity) < 40 ? '🏜️ Сухо' : parseFloat(form.humidity) > 70 ? '💧 Влажно' : '✅ Норма'}
          </span>
        </div>
      )}

      <div>
        <label className="label">Погода</label>
        <div className="flex flex-wrap gap-2">
          {WEATHER_OPTIONS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => set('weather', form.weather === w ? '' : w)}
              className={`px-3 py-1.5 rounded-xl text-sm border transition-all min-h-[36px] ${
                form.weather === w
                  ? 'bg-teal-500 border-teal-500 text-white font-medium'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-teal-300'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Заметки</label>
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Перемена места, поездка..."
          rows={2}
          className="input resize-none"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Сохраняю...' : '✓ Записать данные среды'}
      </button>
    </form>
  )
}
