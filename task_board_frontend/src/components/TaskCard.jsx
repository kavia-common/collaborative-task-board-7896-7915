import React, { useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * TaskCard
 * A compact card displaying task information with inline editing controls.
 */
function TaskCard({ task, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title || '');
  const [label, setLabel] = useState(task.label || '');
  const [status, setStatus] = useState(task.status || 'todo');

  const save = async () => {
    await onUpdate({ title, label, status });
    setEditing(false);
  };

  return (
    <div className="task-card" aria-label={`Task ${task.title}`}>
      {!editing ? (
        <>
          <div style={{ fontWeight: 600 }}>{task.title}</div>
          <div className="task-meta">
            <span className="badge">{task.label || 'General'}</span>
            <span>{status}</span>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <button className="btn" onClick={() => setEditing(true)}>Edit</button>
          </div>
        </>
      ) : (
        <div style={{ display:'grid', gap:8 }}>
          <input value={title} onChange={e=>setTitle(e.target.value)} style={{ padding:8, border:'1px solid var(--border)', borderRadius:8 }} />
          <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Label" style={{ padding:8, border:'1px solid var(--border)', borderRadius:8 }} />
          <select value={status} onChange={e=>setStatus(e.target.value)} className="select">
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn primary" onClick={save}>Save</button>
            <button className="btn" onClick={()=> setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskCard;
