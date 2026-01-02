import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getCurrentUser, setCurrentUser, clearCurrentUser } from '../userSession'
import type { User } from '../../types'

const mockStorage = () => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    key: vi.fn(() => null),
    length: 0
  }
}

describe('userSession', () => {
  beforeEach(() => {
    const storage = mockStorage()
    vi.stubGlobal('localStorage', storage)
  })

  it('returns null when no user stored', () => {
    // Null wird zurückgegeben wenn kein User gespeichert ist
    expect(getCurrentUser()).toBeNull()
  })

  it('stores and retrieves user', () => {
    // User wird gespeichert und korrekt abgerufen
    const user: User = { id: 1, name: 'Test', email: 'test@example.com' }
    setCurrentUser(user)
    expect(getCurrentUser()).toEqual(user)
  })

  it('clears the stored user', () => {
    // Gespeicherter User wird gelöscht
    const user: User = { id: 2, name: 'X', email: 'x@example.com' }
    setCurrentUser(user)
    clearCurrentUser()
    expect(getCurrentUser()).toBeNull()
  })
})
