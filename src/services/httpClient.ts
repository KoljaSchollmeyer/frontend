import type { User, Category, Transaction } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || ''

async function throwApiError(res: Response, method: string, path: string): Promise<never> {
  const text = await res.text().catch(() => '')
  const detail = text ? `${res.status} - ${text}` : `${res.status}`
  throw new Error(`API ${method} ${path} failed: ${detail}`)
}

async function apiRequest<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: any
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...(body && { body: JSON.stringify(body) })
  })
  if (!res.ok) return throwApiError(res, method, path)
  return method === 'DELETE' ? (true as T) : res.json()
}

export const apiGet = <T>(path: string) => apiRequest<T>('GET', path)
export const apiPost = <T>(path: string, body: any) => apiRequest<T>('POST', path, body)
export const apiDelete = (path: string) => apiRequest<boolean>('DELETE', path)

// Backend mapping helpers
const toBackendCategory = (input: Pick<Category, 'name' | 'description'> & { userId: number }) => ({
  name: input.name,
  description: input.description,
  user: { id: input.userId }
})

const toBackendTransaction = (input: Pick<Transaction, 'type' | 'amount' | 'description' | 'date' | 'categoryId'> & { userId: number }) => ({
  type: input.type,
  amount: parseFloat(String(input.amount)),
  description: input.description,
  date: input.date,
  category: { id: Number(input.categoryId) },
  user: { id: input.userId }
})

// Specialized helpers
export const createUser = (payload: Pick<User, 'name' | 'email'> & { password: string }) =>
  apiPost<User>('/users', payload)

export const createCategory = (input: Pick<Category, 'name' | 'description'> & { userId: number }) =>
  apiPost<Category>('/categories', toBackendCategory(input))

export const createTransaction = (input: Pick<Transaction, 'type' | 'amount' | 'description' | 'date' | 'categoryId'> & { userId: number }) =>
  apiPost<Transaction>('/transactions', toBackendTransaction(input))
