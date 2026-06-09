-- VictoryLife Supabase schema
-- Запускать в Supabase: SQL Editor -> New query -> вставить -> Run.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  key text not null,
  title text not null,
  icon text,
  color text default '#0A84FF',
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  category_key text not null,
  title text not null,
  points_positive int not null default 10,
  points_negative int not null default 0,
  is_default boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  total_score int not null default 0,
  comment text,
  mood int,
  created_at timestamptz default now(),
  unique(user_id, date)
);

create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade,
  date date not null,
  status text not null check (status in ('done', 'missed', 'skip')),
  earned_points int not null default 0,
  created_at timestamptz default now(),
  unique(user_id, task_id, date)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('daily', 'monthly', 'yearly')),
  title text not null,
  target_value numeric not null default 0,
  current_value numeric not null default 0,
  unit text default 'points',
  deadline date,
  is_auto_generated boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  description text,
  icon text,
  rarity text default 'base'
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  achievement_id uuid references public.achievements(id) on delete cascade not null,
  unlocked_at timestamptz default now(),
  unique(user_id, achievement_id)
);

create table if not exists public.wisdom_quotes (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  quote text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.coach_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  prompt_payload jsonb,
  response_text text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tasks enable row level security;
alter table public.daily_logs enable row level security;
alter table public.task_completions enable row level security;
alter table public.goals enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.wisdom_quotes enable row level security;
alter table public.coach_sessions enable row level security;

-- Профиль
create policy "profiles select own" on public.profiles for select using (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);

-- Пользовательские данные
create policy "categories own or default select" on public.categories for select using (user_id = auth.uid() or is_default = true);
create policy "categories own insert" on public.categories for insert with check (user_id = auth.uid());
create policy "categories own update" on public.categories for update using (user_id = auth.uid());
create policy "categories own delete" on public.categories for delete using (user_id = auth.uid());

create policy "tasks own or default select" on public.tasks for select using (user_id = auth.uid() or is_default = true);
create policy "tasks own insert" on public.tasks for insert with check (user_id = auth.uid());
create policy "tasks own update" on public.tasks for update using (user_id = auth.uid());
create policy "tasks own delete" on public.tasks for delete using (user_id = auth.uid());

create policy "daily logs own all" on public.daily_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "task completions own all" on public.task_completions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "goals own all" on public.goals for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "user achievements own all" on public.user_achievements for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "coach sessions own all" on public.coach_sessions for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Публичные справочники
create policy "achievements public select" on public.achievements for select using (true);
create policy "quotes public select" on public.wisdom_quotes for select using (is_active = true);

-- Автосоздание профиля после Google-регистрации
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
