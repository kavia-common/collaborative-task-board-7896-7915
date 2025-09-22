# Supabase Integration

Environment variables (set via .env):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY
- REACT_APP_SITE_URL (optional; used for emailRedirectTo and OAuth redirect, falls back to window.location.origin)

Auth:
- Email magic link via client.auth.signInWithOtp({ email, options: { emailRedirectTo: REACT_APP_SITE_URL } })
- OAuth example: GitHub provider

Realtime:
- Subscriptions on `columns`, `tasks`, `chat_messages` using client.channel().on('postgres_changes', { event: '*', schema: 'public' }, ...)

CRUD:
- Board operations implemented in src/supabase/boardService.js

Schema:
- See src/supabase/schema.md
