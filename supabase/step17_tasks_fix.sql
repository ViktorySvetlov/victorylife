-- VictoryLife Step 17 fix
-- Запусти этот SQL в Supabase SQL Editor, если задания зависают на «Загружаю...»
-- или кнопки «Вернуть стандартные» / «Добавить задание» ничего не делают.

alter table public.tasks
  add column if not exists is_active boolean default true;

update public.tasks
set is_active = true
where is_active is null;

alter table public.tasks
  alter column is_active set default true;

-- Доступ к своим задачам. Блоки безопасны: если политика уже есть, ошибки не будет.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks own or default select'
  ) then
    create policy "tasks own or default select" on public.tasks for select using (user_id = auth.uid() or is_default = true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks own insert'
  ) then
    create policy "tasks own insert" on public.tasks for insert with check (user_id = auth.uid());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks own update'
  ) then
    create policy "tasks own update" on public.tasks for update using (user_id = auth.uid());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks own delete'
  ) then
    create policy "tasks own delete" on public.tasks for delete using (user_id = auth.uid());
  end if;
end $$;
