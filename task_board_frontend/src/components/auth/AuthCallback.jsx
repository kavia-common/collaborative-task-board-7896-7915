import React, { useEffect } from 'react';
import { useSupabase } from '../../supabase/SupabaseContext';

export default function AuthCallback() {
  const { client } = useSupabase();

  useEffect(() => {
    const run = async () => {
      try {
        // For supabase-js v2: getSessionFromUrl is handled by exchangeCodeForSession
        const { error } = await client.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          // eslint-disable-next-line no-console
          console.error('Auth callback error:', error);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Auth callback exception:', e);
      } finally {
        // Redirect to main app
        window.location.replace('/');
      }
    };
    run();
  }, [client]);

  return <div style={{ padding: 24 }}>Processing authentication...</div>;
}
