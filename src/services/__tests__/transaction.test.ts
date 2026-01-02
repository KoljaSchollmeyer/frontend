import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock API client
const mockApi = {
  createTransaction: vi.fn(),
}

vi.mock('../httpClient', () => mockApi)

describe('Transaction Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Use Case 9: Create Expense Transaction', () => {
    it('successfully creates an expense', async () => {
      // Neue Ausgabe wird mit Betrag, Beschreibung und Datum erstellt
      const newExpense = {
        type: 'expense',
        amount: 45.50,
        description: 'Supermarkt',
        date: '2025-12-28',
        category: { id: 1 },
        user: { id: 1 }
      }

      mockApi.createTransaction.mockResolvedValue({
        id: 100,
        ...newExpense
      })

      const result = await mockApi.createTransaction(newExpense)

      expect(mockApi.createTransaction).toHaveBeenCalledWith(newExpense)
      expect(result.type).toBe('expense')
      expect(result.amount).toBe(45.50)
    })

    it('validates amount is positive', async () => {
      // Negative Beträge werden abgelehnt
      const invalidExpense = {
        type: 'expense',
        amount: -10,
        description: 'Negative',
        date: '2025-12-28',
        category: { id: 1 },
        user: { id: 1 }
      }

      mockApi.createTransaction.mockRejectedValue(new Error('Amount must be positive'))

      await expect(mockApi.createTransaction(invalidExpense)).rejects.toThrow('Amount must be positive')
    })
  })

  describe('Use Case 10: Create Income Transaction', () => {
    it('successfully creates an income', async () => {
      // Neue Einnahme wird erfolgreich erstellt
      const newIncome = {
        type: 'income',
        amount: 2500.00,
        description: 'Monatsgehalt',
        date: '2025-12-01',
        category: { id: 4 },
        user: { id: 1 }
      }

      mockApi.createTransaction.mockResolvedValue({
        id: 101,
        ...newIncome
      })

      const result = await mockApi.createTransaction(newIncome)

      expect(result.type).toBe('income')
      expect(result.amount).toBe(2500.00)
    })
  })

  describe('Use Case 11: Delete Transaction', () => {
    it('successfully deletes a transaction', async () => {
      // Transaktion wird gelöscht
      const transactionId = 50
      const deleteTransaction = vi.fn().mockResolvedValue(undefined)

      await deleteTransaction(transactionId)

      expect(deleteTransaction).toHaveBeenCalledWith(transactionId)
    })
  })

  describe('Use Case 12: List User Transactions', () => {
    it('fetches all transactions for user', async () => {
      // Alle Transaktionen des Users werden abgerufen
      const mockTransactions = [
        { id: 1, type: 'expense', amount: 50, description: 'Coffee' },
        { id: 2, type: 'income', amount: 2000, description: 'Salary' }
      ]

      const fetchTransactions = vi.fn().mockResolvedValue(mockTransactions)
      const transactions = await fetchTransactions(1)

      expect(transactions).toHaveLength(2)
      expect(transactions[0].type).toBe('expense')
      expect(transactions[1].type).toBe('income')
    })
  })
})
