import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// PUBLIC_INTERFACE
export const SupabaseContext = createContext(null);

/**
 * PUBLIC_INTERFACE
 * SupabaseProvider
 * This context provider initializes a Supabase client using environment variables:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_KEY
 * It exposes auth state (user, session) and convenience methods for CRUD and realtime.
 */
export function SupabaseProvider({ children }) {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_KEY;

  if (!url || !key) {
    // eslint-disable-next-line no-console
    console.warn('Supabase URL/Key not set. Please configure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.');
  }

  const client = useMemo(() => createClient(url || '', key || ''), [url, key]);

  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  // Load initial session and subscribe to changes
  useEffect(() => {
    let mounted = true;
    client.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
    });
    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription?.unsubscribe?.();
    };
  }, [client]);

  // Helper: realtime channel subscription
  const subscribe = useCallback(
    (channel, callback) => {
      const ch = client
        .channel(channel)
        .on('postgres_changes', { event: '*', schema: 'public' }, callback)
        .subscribe();
      return () => {
        try { client.removeChannel(ch); } catch (e) { /* noop */ }
      };
    },
    [client]
  );

  // Helpers: CRUD with error handling
  const select = useCallback(async (table, query = '*', match = {}) => {
    const { data, error } = await client.from(table).select(query).match(match);
    if (error) throw error;
    return data;
  }, [client]);

  const insert = useCallback(async (table, values) => {
    const { data, error } = await client.from(table).insert(values).select('*');
    if (error) throw error;
    return data;
  }, [client]);

  const update = useCallback(async (table, values, match) => {
    const { data, error } = await client.from(table).update(values).match(match).select('*');
    if (error) throw error;
    return data;
  }, [client]);

  const remove = useCallback(async (table, match) => {
    const { data, error } = await client.from(table).delete().match(match).select('*');
    if (error) throw error;
    return data;
  }, [client]);

  const value = useMemo(() => ({
    client,
    user,
    session,
    subscribe,
    select,
    insert,
    update,
    remove,
  }), [client, user, session, subscribe, select, insert, update, remove]);

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useSupabase() {
  /** Hook to access Supabase context with client, user, session and helpers. */
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error('useSupabase must be used within SupabaseProvider');
  return ctx;
}
