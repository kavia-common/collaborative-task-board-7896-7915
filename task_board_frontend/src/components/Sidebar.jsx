import React, { useEffect, useState } from 'react';
import { useSupabase } from '../supabase/SupabaseContext';

/**
 * PUBLIC_INTERFACE
 * Sidebar
 * Shows filters and members for the selected team.
 */
function Sidebar({ activeTeamId, filters, setFilters }) {
  const { client } = useSupabase();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!activeTeamId) { setMembers([]); return; }
      // You may have a team_members table; assuming denormalized "members" view or table
      const { data } = await client.from('team_members').select('*').eq('team_id', activeTeamId);
      if (!cancel) setMembers(data || []);
    })();
    return () => { cancel = true; };
  }, [client, activeTeamId]);

  const toggleAssignee = (name) => {
    const has = filters.assignees.includes(name);
    setFilters({ ...filters, assignees: has ? filters.assignees.filter(a => a !== name) : [...filters.assignees, name] });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="section-title">Filters</div>
        <div style={{ display:'flex', flexWrap:'wrap' }}>
          {['Bug','Feature','Design','Docs'].map(l => (
            <button key={l} className="filter-chip" onClick={() => setFilters({ ...filters, label: filters.label === l ? undefined : l })}>
              <span className="badge">{l}</span>
              {filters.label === l ? '✓' : ''}
            </button>
          ))}
        </div>
      </div>
      <div className="sidebar-section">
        <div className="section-title">Search</div>
        <input
          aria-label="Search tasks"
          placeholder="Search tasks..."
          value={filters.search || ''}
          onChange={(e)=> setFilters({ ...filters, search: e.target.value })}
          style={{ padding:10, border:'1px solid var(--border)', borderRadius:10, width:'100%' }}
        />
      </div>
      <div className="sidebar-section">
        <div className="section-title">Members</div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {(members || []).map(m => (
            <div
              key={m.id || m.user_id}
              className="member"
              onClick={() => toggleAssignee(m.display_name || m.email)}
              role="button"
              tabIndex={0}
              onKeyDown={(e)=> e.key==='Enter' && toggleAssignee(m.display_name || m.email)}
            >
              <div className="avatar">{(m.display_name || m.email || '?').slice(0,2).toUpperCase()}</div>
              <div>
                <div style={{ fontWeight:600 }}>{m.display_name || m.email}</div>
                <div style={{ color:'var(--muted)', fontSize:12 }}>{filters.assignees.includes(m.display_name || m.email) ? 'Filter active' : 'Click to filter'}</div>
              </div>
            </div>
          ))}
          {!members?.length && <div style={{ color:'var(--muted)', fontSize:12 }}>No members</div>}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
