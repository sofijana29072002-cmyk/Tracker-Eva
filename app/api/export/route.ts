import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SkinEntry, FoodEntry, ContactEntry, Medication, EnvironmentEntry } from '@/lib/supabase/types'

function escapeCSV(val: unknown): string {
  if (val == null) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function toCSVRow(row: Record<string, unknown>): string {
  return Object.values(row).map(escapeCSV).join(',')
}

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from') ?? new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const to = searchParams.get('to') ?? new Date().toISOString().split('T')[0]

  // Fetch all data in parallel
  const [
    { data: skinRaw },
    { data: foodRaw },
    { data: contactRaw },
    { data: medRaw },
    { data: envRaw },
  ] = await Promise.all([
    supabase.from('skin_entries').select('*').eq('user_id', user.id).gte('date', from).lte('date', to).order('date'),
    supabase.from('food_entries').select('*').eq('user_id', user.id).gte('date', from).lte('date', to).order('date'),
    supabase.from('contact_entries').select('*').eq('user_id', user.id).gte('date', from).lte('date', to).order('date'),
    supabase.from('medications').select('*').eq('user_id', user.id).gte('date', from).lte('date', to).order('date'),
    supabase.from('environment_entries').select('*').eq('user_id', user.id).gte('date', from).lte('date', to).order('date'),
  ])

  const skinEntries = (skinRaw ?? []) as SkinEntry[]
  const foodEntries = (foodRaw ?? []) as FoodEntry[]
  const contactEntries = (contactRaw ?? []) as ContactEntry[]
  const medications = (medRaw ?? []) as Medication[]
  const envEntries = (envRaw ?? []) as EnvironmentEntry[]

  const lines: string[] = []

  // ---- Skin entries ----
  lines.push('=== СОСТОЯНИЕ КОЖИ ===')
  lines.push('Дата,Время,Оценка (1-5),Зоны,Симптомы,Заметки')
  for (const e of skinEntries) {
    lines.push(toCSVRow({
      date: e.date,
      time: e.time ?? '',
      severity: e.severity,
      body_areas: (e.body_areas ?? []).join('; '),
      symptoms: (e.symptoms ?? []).join('; '),
      notes: e.notes ?? '',
    }))
  }

  lines.push('')

  // ---- Food entries ----
  lines.push('=== ЕДА ===')
  lines.push('Дата,Время,Продукт,Категория,Новый продукт,Заметки')
  for (const e of foodEntries) {
    lines.push(toCSVRow({
      date: e.date,
      time: e.time ?? '',
      food_name: e.food_name,
      category: e.category ?? '',
      is_new: e.is_new_product ? 'Да' : 'Нет',
      notes: e.notes ?? '',
    }))
  }

  lines.push('')

  // ---- Contact entries ----
  lines.push('=== КОНТАКТЫ ===')
  lines.push('Дата,Время,Тип,Название,Зона контакта,Заметки')
  for (const e of contactEntries) {
    lines.push(toCSVRow({
      date: e.date,
      time: e.time ?? '',
      contact_type: e.contact_type,
      contact_name: e.contact_name,
      body_area: e.body_area ?? '',
      notes: e.notes ?? '',
    }))
  }

  lines.push('')

  // ---- Medications ----
  lines.push('=== ЛЕКАРСТВА И УХОД ===')
  lines.push('Дата,Время,Тип,Название,Зона,Заметки')
  for (const e of medications) {
    lines.push(toCSVRow({
      date: e.date,
      time: e.time ?? '',
      med_type: e.med_type ?? '',
      med_name: e.med_name,
      body_area: e.body_area ?? '',
      notes: e.notes ?? '',
    }))
  }

  lines.push('')

  // ---- Environment ----
  lines.push('=== ОКРУЖАЮЩАЯ СРЕДА ===')
  lines.push('Дата,Температура (°C),Влажность (%),Погода,Заметки')
  for (const e of envEntries) {
    lines.push(toCSVRow({
      date: e.date,
      temperature: e.temperature ?? '',
      humidity: e.humidity ?? '',
      weather: e.weather ?? '',
      notes: e.notes ?? '',
    }))
  }

  const csv = '\uFEFF' + lines.join('\n') // BOM for Excel

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="atopy-${from}-${to}.csv"`,
    },
  })
}
