import { v4 as uuidv4 } from 'uuid';

/**
 * PUBLIC_INTERFACE
 * getInitialBoard
 * Fetch columns and tasks for a given projectId; if none exist, bootstrap defaults.
 */
export async function getInitialBoard(client, projectId) {
  if (!projectId) return { columns: [], tasks: [] };
  // Fetch columns
  const { data: columns, error: colErr } = await client
    .from('columns')
    .select('*')
    .eq('project_id', projectId)
    .order('position');
  if (colErr) throw colErr;

  // Fetch tasks
  const { data: tasks, error: taskErr } = await client
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('position');
  if (taskErr) throw taskErr;

  // Bootstrap if empty
  if (!columns?.length) {
    const defaultCols = [
      { id: uuidv4(), title: 'To Do', slug: 'todo', position: 0, project_id: projectId },
      { id: uuidv4(), title: 'In Progress', slug: 'inprogress', position: 1, project_id: projectId },
      { id: uuidv4(), title: 'Done', slug: 'done', position: 2, project_id: projectId },
    ];
    const { data: newCols, error: insErr } = await client.from('columns').insert(defaultCols).select('*');
    if (insErr) throw insErr;
    return { columns: newCols, tasks: [] };
  }
  return { columns, tasks };
}

/**
 * PUBLIC_INTERFACE
 * moveTask
 * Update a single task's column_id and position after drag/drop.
 */
export async function moveTask(client, taskId, toColumnId, toPosition) {
  const { data, error } = await client
    .from('tasks')
    .update({ column_id: toColumnId, position: toPosition })
    .eq('id', taskId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * createTask
 * Create a task in a column with the next position.
 */
export async function createTask(client, projectId, columnId, payload) {
  // Find current max position in column
  const { data: maxPosData, error: posErr } = await client
    .from('tasks')
    .select('position')
    .eq('project_id', projectId)
    .eq('column_id', columnId)
    .order('position', { ascending: false })
    .limit(1);
  if (posErr) throw posErr;
  const nextPos = (maxPosData?.[0]?.position ?? -1) + 1;

  const { data, error } = await client
    .from('tasks')
    .insert({ ...payload, id: uuidv4(), project_id: projectId, column_id: columnId, position: nextPos })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * updateTask
 * Update fields of a task by id.
 */
export async function updateTask(client, id, payload) {
  const { data, error } = await client.from('tasks').update(payload).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * deleteTask
 * Remove a task by id.
 */
export async function deleteTask(client, id) {
  const { data, error } = await client.from('tasks').delete().eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * computeColumnProgress
 * Calculates completion percentage for a column based on tasks with status 'done' or column slug.
 */
export function computeColumnProgress(column, tasks) {
  const colTasks = tasks.filter(t => t.column_id === column.id);
  if (!colTasks.length) return 0;
  const done = colTasks.filter(t => (t.status === 'done') || (column.slug === 'done')).length;
  return Math.round((done / colTasks.length) * 100);
}
