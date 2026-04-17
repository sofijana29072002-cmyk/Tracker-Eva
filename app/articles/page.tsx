'use client'

import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import { ARTICLES, CATEGORY_LABELS, type ArticleCategory } from '@/lib/articles'

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ArticleCategory[]

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | 'all'>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = activeCategory === 'all'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === activeCategory)

  const openArticle = ARTICLES.find((a) => a.id === openId)

  return (
    <AppShell>
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {openArticle ? (
          /* Article detail view */
          <div>
            <button
              onClick={() => setOpenId(null)}
              className="flex items-center gap-2 text-skin-600 text-sm font-medium mb-4"
            >
              ← Назад к статьям
            </button>
            <div className="card space-y-4">
              <div>
                <span className="text-4xl">{openArticle.emoji}</span>
                <span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-skin-100 text-skin-700">
                  {CATEGORY_LABELS[openArticle.category]}
                </span>
                <h1 className="text-xl font-bold text-gray-800 mt-2">{openArticle.title}</h1>
              </div>

              {openArticle.content.map((section, i) => (
                <div key={i}>
                  {section.heading && (
                    <h2 className="font-semibold text-gray-800 mt-2 mb-1">{section.heading}</h2>
                  )}
                  {section.text && (
                    <p className="text-gray-600 text-sm leading-relaxed">{section.text}</p>
                  )}
                  {section.list && (
                    <ul className="space-y-1 mt-1">
                      {section.list.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-skin-400 mt-0.5 flex-shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.tip && (
                    <div className="bg-sage-50 border border-sage-200 rounded-2xl p-3 mt-2">
                      <p className="text-sm text-sage-800">💡 {section.tip}</p>
                    </div>
                  )}
                  {section.warning && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mt-2">
                      <p className="text-sm text-red-800">⚠️ {section.warning}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Article list view */
          <>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Статьи и советы</h1>
              <p className="text-sm text-gray-500">Медицинские рекомендации по АД</p>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  activeCategory === 'all' ? 'bg-skin-500 text-white' : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                📋 Все
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                    activeCategory === cat ? 'bg-skin-500 text-white' : 'bg-white text-gray-500 border border-gray-200'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Article cards */}
            <div className="space-y-3">
              {filtered.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setOpenId(article.id)}
                  className="card w-full text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0">{article.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">{CATEGORY_LABELS[article.category]}</span>
                      </div>
                      <p className="font-semibold text-gray-800 text-sm">{article.title}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{article.summary}</p>
                    </div>
                    <span className="text-gray-300 flex-shrink-0">→</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="card bg-cream-50 border-cream-200">
              <p className="text-xs text-gray-500 text-center">
                📋 Материалы основаны на клинических рекомендациях по лечению атопического дерматита.
                Не заменяют консультацию врача.
              </p>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
