import useSWR from 'swr'
import { authClient } from '../auth/neonAuthClient'

export interface DashboardData {
  financial: { revenue_minor: string; expenses_minor: string; receivables_minor: string; cash_in_minor: string; cash_out_minor: string }
  counts: { customers: number; overdue_invoices: number; overdue_minor: string; pending_expenses: number }
  pipeline: Array<{ stage: string; count: number; amount_minor: string }>
  tasks: Array<{ id: string; title: string; priority: string; status: string; due_at: string | null }>
  insights: Array<{ id: string; title: string; summary: string; severity: string; created_at: string }>
  alerts: Array<{ id: string; severity: string; title: string; status: string; created_at: string }>
  activity: Array<{ id: string; action: string; entity_type: string; entity_id: string | null; created_at: string }>
}

export class DashboardRequestError extends Error {
  status: number
  code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'DashboardRequestError'
    this.status = status
    this.code = code
  }
}

interface DashboardResponse { ok: boolean; data?: DashboardData; error?: { code: string; message: string } }
const fetcher = async (url: string): Promise<DashboardData> => {
  const response = await fetch(url, { credentials: 'include' })
  const payload = await response.json() as DashboardResponse
  if (!response.ok || !payload.ok || !payload.data) {
    throw new DashboardRequestError(response.status, payload.error?.message ?? 'Dashboard data could not be loaded.', payload.error?.code)
  }
  return payload.data
}

export function useDashboardData() {
  const session = authClient
    ? authClient.useSession() as { isPending: boolean; data?: { user?: unknown } | null }
    : { isPending: false, data: null }
  const sessionState = session.isPending ? 'initializing' : session.data?.user ? 'authenticated' : 'guest'
  const key = sessionState === 'authenticated' ? '/api/dashboard' : null
  const result = useSWR<DashboardData>(key, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: false,
    errorRetryCount: 2,
    errorRetryInterval: 1500,
  })
  return { ...result, sessionState }
}
