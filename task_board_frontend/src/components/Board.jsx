import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useSupabase } from '../supabase/SupabaseContext';
import { computeColumnProgress, createTask, getInitialBoard, moveTask, updateTask } from '../supabase/boardService';
import TaskCard from './TaskCard';

/**
 * PUBLIC_INTERFACE
 * Board
 * Main kanban board with columns and draggable task cards. Supports realtime sync.
 */
function Board({ activeProjectId, activeTeamId, filters }) {
  const { client, subscribe } = useSupabase();
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Load initial board for project
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!activeProjectId) { setColumns([]); setTasks([]); return; }
      try {
        const { columns: cols, tasks: tks } = await getInitialBoard(client, activeProjectId);
        if (!cancelled) { setColumns(cols); setTasks(tks); }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    })();
    return () => { cancelled = true; };
  }, [client, activeProjectId]);

  // Realtime updates
  useEffect(() => {
    if (!activeProjectId) return () => {};
    const offColumns = subscribe('columns', (payload) => {
      if (payload.table !== 'columns') return;
      // Reload columns to keep it simple
      client.from('columns').select('*').eq('project_id', activeProjectId).order('position').then(({ data }) => setColumns(data || []));
    });
    const offTasks = subscribe('tasks', (payload) => {
      if (payload.table !== 'tasks') return;
      // Efficient merge
      const newRow = payload.new;
      const oldRow = payload.old;
      setTasks(prev => {
        switch (payload.eventType) {
          case 'INSERT': return [newRow, ...prev];
          case 'UPDATE': return prev.map(t => t.id === newRow.id ? newRow : t);
          case 'DELETE': return prev.filter(t => t.id !== oldRow.id);
          default: return prev;
        }
      });
    });
    return () => { offColumns(); offTasks(); };
  }, [client, subscribe, activeProjectId]);

  const columnMap = useMemo(() => Object.fromEntries(columns.map(c => [c.id, c])), [columns]);

  // Drag and drop handler
  const onDragEnd = useCallback(async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;

    // Local reorder
    setTasks(prev => {
      const moving = prev.find(t => t.id === draggableId);
      if (!moving) return prev;
      const newList = prev
        .map(t => t.id === draggableId ? { ...t, column_id: destColId } : t)
        .map(t => {
          if (t.column_id === destColId) {
            return t;
          }
          return t;
        });

      // Recompute positions for tasks in dest column
      const destTasks = newList.filter(t => t.column_id === destColId && t.id !== draggableId)
        .sort((a,b) => a.position - b.position);
      destTasks.splice(destination.index, 0, { ...moving, column_id: destColId });
      destTasks.forEach((t, idx) => { t.position = idx; });

      // Recompute positions for source column
      if (sourceColId !== destColId) {
        const srcTasks = newList.filter(t => t.column_id === sourceColId)
          .sort((a,b) => a.position - b.position);
        srcTasks.forEach((t, idx) => { t.position = idx; });
      }
      return [...newList];
    });

    try {
      await moveTask(client, draggableId, destColId, destination.index);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Move failed', e);
    }
  }, [client]);

  // Add a quick task to a column
  const addTask = async (columnId) => {
    if (!activeProjectId) return;
    const title = prompt('Task title'); // minimal UX
    if (!title) return;
    try {
      await createTask(client, activeProjectId, columnId, { title, status: 'todo' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Create task failed', e);
    }
  };

  const filteredTasks = useMemo(() => {
    let t = tasks;
    if (filters.label) t = t.filter(task => (task.label || '').toLowerCase() === filters.label.toLowerCase());
    if (filters.assignees?.length) t = t.filter(task => filters.assignees.includes(task.assignee));
    if (filters.search) {
      const q = filters.search.toLowerCase();
      t = t.filter(task => (task.title?.toLowerCase().includes(q) || task.description?.toLowerCase().includes(q)));
    }
    return t;
  }, [tasks, filters]);

  return (
    <main className="board" role="region" aria-label="Board columns">
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map((col) => {
          const items = filteredTasks
            .filter(t => t.column_id === col.id)
            .sort((a,b) => a.position - b.position);
          const progress = computeColumnProgress(col, filteredTasks);
          return (
            <div key={col.id} className="column">
              <div className="column-header">
                <div style={{ fontWeight:700 }}>{col.title} <span className="badge">{items.length}</span></div>
                <button className="btn" onClick={() => addTask(col.id)}>+ Task</button>
              </div>
              <div className="progress" aria-label={`${col.title} progress`}>
                <span style={{ width: `${progress}%` }} />
              </div>
              <Droppable droppableId={col.id}>
                {(provided) => (
                  <div className="task-list" ref={provided.innerRef} {...provided.droppableProps}>
                    {items.map((task, index) => (
                      <Draggable draggableId={task.id} index={index} key={task.id}>
                        {(dragProvided) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <TaskCard
                              task={task}
                              onUpdate={async (patch) => {
                                try { await updateTask(client, task.id, patch); } catch (e) { /* log */ }
                              }}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
    </main>
  );
}

export default Board;
