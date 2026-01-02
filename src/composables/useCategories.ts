import { ref } from 'vue'
import type { Category } from '../types'
import { apiGet, apiDelete, createCategory as apiCreateCategory } from '../services/httpClient'
import { ERROR_MESSAGES } from '../constants/messages'

/**
 * Composable für Category-Management
 * Enthält CRUD-Operationen und Loading/Error-States
 */
export function useCategories() {
  const list = ref<Category[]>([])
  const loading = ref(false)
  const error = ref('')
  /**
   * Lädt alle Kategorien für einen User
   */
  async function loadCategories(userId: number | null) {
    if (!userId) return (list.value = [])
    loading.value = true
    error.value = ''
    try {
      list.value = await apiGet<Category[]>(`/categories?userId=${encodeURIComponent(userId)}`)
    } catch {
      error.value = ERROR_MESSAGES.CATEGORY_LOAD_FAILED
      list.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Erstellt eine neue Kategorie
   */
  async function createCategory(name: string, description: string, userId: number) {
    error.value = ''
    try {
      const newCategory = await apiCreateCategory({ name, description, userId })
      list.value.push(newCategory)
      return newCategory
    } catch (err: unknown) {
      error.value = String((err as Error)?.message || '') || ERROR_MESSAGES.CATEGORY_CREATE_FAILED
      throw err
    }
  }

  /**
   * Löscht eine Kategorie
   */
  async function deleteCategory(categoryId: number): Promise<boolean> {
    error.value = ''
    try {
      await apiDelete(`/categories/${categoryId}`)
      list.value = list.value.filter(c => c.id !== categoryId)
      return true
    } catch (err: unknown) {
      const msg = String((err as Error)?.message || '')
      error.value = msg.includes('associated transactions') || msg.includes('cannot be deleted') || msg.includes('Transaktionen')
        ? ERROR_MESSAGES.CATEGORY_DELETE_HAS_TRANSACTIONS
        : msg.includes('401') || msg.includes('unauthorized')
        ? ERROR_MESSAGES.AUTH_SESSION_EXPIRED
        : msg.includes('403') || msg.includes('Access denied')
        ? ERROR_MESSAGES.CATEGORY_DELETE_NO_PERMISSION
        : msg || ERROR_MESSAGES.CATEGORY_DELETE_FAILED
      return false
    }
  }

  return {
    list,
    loading,
    error,

    // Methods
    loadCategories,
    createCategory,
    deleteCategory
  }
}
