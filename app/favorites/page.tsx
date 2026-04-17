'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { FOOD_CATEGORIES } from '@/lib/utils'
import Link from 'next/link'

interface FavoriteItem {
  id: string
  item_name: string
  category: string | null
  notes: string | null
  created_at: string
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'молочное': '🥛', 'глютен': '🌾', 'фрукты': '🍎', 'овощи': '🥦',
  'мясо': '🥩', 'рыба': '🐟', 'яйца': '🥚', 'орехи': '🥜',
  'сладкое': '🍯', 'напитки': '🥤', 'другое': '🍽️',
}

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [form, setForm] = useState({ item_name: '', category: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const fetchItems = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('favorite_items')
      .select('*')
      .eq('user_id', user.id)
      .order('item_name')
    setItems((data as FavoriteItem[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.item_name.trim()) return toast.error('Введите название продукта')
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('favorite_items').insert({
      user_id: user.id,
      item_name: form.item_name.trim(),
      category: form.category || null,
      notes: form.notes || null,
    })

    setSaving(false)
    if (error?.code === '23505') {
      toast.error('Этот продукт уже в избранном')
    } else if (error) {
      toast.error('Ошибка при сохранении')
    } else {
      toast.success('❤️ Добавлено в избранное!')
      setForm({ item_name: '', category: '', notes: '' })
      setShowForm(false)
      fetchItems()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Убрать "${name}" из избранного?`)) return
    setItems((p) => p.filter((i) => i.id !== id))
    await supabase.from('favorite_items').delete().eq('id', id)
    toast.success('Убрано из избранного')
  }

  const filtered = items
    .filter((i) => !search || i.item_name.toLowerCase().includes(search.toLowerCase()))
    .filter((i) => !filterCat || i.category === filterCat)

  const grouped = FOOD_CATEGORIES.reduce<Record<string, FavoriteItem[]>>((acc, cat) => {
    const catItems = filtered.filter((i) => i.category === cat)
    if (catItems.length > 0) acc[cat] = catItems
    return acc
  }, {})
  const uncategorized = filtered.filter((i) => !i.category)

  return (
    <AppShell>
      <div className="max-w-lg mx-auto p-4 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">❤️ Избранное</h1>
            <p className="text-sm text-gray-500 mt-0.5">Любимые безопасные продукты</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4">
            {showForm ? 'Отмена' : '+ Добавить'}
          </button>
        </div>

        {/* Stats */}
        <div className="card flex items-center gap-4 py-4">
          <span className="text-4xl">❤️</span>
          <div>
            <p className="text-2xl font-bold text-skin-500">{items.length}</p>
            <p className="text-sm text-gray-500">любимых продуктов</p>
          </div>
          <Link href="/blacklist" className="ml-auto btn-secondary text-sm py-2 px-3">
            🚫 Запреты
          </Link>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="card border-pink-100 bg-pink-50">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Новый любимый продукт</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="label">Название *</label>
                <input type="text" value={form.item_name}
                  onChange={(e) => setForm((f) => ({ ...f, item_name: e.target.value }))}
                  placeholder="Например: гречневая каша"
                  className="input bg-white" />
              </div>
              <div>
                <label className="label">Категория</label>
                <select value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="input bg-white">
                  <option value="">— выберите —</option>
                  {FOOD_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Заметки</label>
                <input type="text" value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Хорошо переносит, любит..."
                  className="input bg-white" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-semibold transition-colors min-h-[44px]">
                {saving ? 'Сохраняю...' : '❤️ Добавить в избранное'}
              </button>
            </form>
          </div>
        )}

        {/* Search + filter */}
        <div className="space-y-2">
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Поиск по названию..." className="input" />
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setFilterCat('')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                !filterCat ? 'bg-pink-500 text-white' : 'bg-white text-gray-500 border border-gray-200'
              }`}>
              Все
            </button>
            {FOOD_CATEGORIES.filter((c) => items.some((i) => i.category === c)).map((cat) => (
              <button key={cat} onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  filterCat === cat ? 'bg-pink-500 text-white' : 'bg-white text-gray-500 border border-gray-200'
                }`}>
                {CATEGORY_EMOJIS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((n) => <div key={n} className="card animate-pulse h-14" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">❤️</p>
            <p className="font-medium text-gray-600">Список пуст</p>
            <p className="text-sm mt-1">Добавьте продукты, которые малыш хорошо переносит</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* По категориям */}
            {Object.entries(grouped).map(([cat, catItems]) => (
              <div key={cat} className="card">
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  {CATEGORY_EMOJIS[cat]} {cat}
                </p>
                <div className="space-y-1">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 py-1.5">
                      <span className="text-pink-400">❤️</span>
                      <div className="flex-1">
                        <span className="text-sm text-gray-800 font-medium">{item.item_name}</span>
                        {item.notes && <span className="text-xs text-gray-400 ml-2">· {item.notes}</span>}
                      </div>
                      <button onClick={() => handleDelete(item.id, item.item_name)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1 text-lg leading-none">×</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Без категории */}
            {uncategorized.length > 0 && (
              <div className="card">
                <p className="text-sm font-semibold text-gray-600 mb-2">🍽️ Разное</p>
                <div className="space-y-1">
                  {uncategorized.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 py-1.5">
                      <span className="text-pink-400">❤️</span>
                      <div className="flex-1">
                        <span className="text-sm text-gray-800 font-medium">{item.item_name}</span>
                        {item.notes && <span className="text-xs text-gray-400 ml-2">· {item.notes}</span>}
                      </div>
                      <button onClick={() => handleDelete(item.id, item.item_name)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1 text-lg leading-none">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
