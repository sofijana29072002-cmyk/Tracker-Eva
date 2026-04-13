'use client'

import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { todayISO, nowTime, BODY_AREAS, SYMPTOMS, SEVERITY_LABELS } from '@/lib/utils'
import { MultiSelect } from '@/components/ui/MultiSelect'

const SEVERITY_EMOJIS: Record<number, string> = {
  1: '😊', 2: '🙂', 3: '😐', 4: '😟', 5: '😰',
}

const SEVERITY_COLORS_BTN: Record<number, string> = {
  1: 'bg-sage-400 text-white border-sage-400',
  2: 'bg-yellow-300 text-yellow-900 border-yellow-300',
  3: 'bg-orange-300 text-orange-900 border-orange-300',
  4: 'bg-orange-500 text-white border-orange-500',
  5: 'bg-red-500 text-white border-red-500',
}

export default function SkinForm({ userId }: { userId: string }) {
  const [form, setForm] = useState({
    date: todayISO(),
    time: nowTime(),
    severity: 1,
    body_areas: [] as string[],
    symptoms: [] as string[],
    notes: '',
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }))

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    let photo_url: string | null = null

    // Upload photo if present
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('skin-photos')
        .upload(path, photoFile, { upsert: false })

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from('skin-photos').getPublicUrl(path)
        photo_url = urlData.publicUrl
      }
    }

    const { error } = await supabase.from('skin_entries').insert({
      user_id: userId,
      date: form.date,
      time: form.time || null,
      severity: form.severity,
      body_areas: form.body_areas,
      symptoms: form.symptoms,
      photo_url,
      notes: form.notes || null,
    })

    setLoading(false)
    if (error) {
      toast.error('Ошибка при сохранении')
    } else {
      toast.success('🩹 Состояние кожи записано!')
      setForm({ date: todayISO(), time: nowTime(), severity: 1, body_areas: [], symptoms: [], notes: '' })
      setPhotoFile(null)
      setPhotoPreview(null)
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

      {/* Severity picker */}
      <div>
        <label className="label">Оценка состояния кожи *</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => set('severity', n)}
              className={`flex-1 flex flex-col items-center py-3 rounded-2xl border-2 transition-all text-center ${
                form.severity === n
                  ? SEVERITY_COLORS_BTN[n]
                  : 'border-gray-200 bg-white text-gray-400'
              }`}
            >
              <span className="text-xl">{SEVERITY_EMOJIS[n]}</span>
              <span className="text-xs font-medium mt-0.5 leading-tight">{SEVERITY_LABELS[n]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Body areas */}
      <div>
        <label className="label">Зоны поражения</label>
        <MultiSelect
          options={BODY_AREAS}
          value={form.body_areas}
          onChange={(v) => set('body_areas', v)}
        />
      </div>

      {/* Symptoms */}
      <div>
        <label className="label">Симптомы</label>
        <MultiSelect
          options={SYMPTOMS}
          value={form.symptoms}
          onChange={(v) => set('symptoms', v)}
        />
      </div>

      {/* Photo */}
      <div>
        <label className="label">Фото</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhoto}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="btn-secondary w-full"
        >
          📷 {photoPreview ? 'Изменить фото' : 'Добавить фото'}
        </button>
        {photoPreview && (
          <div className="mt-2 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="preview" className="w-full rounded-2xl max-h-48 object-cover" />
            <button
              type="button"
              onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full text-lg flex items-center justify-center"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="label">Заметки</label>
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Что изменилось, что беспокоит..."
          rows={2}
          className="input resize-none"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Сохраняю...' : '✓ Записать состояние'}
      </button>
    </form>
  )
}
