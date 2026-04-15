'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Неверный email или пароль')
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-skin-50 via-cream-50 to-sage-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-lg mb-4 text-4xl">🌿</div>
          <h1 className="text-2xl font-bold text-gray-800">Атопи-трекер</h1>
          <p className="text-gray-500 mt-1 text-sm">Дневник питания и кожи для вашего малыша</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Вход</h2>
          <p className="text-gray-500 text-sm mb-6">Введите email и пароль</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="mama@example.com" className="input" />
            </div>
            <div>
              <label className="label">Пароль</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className="input" />
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
            <button type="submit" disabled={loading || !email || !password}
              className="w-full py-3 px-6 bg-skin-500 hover:bg-skin-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-2xl transition-colors min-h-[44px]">
              {loading ? 'Вхожу...' : 'Войти'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Ваши данные хранятся безопасно и видны только вам</p>
      </div>
    </div>
  )
}
