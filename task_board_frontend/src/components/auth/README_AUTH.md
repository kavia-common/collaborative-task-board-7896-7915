Auth callback handling

- This app includes an AuthCallback component (src/components/auth/AuthCallback.jsx) that calls supabase.auth.exchangeCodeForSession on page load, then redirects to '/'.
- If you add a router (e.g., react-router-dom), mount AuthCallback at /auth/callback route.
- In this template without a router, we rely on exchangeCodeForSession being called on any page. For stricter flows, create a route and render AuthCallback there.

Remember to configure Authentication redirects in the Supabase Dashboard to include:
- http://localhost:3000/**
- https://yourapp.com/**
