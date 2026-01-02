import type { User, Category, Transaction } from '../types'
import { API_BASE_URL } from '../constants/api'

async function throwApiError(res: Response): Promise<never> {
  const text = await res.text().catch(() => '')
  let detail = text ? `${res.status} - ${text}` : `${res.status}`
  
  // Parse JSON error message if available
  try {
    const json = JSON.parse(text)
    if (json.error) detail = json.error
    else if (json.message) detail = json.message
  } catch {
    // Ignore JSON parse errors
  }
  
  throw new Error(detail)
}

async function apiRequest<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  }
  
  if (body) {
    options.body = JSON.stringify(body)
  }
  
  const res = await fetch(`${API_BASE_URL}${path}`, options)
  if (!res.ok) {
    // Check if it's a 401 - if so, session may have expired
    if (res.status === 401) {
      // We'll let the error throw, and components will handle it
      return throwApiError(res)
    }
    return throwApiError(res)
  }
  return method === 'DELETE' ? (true as T) : res.json()
}

export const apiGet = <T>(path: string) => apiRequest<T>('GET', path)
export const apiPost = <T>(path: string, body: unknown) => apiRequest<T>('POST', path, body)
export const apiDelete = (path: string) => apiRequest<boolean>('DELETE', path)

// Backend mapping helpers
export const normalizeTransaction = (tx: Record<string, unknown>): Transaction => {
  const type = String(tx.type || '').toLowerCase() as 'income' | 'expense'
  return {
    id: Number(tx.id),
    date: String(tx.date || ''),
    description: String(tx.description || ''),
    type: ['income', 'expense'].includes(type) ? type : 'expense',
    amount: Number(tx.amount || 0),
    categoryId: Number(tx.categoryId || 0),
    userId: Number(tx.userId || 0),
    category: tx.category ? String(tx.category) : undefined
  }
}

const toBackendCategory = (input: Pick<Category, 'name' | 'description'> & { userId: number }) => ({
  name: input.name,
  description: input.description,
  user: { id: input.userId }
})

const toBackendTransaction = (input: Pick<Transaction, 'type' | 'amount' | 'description' | 'date' | 'categoryId'> & { userId: number }) => ({
  type: input.type.toUpperCase(),
  amount: parseFloat(String(input.amount)),
  description: input.description,
  date: input.date,
  category: { id: Number(input.categoryId) },
  user: { id: input.userId }
})

// Specialized helpers
export const createUser = (payload: Pick<User, 'name' | 'email'> & { password: string }) =>
  apiPost<User>('/auth/register', payload)

export const createCategory = (input: Pick<Category, 'name' | 'description'> & { userId: number }) =>
  apiPost<Category>('/categories', toBackendCategory(input))

export const createTransaction = (input: Pick<Transaction, 'type' | 'amount' | 'description' | 'date' | 'categoryId'> & { userId: number }) =>
  apiPost<Transaction>('/transactions', toBackendTransaction(input))

export const loginUser = (payload: { email: string; password: string }) => apiPost<User>('/auth/login', payload)
export const logoutUser = () => apiPost<boolean>('/auth/logout', {})
export const fetchMe = () => apiGet<User>('/auth/me')

// Summary endpoint
export const fetchBalanceSummary = (params?: { categoryId?: number; from?: string; to?: string }) => {
  const q = new URLSearchParams()
  if (params?.categoryId) q.set('categoryId', String(params.categoryId))
  if (params?.from) q.set('from', params.from)
  if (params?.to) q.set('to', params.to)
  const suffix = q.toString() ? `?${q.toString()}` : ''
  return apiGet<{ income: number; expense: number; balance: number }>(`/summary/balance${suffix}`)
}

