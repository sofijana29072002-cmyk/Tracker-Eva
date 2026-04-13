# 🌿 Атопи-трекер — Инструкция по деплою

## 1. Supabase — создание проекта

1. Зайдите на [supabase.com](https://supabase.com) → New Project
2. Выберите организацию, задайте имя и пароль БД
3. После создания перейдите в **Settings → API** и скопируйте:
   - `Project URL`
   - `anon public` ключ

### Применить миграцию БД

В Supabase Dashboard → **SQL Editor** вставьте содержимое файла:
```
supabase/migrations/001_init.sql
```
Нажмите **Run**. Будут созданы все 6 таблиц с RLS-политиками и Storage bucket для фото.

### Настройка Auth (Magic Link)

В Supabase Dashboard → **Authentication → Email Templates**:
- Убедитесь, что **Magic Link** включён (включён по умолчанию)

В **Authentication → URL Configuration** добавьте:
```
Site URL: https://ваш-домен.vercel.app
Redirect URLs: https://ваш-домен.vercel.app/auth/callback
```

---

## 2. Локальная разработка

```bash
# 1. Скопируйте переменные окружения
cp .env.local.example .env.local

# 2. Вставьте ваши данные Supabase в .env.local:
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...

# 3. Установите зависимости
npm install

# 4. Запустите дев-сервер
npm run dev
# → http://localhost:3000
```

---

## 3. Деплой на Vercel

### Вариант А — через GitHub (рекомендуется)

1. Загрузите проект на GitHub
2. Войдите на [vercel.com](https://vercel.com) → **New Project**
3. Импортируйте репозиторий
4. В разделе **Environment Variables** добавьте:
   ```
   NEXT_PUBLIC_SUPABASE_URL     → ваш URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY → ваш ключ
   ```
5. Нажмите **Deploy**

### Вариант Б — через Vercel CLI

```bash
npm i -g vercel
vercel login
vercel

# Добавьте секреты через CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Деплой в прод:
vercel --prod
```

---

## 4. Структура проекта

```
app/
  page.tsx              ← Дашборд
  log/page.tsx          ← Добавление записей (5 форм)
  history/page.tsx      ← Дневник / таймлайн
  analytics/page.tsx    ← Корреляции и графики
  settings/page.tsx     ← Настройки + экспорт CSV
  auth/login/page.tsx   ← Вход (Magic Link)
  auth/callback/route   ← OAuth callback
  api/export/route      ← CSV-экспорт

components/
  forms/     ← FoodForm, ContactForm, SkinForm, MedForm, EnvForm
  dashboard/ ← DashboardClient
  history/   ← HistoryClient (таймлайн)
  analytics/ ← AnalyticsClient (графики, корреляции)
  settings/  ← SettingsClient
  layout/    ← AppShell (навигация)
  ui/        ← Переиспользуемые компоненты

lib/supabase/
  client.ts   ← Браузерный клиент
  server.ts   ← Серверный клиент (RSC)
  middleware.ts
  types.ts    ← TypeScript типы

supabase/migrations/
  001_init.sql ← Все таблицы + RLS + Storage
```

---

## 5. Возможности приложения

- ✅ Авторизация через Magic Link (без пароля)
- ✅ Запись питания с автосаджестом
- ✅ Запись контактов (химия, ткань, животные...)
- ✅ Оценка состояния кожи 1–5 с фото
- ✅ Учёт лекарств и эмолентов
- ✅ Данные среды (температура, влажность)
- ✅ Дашборд с 7-дневным мини-календарём
- ✅ Дневник (таймлайн 30 дней)
- ✅ Корреляционный анализ: что вызывает обострения
- ✅ CSV-экспорт для врача
- ✅ RLS — данные видит только владелец
- ✅ Mobile-first UI

---

## 6. Часто задаваемые вопросы

**Q: Забыл email для входа?**
Попробуйте тот же email — каждая ссылка работает 1 час.

**Q: Фото не загружаются?**
Проверьте, что в Supabase Dashboard → Storage → `skin-photos` бакет создан и политики RLS применены.

**Q: Как обновить зависимости?**
```bash
npx npm-check-updates -u && npm install
```
