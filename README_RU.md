# VictoryLife — web-first MVP

Стиль: Apple / victoryagency, чёрно-белая база + синий акцент.
Функции: баллы, задачи, категории, анимированная аналитика, цели, достижения, мудрость дня, комментарий дня, Твой коуч через DeepSeek, Google Auth через Supabase.

## Быстрый запуск локально

```bash
npm install
copy .env.example .env.local
npm run dev
```

Открыть: http://localhost:3000

## Env

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_MODEL=deepseek-v4-flash
```

## Supabase

1. Создать проект в Supabase.
2. SQL Editor -> New query -> вставить `supabase/schema.sql` -> Run.
3. New query -> вставить `supabase/seed.sql` -> Run.
4. Authentication -> Providers -> Google -> включить.
5. Вставить Google Client ID и Secret.

## DeepSeek

Ключ хранить только в `.env.local` и в env-переменных Vercel. Не вставлять в frontend.

## Логотип

Файлы лежат в `public/logo` и `public/icons`.
