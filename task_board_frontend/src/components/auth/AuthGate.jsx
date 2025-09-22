import React from 'react';
import { useSupabase } from '../../supabase/SupabaseContext';
import SignIn from './SignIn';

/**
 * PUBLIC_INTERFACE
 * AuthGate
 * Wraps children and renders a sign-in screen when the user is not authenticated.
 */
export function AuthGate({ children }) {
  const { user } = useSupabase();
  if (!user) return <SignIn />;
  return <>{children}</>;
}

export default AuthGate;
