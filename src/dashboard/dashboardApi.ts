import useSWR from 'swr'

export interface DashboardData {
  financial: { revenue_minor: string; expenses_minor: string; receivables_minor: string; cash_in_minor: string; cash_out_minor: string }
  counts: { customers: number; overdue_invoices: number; overdue_minor: string; pending_expenses: number }
  pipeline: Array<{ stage: string; count: number; amount_minor: string }>
  tasks: Array<{ id: string; title: string; priority: string; status: string; due_at: string | null }>
  insights: Array<{ id: string; title: string; summary: string; severity: string; created_at: string }>
  alerts: Array<{ id: string; severity: string; title: string; status: string; created_at: string }>
  activity: Array<{ id: string; action: string; entity_type: string; entity_id: string | null; created_at: string }>
}

interface DashboardResponse { ok: boolean; data?: DashboardData; error?: { code: string; message: string } }
const fetcher = async (url: string): Promise<DashboardData> => {
  const response = await fetch(url, { credentials: 'include' })
  const payload = await response.json() as DashboardResponse
  if (!response.ok || !payload.ok || !payload.data) throw new Error(payload.error?.message ?? 'Dashboard data could not be loaded.')
  return payload.data
}

export function useDashboardData() {
  const organizationId = import.meta.env.VITE_ORGANIZATION_ID as string | undefined
  return useSWR<DashboardData>(organizationId ? `/api/dashboard?organizationId=${encodeURIComponent(organizationId)}` : null, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
    errorRetryCount: 2,
    errorRetryInterval: 1500,
  })
}
