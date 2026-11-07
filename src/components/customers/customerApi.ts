import useSWR from 'swr'
import type { Customer, Deal, Invoice } from '../../types'
import { safeFetchJson } from '../../shared/http/safeFetch'

export type CustomerRecord = { id: string; organization_id: string; name: string; email: string | null; phone: string | null; status: string }
export type CustomerContact = { id: string; name: string; email: string | null; phone: string | null; is_primary: boolean }
export type CustomerProfile = { customer: CustomerRecord; contacts: CustomerContact[]; deals: Deal[]; invoices: Invoice[]; activity: unknown[] }
const headers = { 'content-type': 'application/json' }

type CustomersListResponse = { rows: CustomerRecord[]; total: number; page: number; pageSize: number }

const listFetcher = async (url: string): Promise<CustomersListResponse> => {
  const result = await safeFetchJson<CustomersListResponse>(url, { headers, credentials: 'include' })
  if (!result.ok || !result.data) {
    throw new Error(result.error?.message || 'Customer data could not be loaded.')
  }
  return result.data
}

const toInvoice = (row: Record<string, unknown>): Invoice => {
  const amount = Number(row.total_minor || 0) / 100
  return { id: String(row.id), invoiceNumber: String(row.number || ''), customerId: String(row.customer_id || ''), customerName: '', amount, formattedAmount: `₹${amount.toLocaleString('en-IN')}`, issueDate: String(row.created_at || '').slice(0, 10), dueDate: String(row.due_at || '').slice(0, 10), status: row.status === 'paid' ? 'paid' : row.status === 'overdue' ? 'overdue' : row.status === 'draft' ? 'draft' : 'pending', items: [] }
}

const toDeal = (row: Record<string, unknown>): Deal => {
  const value = Number(row.amount_minor || 0) / 100
  return { id: String(row.id), title: String(row.name || ''), customerId: String(row.customer_id || ''), customerName: '', value, formattedValue: `₹${value.toLocaleString('en-IN')}`, stage: (String(row.stage || 'lead') as Deal['stage']), probability: 0, lastContactDaysAgo: 0, isStale: false, assignedTo: '', expectedCloseDate: '' }
}

const toCustomer = (row: CustomerRecord): Customer => ({ id: row.id, name: row.name, company: row.name, email: row.email || '', phone: row.phone || '', revenue: 0, formattedRevenue: '₹0', lastActivity: 'No activity', lastActivityDaysAgo: 0, status: row.status === 'prospect' ? 'New' : row.status === 'inactive' ? 'At Risk' : 'Active', healthScore: row.status === 'inactive' ? 40 : 80, openInvoicesCount: 0, openInvoicesAmount: 0, openOpportunitiesCount: 0, openOpportunitiesAmount: 0, avatarBg: 'from-blue-500 to-indigo-600', tags: [], notes: [], industry: 'Customer account' })

export function useCustomers(search: string, status: string, page: number, pageSize = 20) {
  const query = new URLSearchParams({ q: search, status: status === 'All' ? 'all' : status, page: String(page), pageSize: String(pageSize) })
  const result = useSWR<CustomersListResponse>(`/api/customers?${query}`, listFetcher, { keepPreviousData: true, revalidateOnFocus: false })
  return { ...result, customers: result.data?.rows?.map(toCustomer) || [], total: result.data?.total || 0 }
}

const profileFetcher = async (url: string): Promise<CustomerProfile> => {
  const result = await safeFetchJson<{ customer: CustomerRecord; contacts: CustomerContact[]; deals: Record<string, unknown>[]; invoices: Record<string, unknown>[]; activity: unknown[] }>(url, { headers, credentials: 'include' })
  if (!result.ok || !result.data) {
    throw new Error(result.error?.message || 'Customer profile could not be loaded.')
  }
  const data = result.data
  return { customer: data.customer, contacts: data.contacts || [], deals: (data.deals || []).map(toDeal), invoices: (data.invoices || []).map(toInvoice), activity: data.activity || [] }
}

export function useCustomerProfile(id?: string) {
  return useSWR<CustomerProfile>(id ? `/api/customers?id=${encodeURIComponent(id)}` : null, profileFetcher, { revalidateOnFocus: false })
}

export async function saveCustomer(input: { id?: string; name: string; email?: string; phone?: string }) {
  const result = await safeFetchJson<CustomerRecord>('/api/customers', {
    method: input.id ? 'PATCH' : 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(input),
  })
  if (!result.ok || !result.data) {
    throw new Error(result.error?.message || 'Customer could not be saved.')
  }
  return result.data
}

export async function archiveCustomer(id: string) {
  const result = await safeFetchJson<CustomerRecord>('/api/customers', {
    method: 'DELETE',
    headers,
    credentials: 'include',
    body: JSON.stringify({ id }),
  })
  if (!result.ok || !result.data) {
    throw new Error(result.error?.message || 'Customer could not be archived.')
  }
  return result.data
}
