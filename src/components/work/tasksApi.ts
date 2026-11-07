import useSWR from 'swr'
import { safeFetchJson } from '../../shared/http/safeFetch'

type TaskRecord = { id: string; organization_id: string; project_id: string | null; assignee_id: string | null; title: string; status: 'todo' | 'in_progress' | 'done' | 'cancelled'; priority: 'low' | 'medium' | 'high' | 'urgent'; due_at: string | null }

async function taskRequest<T>(input: RequestInfo | URL, init: RequestInit, fallback: string): Promise<T> {
  const result = await safeFetchJson<T>(input, init)
  if (!result.ok || result.data === undefined) {
    throw new Error(result.error?.message || fallback)
  }
  return result.data
}

const fetcher = (url: string) => taskRequest<TaskRecord[]>(url, { credentials: 'include' }, 'Tasks could not be loaded.')

export function usePersistedTasks(enabled = true) {
  return useSWR<TaskRecord[]>(enabled ? '/api/tasks' : null, fetcher, { revalidateOnFocus: false })
}

export async function createPersistedTask(input: { title: string; priority: TaskRecord['priority']; dueAt?: string }) {
  return taskRequest<TaskRecord>('/api/tasks', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  }, 'Task could not be created.')
}

export async function updatePersistedTask(id: string, input: Partial<Pick<TaskRecord, 'title' | 'priority' | 'status' | 'due_at'>>) {
  return taskRequest<TaskRecord>('/api/tasks', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id, ...input, dueAt: input.due_at }),
  }, 'Task could not be updated.')
}
