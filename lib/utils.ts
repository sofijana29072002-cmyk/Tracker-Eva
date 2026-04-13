import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, fmt = 'd MMMM yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: ru })
}

export function formatTime(time: string | null | undefined) {
  if (!time) return ''
  return time.slice(0, 5)
}

export function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function nowTime() {
  return new Date().toTimeString().slice(0, 5)
}

export const SEVERITY_COLORS: Record<number, string> = {
  1: 'bg-sage-400 text-white',
  2: 'bg-yellow-300 text-yellow-900',
  3: 'bg-orange-300 text-orange-900',
  4: 'bg-orange-500 text-white',
  5: 'bg-red-500 text-white',
}

export const SEVERITY_LABELS: Record<number, string> = {
  1: 'Чисто',
  2: 'Лёгкое',
  3: 'Умеренное',
  4: 'Сильное',
  5: 'Обострение',
}

export const SEVERITY_BG: Record<number, string> = {
  1: '#64aa68',
  2: '#fcd34d',
  3: '#fb923c',
  4: '#f97316',
  5: '#ef4444',
}

export const FOOD_CATEGORIES = [
  'молочное', 'глютен', 'фрукты', 'овощи', 'мясо',
  'рыба', 'яйца', 'орехи', 'сладкое', 'напитки', 'другое',
]

export const CONTACT_TYPES = [
  'бытовая химия', 'косметика', 'ткань/одежда', 'животные',
  'пыль', 'пыльца', 'вода', 'солнце', 'другое',
]

export const BODY_AREAS = [
  'щёки', 'лоб', 'шея', 'грудь', 'живот', 'спина',
  'локти', 'колени', 'руки', 'ноги', 'ягодицы', 'всё тело',
]

export const SYMPTOMS = [
  'сухость', 'покраснение', 'зуд', 'шелушение', 'мокнутие', 'корки', 'отёк',
]

export const MED_TYPES = [
  'эмолент', 'гормональная мазь', 'антигистамин', 'антибиотик', 'пробиотик', 'другое',
]

export const WEATHER_OPTIONS = [
  'ясно', 'облачно', 'дождь', 'снег', 'ветрено', 'жарко', 'морозно', 'влажно',
]
