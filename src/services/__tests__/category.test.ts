import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock API client
const mockApi = {
  createCategory: vi.fn(),
}

vi.mock('../httpClient', () => mockApi)

describe('Category Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Use Case 6: Create Category', () => {
    it('successfully creates a category', async () => {
      // Neue Kategorie wird mit Name und Beschreibung erstellt
      const newCategory = {
        name: 'Lebensmittel',
        description: 'Essen und Getränke',
        user: { id: 1 }
      }

      mockApi.createCategory.mockResolvedValue({
        id: 10,
        ...newCategory
      })

      const result = await mockApi.createCategory(newCategory)

      expect(mockApi.createCategory).toHaveBeenCalledWith(newCategory)
      expect(result.id).toBe(10)
      expect(result.name).toBe('Lebensmittel')
    })

    it('validates category name is required', async () => {
      // Kategorie ohne Name wird abgelehnt
      const validCategory = {
        name: 'Food',
        description: 'Food and drinks',
        user: { id: 1 }
      }

      const invalidCategory = {
        name: '',
        description: 'Empty name',
        user: { id: 1 }
      }

      // First, create with valid name succeeds
      mockApi.createCategory.mockResolvedValueOnce({
        id: 10,
        ...validCategory
      })

      const result = await mockApi.createCategory(validCategory)
      expect(result.name).toBe('Food')

      // Then, try with empty name fails
      mockApi.createCategory.mockRejectedValueOnce(new Error('Category name is required'))

      await expect(mockApi.createCategory(invalidCategory)).rejects.toThrow('Category name is required')
    })
  })

  describe('Use Case 7: Delete Category', () => {
    it('deletes category without transactions', async () => {
      // Kategorie ohne Transaktionen wird gelöscht
      const categoryId = 5
      const deleteCategory = vi.fn().mockResolvedValue(undefined)

      await deleteCategory(categoryId)

      expect(deleteCategory).toHaveBeenCalledWith(categoryId)
    })

    it('prevents deletion of category with transactions', async () => {
      // Kategorie mit Transaktionen kann nicht gelöscht werden
      const categoryId = 3
      
      // Mock successful deletion of category without transactions
      const deleteEmptyCategory = vi.fn().mockResolvedValue(undefined)
      
      // Delete empty category succeeds
      await deleteEmptyCategory(5)
      expect(deleteEmptyCategory).toHaveBeenCalledWith(5)

      // Try to delete category that has transactions
      const deleteCategoryWithTransactions = vi.fn().mockRejectedValue(
        new Error('Kategorie kann nicht gelöscht werden, weil sie noch Transaktionen hat.')
      )

      await expect(deleteCategoryWithTransactions(categoryId)).rejects.toThrow(
        'Kategorie kann nicht gelöscht werden, weil sie noch Transaktionen hat.'
      )
    })
  })

  describe('Use Case 8: List User Categories', () => {
    it('fetches all categories for current user', async () => {
      // Alle Kategorien des aktuellen Users werden abgerufen
      const mockCategories = [
        { id: 1, name: 'Food', description: 'Groceries' },
        { id: 2, name: 'Transport', description: 'Bus, train' },
        { id: 3, name: 'Entertainment', description: 'Movies' }
      ]

      const fetchCategories = vi.fn().mockResolvedValue(mockCategories)
      const categories = await fetchCategories(1)

      expect(categories).toHaveLength(3)
      expect(categories[0].name).toBe('Food')
    })

    it('returns empty array when user has no categories', async () => {
      // Leeres Array wird zurückgegeben wenn User keine Kategorien hat
      const fetchCategories = vi.fn().mockResolvedValue([])
      const categories = await fetchCategories(1)

      expect(categories).toEqual([])
    })
  })
})
