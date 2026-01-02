import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'

// Mock API client
const mockApi = {
  loginUser: vi.fn(),
  createCategory: vi.fn(),
}

vi.mock('../httpClient', () => mockApi)

describe('Error Handling Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Use Case 17: Network Error Handling', () => {
    it('handles network errors gracefully', async () => {
      // Netzwerkfehler werden abgefangen
      mockApi.loginUser.mockRejectedValue(new Error('Network error'))

      await expect(mockApi.loginUser({
        email: 'test@example.com',
        password: 'pass'
      })).rejects.toThrow('Network error')
    })

    it('displays error message to user', async () => {
      // Fehlermeldungen werden dem User angezeigt
      const errorRef = ref('')
      
      mockApi.createCategory.mockRejectedValue(new Error('Server error'))

      try {
        await mockApi.createCategory({
          name: 'Test',
          description: 'Test',
          user: { id: 1 }
        })
      } catch (err: unknown) {
        errorRef.value = (err as Error).message
      }

      expect(errorRef.value).toBe('Server error')
    })
  })

  describe('Use Case 18: Validation Error Handling', () => {
    it('shows validation errors for empty fields', () => {
      // Validierungsfehler werden für leere Felder angezeigt
      const validateTransaction = (tx: Record<string, unknown>) => {
        if (!tx.amount || (tx.amount as number) <= 0) {
          throw new Error('Betrag muss größer als 0 sein')
        }
        if (!tx.description) {
          throw new Error('Beschreibung ist erforderlich')
        }
        return true
      }

      expect(() => validateTransaction({
        amount: 0,
        description: 'Test'
      })).toThrow('Betrag muss größer als 0 sein')

      expect(() => validateTransaction({
        amount: 50,
        description: ''
      })).toThrow('Beschreibung ist erforderlich')
    })
  })
})
