import React, { useEffect, useMemo, useState } from 'react';
import './index.css';
import { SupabaseProvider, useSupabase } from './supabase/SupabaseContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Board from './components/Board';
import ChatPanel from './components/ChatPanel';
import { AuthGate } from './components/auth/AuthGate';

// Root wrapped with SupabaseProvider
// PUBLIC_INTERFACE
function AppRoot() {
  /** This is the app root that provides Supabase context and renders the app. */
  return (
    <SupabaseProvider>
      <AuthGate>
        <App />
      </AuthGate>
    </SupabaseProvider>
  );
}

function App() {
  const { user } = useSupabase();

  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [filters, setFilters] = useState({ assignees: [], labels: [], search: '' });

  // Persist choices locally for convenience
  useEffect(() => {
    const stored = localStorage.getItem('tb:preferences');
    if (stored) {
      const prefs = JSON.parse(stored);
      if (prefs.activeProjectId) setActiveProjectId(prefs.activeProjectId);
      if (prefs.activeTeamId) setActiveTeamId(prefs.activeTeamId);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('tb:preferences', JSON.stringify({ activeProjectId, activeTeamId }));
  }, [activeProjectId, activeTeamId]);

  const sidebarProps = useMemo(() => ({
    activeTeamId,
    setActiveTeamId,
    filters,
    setFilters,
  }), [activeTeamId, filters]);

  return (
    <div className="app-shell" data-theme="light" aria-label="Ocean Professional Task Board">
      <Navbar
        user={user}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        activeTeamId={activeTeamId}
        setActiveTeamId={setActiveTeamId}
      />
      <Sidebar {...sidebarProps} />
      <Board activeProjectId={activeProjectId} activeTeamId={activeTeamId} filters={filters} />
      <ChatPanel activeProjectId={activeProjectId} activeTeamId={activeTeamId} />
    </div>
  );
}

export default AppRoot;
