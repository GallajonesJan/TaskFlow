-- ─────────────────────────────────────────────────────────────────────────────
-- TaskFlow v2 — Role, Assignment & Comments Schema
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. task_assignments ───────────────────────────────────────────────────────
create table if not exists public.task_assignments (
  id          uuid        primary key default gen_random_uuid(),
  task_id     uuid        not null references public.tasks(id) on delete cascade,
  user_id     uuid        not null references auth.users(id)   on delete cascade,
  completed   boolean     not null default false,
  assigned_at timestamptz not null default now(),
  unique(task_id, user_id)
);

-- ── 2. task_comments ──────────────────────────────────────────────────────────
create table if not exists public.task_comments (
  id         uuid        primary key default gen_random_uuid(),
  task_id    uuid        not null references public.tasks(id) on delete cascade,
  user_id    uuid        not null references auth.users(id)   on delete cascade,
  body       text        not null check (char_length(body) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── 3. profiles — make sure it has name + email ───────────────────────────────
alter table public.profiles
  add column if not exists name  text,
  add column if not exists email text;

-- ── 4. RLS — task_assignments ─────────────────────────────────────────────────
alter table public.task_assignments enable row level security;

-- Anyone can read all assignments (admin needs to see all, member needs to see own)
create policy "Read all assignments"
  on public.task_assignments for select using (true);

-- Only the assigned user can update their own completion
create policy "Member updates own completion"
  on public.task_assignments for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Insert/delete managed by backend with service key
create policy "Service role manages assignments"
  on public.task_assignments for all
  using (true);

-- ── 5. RLS — task_comments ────────────────────────────────────────────────────
alter table public.task_comments enable row level security;

-- Everyone can read comments on tasks they can see
create policy "Read all comments"
  on public.task_comments for select using (true);

-- Users can insert their own comments
create policy "Users insert own comments"
  on public.task_comments for insert
  with check (user_id = auth.uid());

-- Users can update/delete their own comments
create policy "Users manage own comments"
  on public.task_comments for all
  using (user_id = auth.uid());

-- ── 6. RLS — profiles ────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists "Users can view all profiles"  on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view all profiles"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ── 7. Auto-update updated_at on comments ─────────────────────────────────────
create or replace function public.set_comment_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists set_comment_updated_at on public.task_comments;
create trigger set_comment_updated_at
  before update on public.task_comments
  for each row execute function public.set_comment_updated_at();
