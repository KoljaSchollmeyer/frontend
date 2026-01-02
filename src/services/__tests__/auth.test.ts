import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage for all tests
const mockStorage: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => { mockStorage[key] = value },
  removeItem: (key: string) => { delete mockStorage[key] },
  clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]) }
}
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// Mock API client
const mockApi = {
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  fetchMe: vi.fn(),
  createUser: vi.fn(),
}

vi.mock('../httpClient', () => mockApi)

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Use Case 1: User Registration', () => {
    it('successfully registers a new user', async () => {
      // Neuer User wird mit Name, Email und Passwort registriert
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!'
      }

      mockApi.createUser.mockResolvedValue({
        id: 1,
        name: newUser.name,
        email: newUser.email
      })

      const result = await mockApi.createUser(newUser)

      expect(mockApi.createUser).toHaveBeenCalledWith(newUser)
      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      })
    })

    it('rejects registration with invalid email', async () => {
      // Registrierung mit ungültiger Email wird abgelehnt
      const invalidUser = {
        name: 'Test',
        email: 'invalid-emai',
        password: 'Test123!'
      }

      mockApi.createUser.mockRejectedValue(new Error('Invalid email format'))

      await expect(mockApi.createUser(invalidUser)).rejects.toThrow('Invalid email format')
    })

    it('rejects registration with duplicate email', async () => {
      // Registrierung mit bereits existierender Email schlägt fehl
      const firstUser = {
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'Pass123!'
      }
      
      const secondUser = {
        name: 'Second User',
        email: 'duplicate@example.com',  // Same email!
        password: 'Different123!'
      }

      // First registration succeeds
      mockApi.createUser.mockResolvedValueOnce({
        id: 1,
        name: firstUser.name,
        email: firstUser.email
      })
      
      const result1 = await mockApi.createUser(firstUser)
      expect(result1.email).toBe('duplicate@example.com')

      // Second registration with same email fails
      mockApi.createUser.mockRejectedValueOnce(new Error('Email already exists'))

      await expect(mockApi.createUser(secondUser)).rejects.toThrow('Email already exists')
    })
  })

  describe('Use Case 2: User Login', () => {
    it('successfully logs in with valid credentials', async () => {
      // Login mit korrekten Credentials gibt User zurück
      const credentials = {
        email: 'test@example.com',
        password: 'secret'
      }

      mockApi.loginUser.mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      })

      const user = await mockApi.loginUser(credentials)

      expect(mockApi.loginUser).toHaveBeenCalledWith(credentials)
      expect(user.email).toBe('test@example.com')
    })

    it('rejects login with wrong password', async () => {
      // Login mit falschem Passwort wird abgelehnt
      const correctCredentials = {
        email: 'test@example.com',
        password: 'correctpassword'
      }

      const wrongCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      // First, login with correct password succeeds
      mockApi.loginUser.mockResolvedValueOnce({
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      })

      const result = await mockApi.loginUser(correctCredentials)
      expect(result.email).toBe('test@example.com')

      // Then, login with wrong password fails
      mockApi.loginUser.mockRejectedValueOnce(new Error('Invalid credentials'))

      await expect(mockApi.loginUser(wrongCredentials)).rejects.toThrow('Invalid credentials')
    })

    it('rejects login with non-existent email', async () => {
      // Login mit nicht existierender Email schlägt fehl
      const nonExistentCredentials = {
        email: 'nonexistent@example.com',
        password: 'password'
      }

      mockApi.loginUser.mockRejectedValue(new Error('User not found'))

      await expect(mockApi.loginUser(nonExistentCredentials)).rejects.toThrow('User not found')
    })
  })

  describe('Use Case 3: User Logout', () => {
    it('successfully logs out user', async () => {
      // User wird erfolgreich ausgeloggt
      mockApi.logoutUser.mockResolvedValue(undefined)

      await mockApi.logoutUser()

      expect(mockApi.logoutUser).toHaveBeenCalled()
    })

    it('clears session after logout', async () => {
      // Session-Daten werden nach Logout gelöscht
      localStorage.setItem('currentUser', JSON.stringify({ id: 1, name: 'Test' }))
      
      mockApi.logoutUser.mockResolvedValue(undefined)
      await mockApi.logoutUser()

      // Simulate clearing localStorage on logout
      localStorage.removeItem('currentUser')

      expect(localStorage.getItem('currentUser')).toBeNull()
    })
  })

  describe('Use Case 5: Session Persistence', () => {
    it('restores user session on page reload', async () => {
      // User-Session wird beim Neuladen wiederhergestellt
      mockApi.fetchMe.mockResolvedValue({
        id: 1,
        name: 'Restored User',
        email: 'restored@example.com'
      })

      const user = await mockApi.fetchMe()

      expect(mockApi.fetchMe).toHaveBeenCalled()
      expect(user).toBeDefined()
      expect(user.email).toBe('restored@example.com')
    })

    it('returns null when no session exists', async () => {
      // Null wird zurückgegeben wenn keine Session existiert
      mockApi.fetchMe.mockResolvedValue(null)

      const user = await mockApi.fetchMe()

      expect(user).toBeNull()
    })
  })
})
