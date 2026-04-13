'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-skin-50 via-cream-50 to-sage-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-lg mb-4 text-4xl">
            🌿
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Атопи-трекер</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Дневник питания и кожи для вашего малыша
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📩</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Письмо отправлено!
              </h2>
              <p className="text-gray-500 text-sm">
                Проверьте почту{' '}
                <span className="font-medium text-gray-700">{email}</span>{' '}
                и нажмите на ссылку для входа.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-skin-600 text-sm underline"
              >
                Использовать другой адрес
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                Войти без пароля
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Введите email — мы пришлём магическую ссылку для входа.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mama@example.com"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-skin-300 focus:border-transparent text-gray-800 placeholder-gray-400"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 px-6 bg-skin-500 hover:bg-skin-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-2xl transition-colors min-h-[44px]"
                >
                  {loading ? 'Отправка...' : 'Получить ссылку для входа'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Ваши данные хранятся безопасно и видны только вам
        </p>
      </div>
    </div>
  )
}
