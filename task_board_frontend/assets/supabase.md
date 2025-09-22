# Supabase Integration (Configured)

This project is integrated with Supabase for:
- Authentication (magic link and OAuth sample)
- Realtime updates (columns, tasks, chat_messages)
- Database tables and RLS policies for team-based access

Environment variables (set via .env in task_board_frontend):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY
- REACT_APP_SITE_URL (optional; used for emailRedirectTo and OAuth redirect; falls back to window.location.origin)

What we configured (server-side):
- Tables: teams, projects, columns, tasks, chat_messages, team_members
- Primary keys and foreign keys
- Indexes for common filters
- Row Level Security (RLS) enabled with membership-based policies
- Realtime enabled (remember to enable realtime in Dashboard)

Database schema summary:
- teams: { id uuid pk default gen_random_uuid(), name text not null }
- projects: { id uuid pk, name text not null, team_id uuid fk(teams.id) }
- columns: { id uuid pk, title text not null, slug text, position int default 0, project_id uuid fk(projects.id) }
- tasks: {
    id uuid pk,
    title text not null,
    description text,
    status text,
    label text,
    assignee text,
    position int default 0,
    column_id uuid fk(columns.id),
    project_id uuid fk(projects.id),
    created_at timestamptz default now()
  }
- chat_messages: { id uuid pk, project_id uuid fk(projects.id), user_id uuid, content text not null, created_at timestamptz default now() }
- team_members: { id uuid pk, team_id uuid fk(teams.id), user_id uuid, email text, display_name text }

RLS Policies summary:
- teams: Authenticated users can select teams they belong to via team_members.
- projects: Members of a team can select the team’s projects.
- columns: Members can select and manage columns for projects in their teams.
- tasks: Members can select and manage tasks for projects in their teams.
- chat_messages: Members can select and insert messages for projects in their teams.
- team_members: Members can read membership rows for teams they are part of.

Auth flows in the app:
- Email magic link: client.auth.signInWithOtp({ email, options: { emailRedirectTo: REACT_APP_SITE_URL || window.location.origin } })
- OAuth example: GitHub (enabled in Dashboard), using redirectTo similar to above

Realtime:
- The app subscribes to changes for columns, tasks, chat_messages using client.channel().on('postgres_changes', { event: '*', schema: 'public' }, ...)

Client code integration:
- Supabase client is initialized in src/supabase/SupabaseContext.js using REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY
- Board, ChatPanel, Navbar, Sidebar consume the client for CRUD and realtime

Required steps in Supabase Dashboard:
1) Authentication
   - Go to Authentication > URL Configuration
   - Site URL: set to your production domain or local dev URL
   - Redirect URLs allowlist: include
       http://localhost:3000/**
       https://yourapp.com/**
   - Enable Email (Magic Link) and optionally GitHub under Providers
   - For GitHub, set the callback to: {Site URL}/
   - Recommended: update email templates (Login, Invite) as desired

2) Database
   - The following tables and policies have been created by automation, but verify they exist and Realtime is enabled:
     - Tables: teams, projects, columns, tasks, chat_messages, team_members
     - RLS: enabled on all above tables
     - Policies: as described above
   - Enable Realtime for public schema and ensure tables: columns, tasks, chat_messages are selected

3) Secrets Management (optional)
   - If you plan to store integration secrets, consider creating a secure table or use Supabase Vault. The app only uses REACT_APP_SUPABASE_URL/KEY.

Environment setup:
- Copy .env.example to .env and set:
  REACT_APP_SUPABASE_URL="https://<your-project-ref>.supabase.co"
  REACT_APP_SUPABASE_KEY="<anon public key>"
  REACT_APP_SITE_URL="http://localhost:3000"   # optional, recommended
- Restart the dev server after changes.

Notes:
- Never hardcode URLs in auth methods; always derive from REACT_APP_SITE_URL or window.location.origin
- Include both localhost and production URLs in Supabase Authentication redirect allowlist.

Troubleshooting:
- If you cannot see data or subscriptions miss updates, verify:
  - RLS policies allow your authenticated user (auth.uid()) via team_members
  - Realtime is enabled on the correct tables in the correct schema
  - Environment variables are correctly set (React requires REACT_APP_ prefix)
  - Browser console for errors (CORS or redirect allowlist)
