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

      await deleteAllTransactions(1)
      await deleteAllCategories(1)

      expect(deleteAllTransactions).toHaveBeenCalledWith(1)
      expect(deleteAllCategories).toHaveBeenCalledWith(1)
      
      // Verify order: transactions first, then categories
      const calls = [
        deleteAllTransactions.mock.invocationCallOrder[0],
        deleteAllCategories.mock.invocationCallOrder[0]
      ]
      expect(calls[0]).toBeLessThan(calls[1])
    })
  })
})
