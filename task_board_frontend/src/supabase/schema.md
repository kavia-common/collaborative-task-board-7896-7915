Supabase schema (reference)

Tables:
- teams: { id uuid pk, name text }
- projects: { id uuid pk, name text, team_id uuid fk(teams.id) }
- columns: { id uuid pk, title text, slug text, position int, project_id uuid fk(projects.id) }
- tasks: {
    id uuid pk,
    title text,
    description text,
    status text,
    label text,
    assignee text,
    position int,
    column_id uuid fk(columns.id),
    project_id uuid fk(projects.id),
    created_at timestamptz default now()
  }
- chat_messages: { id uuid pk, project_id uuid, user_id uuid, content text, created_at timestamptz default now() }

Realtime:
- Enable Realtime on public schema for columns, tasks, chat_messages.

RLS:
- Configure policies to allow authenticated users to select/insert/update/delete rows as needed per project/team membership.
