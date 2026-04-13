'use client'

import { useState, useMemo } from 'react'
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

const FILTER_TABS: { id: FilterType; icon: string; label: string }[] = [
  { id: 'all',     icon: '📋', label: 'Всё'        },
  { id: 'skin',    icon: '🩹', label: 'Кожа'       },
  { id: 'food',    icon: '🍎', label: 'Еда'        },
  { id: 'contact', icon: '🧴', label: 'Контакт'    },
  { id: 'med',     icon: '💊', label: 'Лекарства'  },
  { id: 'env',     icon: '🌡️', label: 'Среда'      },
]

export default function HistoryClient({ foodEntries, contactEntries, skinEntries, medications, envEntries }: Props) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')

  // Group everything by date
  const dateMap = useMemo(() => {
    const map = new Map<string, {
      skin: SkinEntry[]
      food: FoodEntry[]
      contact: ContactEntry[]
      med: Medication[]
      env: EnvironmentEntry[]
    }>()

    const ensure = (date: string) => {
      if (!map.has(date)) map.set(date, { skin: [], food: [], contact: [], med: [], env: [] })
      return map.get(date)!
    }

    if (filter === 'all' || filter === 'skin')    skinEntries.forEach((e)    => ensure(e.date).skin.push(e))
    if (filter === 'all' || filter === 'food')    foodEntries.filter(e => !search || e.food_name.toLowerCase().includes(search.toLowerCase())).forEach((e) => ensure(e.date).food.push(e))
    if (filter === 'all' || filter === 'contact') contactEntries.filter(e => !search || e.contact_name.toLowerCase().includes(search.toLowerCase())).forEach((e) => ensure(e.date).contact.push(e))
    if (filter === 'all' || filter === 'med')     medications.forEach((e)    => ensure(e.date).med.push(e))
    if (filter === 'all' || filter === 'env')     envEntries.forEach((e)     => ensure(e.date).env.push(e))

    return new Map([...map.entries()].sort((a, b) => b[0].localeCompare(a[0])))
  }, [filter, search, foodEntries, contactEntries, skinEntries, medications, envEntries])

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Дневник</h1>
        <p className="text-sm text-gray-500">Последние 30 дней</p>
      </div>

      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Поиск по продукту или контакту..."
        className="input"
      />

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-skin-500 text-white'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {dateMap.size === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>Записей пока нет</p>
        </div>
      ) : (
        [...dateMap.entries()].map(([date, entries]) => {
          const hasEntries =
            entries.skin.length + entries.food.length +
            entries.contact.length + entries.med.length + entries.env.length > 0
          if (!hasEntries) return null
          const skin = entries.skin[0]

          return (
            <div key={date} className="relative">
              {/* Date header */}
              <div className="flex items-center gap-3 mb-2">
                <div className="text-sm font-semibold text-gray-700">
                  {formatDate(date, 'd MMMM, EEE')}
                </div>
                {skin && (
                  <div
                    className="h-2 flex-1 rounded-full"
                    style={{ backgroundColor: SEVERITY_BG[skin.severity] ?? '#e5e7eb' }}
                  />
                )}
                {skin && <SeverityBadge severity={skin.severity} />}
              </div>

              <div className="space-y-2 ml-2 border-l-2 border-gray-100 pl-4">
                {/* Skin entries */}
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
                        {e.photo_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={e.photo_url} alt="skin" className="mt-2 w-20 h-20 rounded-xl object-cover" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Food entries */}
                {entries.food.length > 0 && (
                  <div className="card py-3">
                    <div className="flex items-start gap-2">
                      <span>🍎</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Еда ({entries.food.length})</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {entries.food.map((f) => (
                            <span key={f.id} className={`badge text-xs ${f.is_new_product ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                              {f.food_name}{f.is_new_product ? ' ✨' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact entries */}
                {entries.contact.map((e) => (
                  <div key={e.id} className="card py-3">
                    <div className="flex items-start gap-2">
                      <span>🧴</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{e.contact_name}</p>
                        <p className="text-xs text-gray-400">{e.contact_type}{e.body_area ? ` · ${e.body_area}` : ''}</p>
                      </div>
                      {e.time && <span className="text-xs text-gray-400">{formatTime(e.time)}</span>}
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
