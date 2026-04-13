'use client'

import { useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from 'recharts'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { SEVERITY_LABELS, SEVERITY_BG } from '@/lib/utils'

interface SkinPoint { id: string; date: string; severity: number }
interface FoodPoint { id: string; date: string; food_name: string; category: string | null; is_new_product: boolean }
interface ContactPoint { id: string; date: string; contact_name: string; contact_type: string }

interface Props {
  skinEntries: SkinPoint[]
  foodEntries: FoodPoint[]
  contactEntries: ContactPoint[]
}

interface CorrelationRow {
  name: string
  type: 'food' | 'contact'
  count: number
  avgSeverityAfter: number
  globalAvg: number
  delta: number
  suspicious: boolean
}

function computeCorrelations(
  skinEntries: SkinPoint[],
  items: (FoodPoint | ContactPoint)[],
  nameKey: 'food_name' | 'contact_name',
  type: 'food' | 'contact',
  windowDays = 2
): CorrelationRow[] {
  if (skinEntries.length === 0 || items.length === 0) return []

  const globalAvg = skinEntries.reduce((s, e) => s + e.severity, 0) / skinEntries.length

  // Group by name
  const nameMap = new Map<string, (FoodPoint | ContactPoint)[]>()
  for (const item of items) {
    const name = (item as Record<string, string>)[nameKey]
    if (!nameMap.has(name)) nameMap.set(name, [])
    nameMap.get(name)!.push(item)
  }

  const rows: CorrelationRow[] = []
  for (const [name, occurrences] of nameMap.entries()) {
    const severitiesAfter: number[] = []

    for (const occ of occurrences) {
      const occDate = parseISO(occ.date)
      for (const skin of skinEntries) {
        const skinDate = parseISO(skin.date)
        const diff = differenceInDays(skinDate, occDate)
        if (diff >= 0 && diff <= windowDays) {
          severitiesAfter.push(skin.severity)
        }
      }
    }

    if (severitiesAfter.length === 0) continue

    const avgAfter = severitiesAfter.reduce((s, v) => s + v, 0) / severitiesAfter.length
    const delta = avgAfter - globalAvg

    rows.push({
      name,
      type,
      count: occurrences.length,
      avgSeverityAfter: Math.round(avgAfter * 10) / 10,
      globalAvg: Math.round(globalAvg * 10) / 10,
      delta: Math.round(delta * 10) / 10,
      suspicious: delta > 0.5,
    })
  }

  return rows.sort((a, b) => b.delta - a.delta)
}

export default function AnalyticsClient({ skinEntries, foodEntries, contactEntries }: Props) {
  const [period, setPeriod] = useState<30 | 60>(30)

  const filteredSkin = useMemo(() => {
    const cutoff = new Date(Date.now() - period * 86400000).toISOString().split('T')[0]
    return skinEntries.filter((e) => e.date >= cutoff)
  }, [skinEntries, period])

  const filteredFood = useMemo(() => {
    const cutoff = new Date(Date.now() - period * 86400000).toISOString().split('T')[0]
    return foodEntries.filter((e) => e.date >= cutoff)
  }, [foodEntries, period])

  const filteredContact = useMemo(() => {
    const cutoff = new Date(Date.now() - period * 86400000).toISOString().split('T')[0]
    return contactEntries.filter((e) => e.date >= cutoff)
  }, [contactEntries, period])

  // Chart data
  const chartData = useMemo(() =>
    filteredSkin.map((e) => ({
      date: format(parseISO(e.date), 'd MMM', { locale: ru }),
      severity: e.severity,
      label: SEVERITY_LABELS[e.severity],
    }))
  , [filteredSkin])

  // Correlations
  const foodCorr = useMemo(() =>
    computeCorrelations(filteredSkin, filteredFood, 'food_name', 'food')
  , [filteredSkin, filteredFood])

  const contactCorr = useMemo(() =>
    computeCorrelations(filteredSkin, filteredContact, 'contact_name', 'contact')
  , [filteredSkin, filteredContact])

  const allCorr = useMemo(() =>
    [...foodCorr, ...contactCorr].sort((a, b) => b.delta - a.delta).slice(0, 15)
  , [foodCorr, contactCorr])

  const suspicious = allCorr.filter((r) => r.suspicious)
  const globalAvg = filteredSkin.length > 0
    ? (filteredSkin.reduce((s, e) => s + e.severity, 0) / filteredSkin.length).toFixed(1)
    : '—'

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { severity: number; label: string; date: string } }[] }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-white rounded-2xl shadow-lg p-3 border border-gray-100 text-sm">
        <p className="font-semibold text-gray-700">{d.date}</p>
        <p style={{ color: SEVERITY_BG[d.severity] }}>
          {d.severity} — {d.label}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Анализ</h1>
          <p className="text-sm text-gray-500">Корреляции и тренды</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {([30, 60] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
              }`}
            >
              {p} дней
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-skin-500">{filteredSkin.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">записей кожи</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-gray-700">{globalAvg}</p>
          <p className="text-xs text-gray-500 mt-0.5">средний балл</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-red-500">{suspicious.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">подозрит.</p>
        </div>
      </div>

      {/* Line chart */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-700 mb-3">📈 Динамика кожи</p>
        {chartData.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Недостаточно данных</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={parseFloat(globalAvg as string) || 2.5} stroke="#94a3b8" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="severity"
                stroke="#ff7328"
                strokeWidth={2.5}
                dot={(props) => {
                  const { cx, cy, payload } = props
                  return (
                    <circle
                      key={`dot-${payload.date}`}
                      cx={cx} cy={cy} r={5}
                      fill={SEVERITY_BG[payload.severity] ?? '#ff7328'}
                      stroke="white"
                      strokeWidth={2}
                    />
                  )
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Suspicious items */}
      {suspicious.length > 0 && (
        <div className="card border-red-100 bg-red-50">
          <p className="text-sm font-semibold text-red-700 mb-3">⚠️ Подозрительные факторы</p>
          <p className="text-xs text-red-600 mb-3">
            После них в течение 48 ч. кожа в среднем хуже на ≥0.5 балла
          </p>
          <div className="space-y-2">
            {suspicious.map((r) => (
              <div key={r.name} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3">
                <span className="text-xl">{r.type === 'food' ? '🍎' : '🧴'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.count}× · ср. балл после: {r.avgSeverityAfter}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-500">+{r.delta}</p>
                  <p className="text-xs text-gray-400">к норме</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All correlations table */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-700 mb-3">📊 Все корреляции</p>
        {allCorr.length === 0 ? (
          <p className="text-center text-gray-400 py-4 text-sm">Недостаточно данных для анализа</p>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-4 text-xs text-gray-400 font-medium px-2 py-1">
              <span className="col-span-2">Фактор</span>
              <span className="text-center">Ср. балл</span>
              <span className="text-center">Δ к норме</span>
            </div>
            {allCorr.map((r) => (
              <div
                key={r.name}
                className={`grid grid-cols-4 items-center px-2 py-2 rounded-xl text-sm ${
                  r.suspicious ? 'bg-red-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                  <span>{r.type === 'food' ? '🍎' : '🧴'}</span>
                  <span className="truncate text-gray-700">{r.name}</span>
                  {r.suspicious && <span className="text-red-500 text-xs flex-shrink-0">⚠️</span>}
                </div>
                <div className="text-center">
                  <span
                    className="px-2 py-0.5 rounded-lg text-xs font-medium text-white"
                    style={{ backgroundColor: SEVERITY_BG[Math.round(r.avgSeverityAfter)] ?? '#9ca3af' }}
                  >
                    {r.avgSeverityAfter}
                  </span>
                </div>
                <div className={`text-center font-medium text-sm ${r.delta > 0 ? 'text-red-500' : 'text-sage-500'}`}>
                  {r.delta > 0 ? '+' : ''}{r.delta}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New products */}
      {filteredFood.filter((f) => f.is_new_product).length > 0 && (
        <div className="card">
          <p className="text-sm font-semibold text-gray-700 mb-3">✨ Новые продукты за период</p>
          <div className="flex flex-wrap gap-2">
            {filteredFood.filter((f) => f.is_new_product).map((f) => (
              <span key={f.id} className="badge bg-yellow-100 text-yellow-800 text-xs py-1 px-2">
                {f.food_name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
