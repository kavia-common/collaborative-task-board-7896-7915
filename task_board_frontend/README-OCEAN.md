# Task Board Frontend (Ocean Professional)

Modern React task board with Supabase:
- Supabase auth (magic link + GitHub OAuth example)
- Realtime sync (tasks, columns, chat)
- Drag-and-drop (react-beautiful-dnd)
- Team/Project switchers, sidebar filters, member list
- Activity feed / chat
- Ocean Professional theme

Quick start:
1) Copy .env.example to .env and set:
   - REACT_APP_SUPABASE_URL
   - REACT_APP_SUPABASE_KEY
   - (optional) REACT_APP_SITE_URL
2) Ensure Supabase tables exist (see src/supabase/schema.md and src/supabase/schema.sql)
3) npm install
4) npm start

Important Supabase configuration:
- Authentication
  - In Supabase Dashboard > Authentication > URL Configuration:
    - Site URL: set to your dev/prod URL
    - Redirect URLs allowlist:
      * http://localhost:3000/**
      * https://yourapp.com/**
  - Enable Email (magic link) and optional GitHub provider.
  - The app uses dynamic redirects via getURL(): /auth/callback

- Database
  - Tables: teams, projects, columns, tasks, chat_messages, team_members
  - RLS enabled on all the above; membership-based policies applied
  - See assets/supabase.md and src/supabase/schema.sql for details

- Realtime
  - Enable Realtime for the public schema
  - Ensure columns, tasks, chat_messages are enabled for realtime

Notes:
- Realtime requires enabling Realtime on public schema and tables: columns, tasks, chat_messages.
- Configure RLS policies accordingly.
