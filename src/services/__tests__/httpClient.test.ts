import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiGet, apiPost, apiDelete, normalizeTransaction } from '../httpClient'
import { API_BASE_URL } from '../../constants/api'

declare const global: typeof globalThis

describe('httpClient', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('apiGet calls fetch with base URL and credentials', async () => {
    const mockJson = vi.fn().mockResolvedValue({ ok: true })
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: mockJson })
    vi.stubGlobal('fetch', mockFetch as unknown as typeof fetch)

    await apiGet('/categories')

    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
  })

  it('apiPost sends JSON body and parses response', async () => {
    const payload = { foo: 'bar' }
    const mockJson = vi.fn().mockResolvedValue({ id: 1, ...payload })
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: mockJson })
    vi.stubGlobal('fetch', mockFetch as unknown as typeof fetch)

    const result = await apiPost('/auth/login', payload)

    expect(mockFetch).toHaveBeenCalled()
    const [, options] = mockFetch.mock.calls[0]
    expect(options?.method).toBe('POST')
    expect(options?.body).toBe(JSON.stringify(payload))
    expect(result).toEqual({ id: 1, ...payload })
  })

  it('apiDelete returns true on success', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: vi.fn(), status: 200 })
    vi.stubGlobal('fetch', mockFetch as unknown as typeof fetch)

    const result = await apiDelete('/categories/1')
    expect(result).toBe(true)
  })

  it('throws on 401 with response message', async () => {
    const mockText = vi.fn().mockResolvedValue('Unauthorized')
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 401, text: mockText })
    vi.stubGlobal('fetch', mockFetch as unknown as typeof fetch)

    await expect(apiGet('/auth/me')).rejects.toThrow(/401|Unauthorized/i)
  })

  it('normalizeTransaction maps fields and defaults type to expense', () => {
    const tx = normalizeTransaction({
      id: '5',
      date: '2024-01-01',
      description: 'Test',
      type: 'unknown',
      amount: '12.5',
      categoryId: '3',
      userId: '7',
      category: 'Food'
    })

    expect(tx).toEqual({
      id: 5,
      date: '2024-01-01',
      description: 'Test',
      type: 'expense',
      amount: 12.5,
      categoryId: 3,
      userId: 7,
      category: 'Food'
    })
  })
})
