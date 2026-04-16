'use client'

import { useState, useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime, SEVERITY_BG, SEVERITY_LABELS } from '@/lib/utils'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import type { FoodEntry, ContactEntry, SkinEntry, Medication, EnvironmentEntry } from '@/lib/supabase/types'

interface Props {
  userId: string
  foodEntries: FoodEntry[]
  contactEntries: ContactEntry[]
  skinEntries: SkinEntry[]
  medications: Medication[]
  envEntries: EnvironmentEntry[]
}

type FilterType = 'all' | 'food' | 'contact' | 'skin' | 'med' | 'env'
type TableName = 'food_entries' | 'contact_entries' | 'skin_entries' | 'medications' | 'environment_entries'

const FILTER_TABS: { id: FilterType; icon: string; label: string }[] = [
  { id: 'all',     icon: '📋', label: 'Всё'       },
  { id: 'skin',    icon: '🩹', label: 'Кожа'      },
  { id: 'food',    icon: '🍎', label: 'Еда'       },
  { id: 'contact', icon: '🧴', label: 'Контакт'   },
  { id: 'med',     icon: '💊', label: 'Лекарства' },
  { id: 'env',     icon: '🌡️', label: 'Среда'     },
]

export default function HistoryClient({ foodEntries: initialFood, contactEntries: initialContact, skinEntries: initialSkin, medications: initialMed, envEntries: initialEnv }: Props) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')

  // Local state for optimistic deletes
  const [food, setFood] = useState(initialFood)
  const [contact, setContact] = useState(initialContact)
  const [skin, setSkin] = useState(initialSkin)
  const [med, setMed] = useState(initialMed)
  const [env, setEnv] = useState(initialEnv)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const addToFavorites = useCallback(async (foodName: string, category: string | null) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('favorite_items').insert({
      user_id: user.id,
      item_name: foodName,
      category: category ?? null,
    })
    if (error?.code === '23505') {
      toast('Уже в избранном', { icon: '❤️' })
    } else if (error) {
      toast.error('Ошибка')
    } else {
      setFavorites((prev) => new Set([...prev, foodName]))
      toast.success(`❤️ "${foodName}" добавлен в избранное`)
    }
  }, [])

  const handleDelete = async (table: TableName, id: string) => {
    // Optimistic update
    if (table === 'food_entries')        setFood((p) => p.filter((e) => e.id !== id))
    if (table === 'contact_entries')     setContact((p) => p.filter((e) => e.id !== id))
    if (table === 'skin_entries')        setSkin((p) => p.filter((e) => e.id !== id))
    if (table === 'medications')         setMed((p) => p.filter((e) => e.id !== id))
    if (table === 'environment_entries') setEnv((p) => p.filter((e) => e.id !== id))

    const supabase = createClient()
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) {
      toast.error('Ошибка при удалении')
      // Revert — reload page
      window.location.reload()
    } else {
      toast.success('Запись удалена')
    }
  }

  const confirmDelete = (table: TableName, id: string, name: string) => {
    if (window.confirm(`Удалить запись "${name}"?`)) {
      handleDelete(table, id)
    }
  }

  // Group by date
  const dateMap = useMemo(() => {
    const map: Record<string, { skin: SkinEntry[]; food: FoodEntry[]; contact: ContactEntry[]; med: Medication[]; env: EnvironmentEntry[] }> = {}
    const ensure = (date: string) => {
      if (!map[date]) map[date] = { skin: [], food: [], contact: [], med: [], env: [] }
      return map[date]
    }

    if (filter === 'all' || filter === 'skin')    skin.forEach((e) => ensure(e.date).skin.push(e))
    if (filter === 'all' || filter === 'food')    food.filter((e) => !search || e.food_name.toLowerCase().includes(search.toLowerCase())).forEach((e) => ensure(e.date).food.push(e))
    if (filter === 'all' || filter === 'contact') contact.filter((e) => !search || e.contact_name.toLowerCase().includes(search.toLowerCase())).forEach((e) => ensure(e.date).contact.push(e))
    if (filter === 'all' || filter === 'med')     med.forEach((e) => ensure(e.date).med.push(e))
    if (filter === 'all' || filter === 'env')     env.forEach((e) => ensure(e.date).env.push(e))

    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filter, search, food, contact, skin, med, env])

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Дневник</h1>
        <p className="text-sm text-gray-500">Последние 30 дней</p>
      </div>

      <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Поиск по продукту или контакту..." className="input" />

      <div className="flex gap-1 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button key={tab.id} onClick={() => setFilter(tab.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              filter === tab.id ? 'bg-skin-500 text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {dateMap.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>Записей пока нет</p>
        </div>
      ) : (
        dateMap.map(([date, entries]) => {
          const hasEntries = entries.skin.length + entries.food.length + entries.contact.length + entries.med.length + entries.env.length > 0
          if (!hasEntries) return null
          const skinEntry = entries.skin[0]
          return (
            <div key={date} className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-sm font-semibold text-gray-700">{formatDate(date, 'd MMMM, EEE')}</div>
                {skinEntry && <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: SEVERITY_BG[skinEntry.severity] ?? '#e5e7eb' }} />}
                {skinEntry && <SeverityBadge severity={skinEntry.severity} />}
              </div>

              <div className="space-y-2 ml-2 border-l-2 border-gray-100 pl-4">
                {/* Skin */}
                {entries.skin.map((e) => (
                  <div key={e.id} className="card py-3">
                    <div className="flex items-start gap-2">
                      <span>🩹</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={e.severity} />
                          {e.time && <span className="text-xs text-gray-400">{formatTime(e.time)}</span>}
                        </div>
                        {e.body_areas.length > 0 && <p className="text-xs text-gray-500 mt-1">📍 {e.body_areas.join(', ')}</p>}
                        {e.symptoms.length > 0 && <p className="text-xs text-gray-500">🔍 {e.symptoms.join(', ')}</p>}
                        {e.notes && <p className="text-xs text-gray-400 mt-1 italic">"{e.notes}"</p>}
                        {e.photo_url && <img src={e.photo_url} alt="skin" className="mt-2 w-20 h-20 rounded-xl object-cover" />}
                      </div>
                      <button onClick={() => confirmDelete('skin_entries', e.id, SEVERITY_LABELS[e.severity])}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1 text-lg leading-none">×</button>
                    </div>
                  </div>
                ))}

                {/* Food */}
                {entries.food.map((e) => (
                  <div key={e.id} className="card py-3">
                    <div className="flex items-start gap-2">
                      <span>🍎</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{e.food_name}</p>
                        <p className="text-xs text-gray-400">{e.category ?? ''}{e.is_new_product ? ' · ✨ новый' : ''}{e.time ? ` · ${formatTime(e.time)}` : ''}</p>
                        {e.notes && <p className="text-xs text-gray-400 italic mt-0.5">"{e.notes}"</p>}
                      </div>
                      <button
                        onClick={() => addToFavorites(e.food_name, e.category)}
                        title="В избранное"
                        className={`p-1 text-lg leading-none transition-colors ${favorites.has(e.food_name) ? 'text-pink-400' : 'text-gray-200 hover:text-pink-400'}`}>
                        ❤️
                      </button>
                      <button onClick={() => confirmDelete('food_entries', e.id, e.food_name)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1 text-lg leading-none">×</button>
                    </div>
                  </div>
                ))}

                {/* Contact */}
                {entries.contact.map((e) => (
                  <div key={e.id} className="card py-3">
                    <div className="flex items-start gap-2">
                      <span>🧴</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{e.contact_name}</p>
                        <p className="text-xs text-gray-400">{e.contact_type}{e.body_area ? ` · ${e.body_area}` : ''}</p>
                      </div>
                      <button onClick={() => confirmDelete('contact_entries', e.id, e.contact_name)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1 text-lg leading-none">×</button>
                    </div>
                  </div>
                ))}

                {/* Medications */}
                {entries.med.map((e) => (
                  <div key={e.id} className="card py-3">
                    <div className="flex items-start gap-2">
                      <span>💊</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{e.med_name}</p>
                        <p className="text-xs text-gray-400">{e.med_type ?? ''}{e.body_area ? ` · ${e.body_area}` : ''}</p>
                      </div>
                      <button onClick={() => confirmDelete('medications', e.id, e.med_name)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1 text-lg leading-none">×</button>
                    </div>
                  </div>
                ))}

                {/* Environment */}
                {entries.env.map((e) => (
                  <div key={e.id} className="card py-3">
                    <div className="flex items-start gap-2">
                      <span>🌡️</span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          {e.temperature != null && `${e.temperature}°C`}
                          {e.humidity != null && ` · ${e.humidity}% влаж.`}
                          {e.weather && ` · ${e.weather}`}
                        </p>
                        {e.notes && <p className="text-xs text-gray-400 italic mt-0.5">"{e.notes}"</p>}
                      </div>
                      <button onClick={() => confirmDelete('environment_entries', e.id, e.weather ?? 'запись среды')}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1 text-lg leading-none">×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
