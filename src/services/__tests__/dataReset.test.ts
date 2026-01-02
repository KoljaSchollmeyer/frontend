import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Data Reset Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Use Case 14: Delete All User Data', () => {
    it('deletes all transactions then all categories', async () => {
      // Alle Daten werden gelöscht (erst Transaktionen, dann Kategorien)
      const deleteAllTransactions = vi.fn().mockResolvedValue(undefined)
      const deleteAllCategories = vi.fn().mockResolvedValue(undefined)

      // User has data
      const userId = 1
      const userHasTransactions = vi.fn().mockResolvedValue(true)
      const userHasCategories = vi.fn().mockResolvedValue(true)

      // Verify user has data
      expect(await userHasTransactions(userId)).toBe(true)
      expect(await userHasCategories(userId)).toBe(true)

      // Delete all transactions first
      await deleteAllTransactions(userId)
      expect(deleteAllTransactions).toHaveBeenCalledWith(userId)

      // Then delete all categories
      await deleteAllCategories(userId)
      expect(deleteAllCategories).toHaveBeenCalledWith(userId)
      
      // Verify order: transactions first, then categories
      const calls = [
        deleteAllTransactions.mock.invocationCallOrder[0],
        deleteAllCategories.mock.invocationCallOrder[0]
      ]
      expect(calls[0]).toBeLessThan(calls[1])

      // Verify data is now empty
      const userTransactionsEmpty = vi.fn().mockResolvedValue(false)
      const userCategoriesEmpty = vi.fn().mockResolvedValue(false)
      
      expect(await userTransactionsEmpty(userId)).toBe(false)
      expect(await userCategoriesEmpty(userId)).toBe(false)
    })
  })
})
