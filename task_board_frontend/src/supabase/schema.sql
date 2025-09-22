-- This file documents the SQL executed by the setup agent to configure the database.
-- Run these in the Supabase SQL editor if you need to reapply.

-- Tables are created via RPC, summarized in assets/supabase.md and src/supabase/schema.md

-- Primary keys and FKs (idempotent blocks)
do $$ begin
  alter table public.teams add primary key (id);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.projects add primary key (id);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.columns add primary key (id);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.tasks add primary key (id);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.chat_messages add primary key (id);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.team_members add primary key (id);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.projects
    add constraint projects_team_id_fkey foreign key (team_id) references public.teams(id) on delete cascade;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.columns
    add constraint columns_project_id_fkey foreign key (project_id) references public.projects(id) on delete cascade;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.tasks
    add constraint tasks_project_id_fkey foreign key (project_id) references public.projects(id) on delete cascade;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.tasks
    add constraint tasks_column_id_fkey foreign key (column_id) references public.columns(id) on delete cascade;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.chat_messages
    add constraint chat_messages_project_id_fkey foreign key (project_id) references public.projects(id) on delete cascade;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.team_members
    add constraint team_members_team_id_fkey foreign key (team_id) references public.teams(id) on delete cascade;
exception when duplicate_object then null; end $$;

-- Indexes
create index if not exists idx_projects_team on public.projects(team_id);
create index if not exists idx_columns_project on public.columns(project_id);
create index if not exists idx_tasks_project on public.tasks(project_id);
create index if not exists idx_tasks_column on public.tasks(column_id);
create index if not exists idx_chat_messages_project on public.chat_messages(project_id);
create index if not exists idx_team_members_team on public.team_members(team_id);

-- RLS
alter table public.teams enable row level security;
alter table public.projects enable row level security;
alter table public.columns enable row level security;
alter table public.tasks enable row level security;
alter table public.chat_messages enable row level security;
alter table public.team_members enable row level security;

-- Policies
drop policy if exists "Read own teams" on public.teams;
create policy "Read own teams" on public.teams
  for select using (exists (
    select 1 from public.team_members tm
    where tm.team_id = teams.id and tm.user_id = auth.uid()
  ));

drop policy if exists "Read team projects" on public.projects;
create policy "Read team projects" on public.projects
  for select using (exists (
    select 1 from public.team_members tm
    where tm.team_id = projects.team_id and tm.user_id = auth.uid()
  ));

drop policy if exists "Read project columns" on public.columns;
create policy "Read project columns" on public.columns
  for select using (exists (
    select 1 from public.projects p
    join public.team_members tm on tm.team_id = p.team_id
    where p.id = columns.project_id and tm.user_id = auth.uid()
  ));

drop policy if exists "Read project tasks" on public.tasks;
create policy "Read project tasks" on public.tasks
  for select using (exists (
    select 1 from public.projects p
    join public.team_members tm on tm.team_id = p.team_id
    where p.id = tasks.project_id and tm.user_id = auth.uid()
  ));

drop policy if exists "Write project tasks" on public.tasks;
create policy "Write project tasks" on public.tasks
  for all using (exists (
    select 1 from public.projects p
    join public.team_members tm on tm.team_id = p.team_id
    where p.id = tasks.project_id and tm.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.projects p
    join public.team_members tm on tm.team_id = p.team_id
    where p.id = tasks.project_id and tm.user_id = auth.uid()
  ));

drop policy if exists "Manage project columns" on public.columns;
create policy "Manage project columns" on public.columns
  for all using (exists (
    select 1 from public.projects p
    join public.team_members tm on tm.team_id = p.team_id
    where p.id = columns.project_id and tm.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.projects p
    join public.team_members tm on tm.team_id = p.team_id
    where p.id = columns.project_id and tm.user_id = auth.uid()
  ));

drop policy if exists "Read project chat" on public.chat_messages;
create policy "Read project chat" on public.chat_messages
  for select using (exists (
    select 1 from public.projects p
    join public.team_members tm on tm.team_id = p.team_id
    where p.id = chat_messages.project_id and tm.user_id = auth.uid()
  ));

drop policy if exists "Insert project chat" on public.chat_messages;
create policy "Insert project chat" on public.chat_messages
  for insert with check (exists (
    select 1 from public.projects p
    join public.team_members tm on tm.team_id = p.team_id
    where p.id = chat_messages.project_id and tm.user_id = auth.uid()
  ));

drop policy if exists "Read own team members" on public.team_members;
create policy "Read own team members" on public.team_members
  for select using (exists (
    select 1 from public.team_members tm2
    where tm2.team_id = team_members.team_id and tm2.user_id = auth.uid()
  ));
