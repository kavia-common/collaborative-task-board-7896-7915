import React, { useEffect, useState } from 'react';
import { useSupabase } from '../supabase/SupabaseContext';

/**
 * PUBLIC_INTERFACE
 * Navbar
 * Top navigation bar with project and team switchers and a create-task action.
 */
function Navbar({ user, activeProjectId, setActiveProjectId, activeTeamId, setActiveTeamId }) {
  const { client } = useSupabase();
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: t } = await client.from('teams').select('*').order('name');
      if (!cancelled) setTeams(t || []);
    })();
    return () => { cancelled = true; };
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!activeTeamId) {
        setProjects([]);
        return;
      }
      const { data: p } = await client.from('projects').select('*').eq('team_id', activeTeamId).order('name');
      if (!cancelled) setProjects(p || []);
    })();
    return () => { cancelled = true; };
  }, [client, activeTeamId]);

  useEffect(() => {
    // set defaults if empty
    if (!activeTeamId && teams.length) setActiveTeamId(teams[0].id);
  }, [teams, activeTeamId, setActiveTeamId]);

  useEffect(() => {
    if (!activeProjectId && projects.length) setActiveProjectId(projects[0].id);
  }, [projects, activeProjectId, setActiveProjectId]);

  const signOut = async () => { await client.auth.signOut(); };

  return (
    <div className="navbar">
      <div className="brand">
        <span className="brand-badge" />
        Task Board
      </div>
      <div className="switchers">
        <select
          aria-label="Select Team"
          className="select"
          value={activeTeamId || ''}
          onChange={(e) => setActiveTeamId(e.target.value || null)}
        >
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select
          aria-label="Select Project"
          className="select"
          value={activeProjectId || ''}
          onChange={(e) => setActiveProjectId(e.target.value || null)}
        >
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="actions">
        <span style={{ fontSize:12, color:'var(--muted)' }}>{user?.email}</span>
        <button className="btn" onClick={signOut}>Sign out</button>
      </div>
    </div>
  );
}

export default Navbar;
