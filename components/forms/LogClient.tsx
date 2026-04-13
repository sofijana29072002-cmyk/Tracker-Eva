'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import FoodForm from './FoodForm'
import ContactForm from './ContactForm'
import SkinForm from './SkinForm'
import MedForm from './MedForm'
import EnvForm from './EnvForm'

const TABS = [
  { id: 'food',    icon: '🍎', label: 'Еда'       },
  { id: 'contact', icon: '🧴', label: 'Контакт'   },
  { id: 'skin',    icon: '🩹', label: 'Кожа'      },
  { id: 'med',     icon: '💊', label: 'Лекарство' },
  { id: 'env',     icon: '🌡️', label: 'Среда'     },
]

export default function LogClient({ userId }: { userId: string }) {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') ?? 'food'
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className="max-w-lg mx-auto">
      <div className="p-4 pb-2">
        <h1 className="text-xl font-bold text-gray-800">Добавить запись</h1>
      </div>

      {/* Tabs */}
      <div className="px-4 pb-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap min-w-[60px]',
                activeTab === tab.id
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form content */}
      <div className="px-4 pb-4">
        {activeTab === 'food'    && <FoodForm userId={userId} />}
        {activeTab === 'contact' && <ContactForm userId={userId} />}
        {activeTab === 'skin'    && <SkinForm userId={userId} />}
        {activeTab === 'med'     && <MedForm userId={userId} />}
        {activeTab === 'env'     && <EnvForm userId={userId} />}
      </div>
    </div>
  )
}
