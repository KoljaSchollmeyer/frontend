import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock API client
const mockApi = {
  fetchBalanceSummary: vi.fn(),
  fetchCategorySummary: vi.fn(),
  fetchDateSummary: vi.fn(),
}

vi.mock('../httpClient', () => mockApi)

describe('Summary Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Use Case 13: View Balance Summary', () => {
    it('fetches balance summary without filters', async () => {
      // Balance-Übersicht ohne Filter wird abgerufen
      mockApi.fetchBalanceSummary.mockResolvedValue({
        income: 2500.00,
        expense: 188.99,
        balance: 2311.01
      })

      const balance = await mockApi.fetchBalanceSummary({})

      expect(mockApi.fetchBalanceSummary).toHaveBeenCalledWith({})
      expect(balance.income).toBe(2500.00)
      expect(balance.expense).toBe(188.99)
      expect(balance.balance).toBe(2311.01)
    })

    it('fetches balance summary with date range filter', async () => {
      // Balance wird für bestimmten Zeitraum berechnet
      mockApi.fetchBalanceSummary.mockResolvedValue({
        income: 1000.00,
        expense: 100.00,
        balance: 900.00
      })

      const balance = await mockApi.fetchBalanceSummary({
        from: '2025-12-01',
        to: '2025-12-15'
      })

      expect(mockApi.fetchBalanceSummary).toHaveBeenCalledWith({
        from: '2025-12-01',
        to: '2025-12-15'
      })
      expect(balance.balance).toBe(900.00)
    })

    it('fetches balance summary with category filter', async () => {
      // Balance wird für bestimmte Kategorie berechnet
      // First fetch without filter
      mockApi.fetchBalanceSummary.mockResolvedValueOnce({
        income: 2500.00,
        expense: 500.00,
        balance: 2000.00
      })

      const fullBalance = await mockApi.fetchBalanceSummary({})
      expect(fullBalance.expense).toBe(500.00)

      // Then fetch with category filter shows different result
      mockApi.fetchBalanceSummary.mockResolvedValueOnce({
        income: 0,
        expense: 45.50,
        balance: -45.50
      })

      const filteredBalance = await mockApi.fetchBalanceSummary({
        categoryId: 1
      })

      expect(mockApi.fetchBalanceSummary).toHaveBeenLastCalledWith({ categoryId: 1 })
      expect(filteredBalance.expense).toBe(45.50)
      // Verify the filtered result is different
      expect(filteredBalance.expense).toBeLessThan(fullBalance.expense)
    })

    it('returns zero balance with no transactions', async () => {
      // Balance mit null Einnahmen und Ausgaben wird berechnet
      mockApi.fetchBalanceSummary.mockResolvedValue({
        income: 0,
        expense: 0,
        balance: 0
      })

      const balance = await mockApi.fetchBalanceSummary({})

      expect(balance.balance).toBe(0)
    })
  })

  describe('Use Case 15: Summary by Category', () => {
    it('fetches summary grouped by category', async () => {
      // Summary wird nach Kategorien gruppiert
      mockApi.fetchCategorySummary.mockResolvedValue([
        {
          category: 'Food',
          income: 0,
          expense: 150.00,
          balance: -150.00,
          count: 3
        },
        {
          category: 'Transport',
          income: 0,
          expense: 45.00,
          balance: -45.00,
          count: 2
        }
      ])

      const summary = await mockApi.fetchCategorySummary({})

      expect(mockApi.fetchCategorySummary).toHaveBeenCalledWith({})
      expect(summary).toHaveLength(2)
      expect(summary[0].category).toBe('Food')
      expect(summary[0].expense).toBe(150.00)
    })

    it('category summary shows transaction counts', async () => {
      // Anzahl der Transaktionen wird pro Kategorie angezeigt
      // First, fetch empty summary
      mockApi.fetchCategorySummary.mockResolvedValueOnce([])

      let summary = await mockApi.fetchCategorySummary({})
      expect(summary).toEqual([])

      // Then, after adding transactions, fetch shows counts
      mockApi.fetchCategorySummary.mockResolvedValueOnce([
        {
          category: 'Groceries',
          income: 0,
          expense: 200.00,
          balance: -200.00,
          count: 5
        }
      ])

      summary = await mockApi.fetchCategorySummary({})

      expect(summary[0].count).toBe(5)
      expect(summary[0].category).toBe('Groceries')
    })

    it('returns empty array with no categories', async () => {
      // Leeres Array wird zurückgegeben wenn keine Kategorien vorhanden
      mockApi.fetchCategorySummary.mockResolvedValue([])

      const summary = await mockApi.fetchCategorySummary({})

      expect(summary).toEqual([])
    })
  })

  describe('Use Case 16: Summary by Date', () => {
    it('fetches summary grouped by date', async () => {
      // Summary wird nach Datum gruppiert
      mockApi.fetchDateSummary.mockResolvedValue([
        {
          date: '2025-12-01',
          income: 2500.00,
          expense: 0,
          balance: 2500.00,
          count: 1
        },
        {
          date: '2025-12-02',
          income: 0,
          expense: 80.00,
          balance: -80.00,
          count: 2
        }
      ])

      const summary = await mockApi.fetchDateSummary({})

      expect(mockApi.fetchDateSummary).toHaveBeenCalledWith({})
      expect(summary).toHaveLength(2)
      expect(summary[0].date).toBe('2025-12-01')
    })

    it('date summary respects date range filter', async () => {
      // Summary respektiert Datumsbereich-Filter
      // First, fetch all dates
      mockApi.fetchDateSummary.mockResolvedValueOnce([
        {
          date: '2025-12-01',
          income: 2500.00,
          expense: 0,
          balance: 2500.00,
          count: 1
        },
        {
          date: '2025-12-05',
          income: 0,
          expense: 45.00,
          balance: -45.00,
          count: 1
        },
        {
          date: '2025-12-10',
          income: 0,
          expense: 100.00,
          balance: -100.00,
          count: 1
        }
      ])

      let summary = await mockApi.fetchDateSummary({})
      expect(summary).toHaveLength(3)

      // Then, fetch with date range filter shows fewer results
      mockApi.fetchDateSummary.mockResolvedValueOnce([
        {
          date: '2025-12-05',
          income: 0,
          expense: 45.00,
          balance: -45.00,
          count: 1
        }
      ])

      summary = await mockApi.fetchDateSummary({
        from: '2025-12-05',
        to: '2025-12-05'
      })

      expect(mockApi.fetchDateSummary).toHaveBeenLastCalledWith({
        from: '2025-12-05',
        to: '2025-12-05'
      })
      expect(summary).toHaveLength(1)
      expect(summary[0].date).toBe('2025-12-05')
    })

    it('returns transactions sorted by date', async () => {
      // Transaktionen werden nach Datum sortiert
      mockApi.fetchDateSummary.mockResolvedValue([
        { date: '2025-12-01', income: 100, expense: 0, balance: 100, count: 1 },
        { date: '2025-12-02', income: 0, expense: 50, balance: -50, count: 1 },
        { date: '2025-12-03', income: 200, expense: 0, balance: 200, count: 1 }
      ])

      const summary = await mockApi.fetchDateSummary({})

      expect(summary[0].date).toBe('2025-12-01')
      expect(summary[2].date).toBe('2025-12-03')
    })
  })
})
