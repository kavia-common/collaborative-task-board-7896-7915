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
2) Ensure Supabase tables exist (see src/supabase/schema.md)
3) npm install
4) npm start

Notes:
- Realtime requires enabling Realtime on public schema and tables: columns, tasks, chat_messages.
- Configure RLS policies accordingly.
