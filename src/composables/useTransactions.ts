import { ref } from 'vue'
import type { Transaction } from '../types'
import { apiGet, apiDelete, createTransaction as apiCreateTransaction, normalizeTransaction } from '../services/httpClient'
import { ERROR_MESSAGES } from '../constants/messages'

/**
 * Composable für Transaction-Management
 * Enthält CRUD-Operationen und Loading/Error-States
 */
export function useTransactions() {
  const list = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref('')
  async function loadTransactions(userId: number | null, options?: { from?: string; to?: string; categoryId?: number }) {
    if (!userId) return (list.value = [])
    loading.value = true
    error.value = ''
    try {
      const params = new URLSearchParams()
      params.set('userId', String(userId))
      if (options?.from) params.set('from', options.from)
      if (options?.to) params.set('to', options.to)
      if (options?.categoryId) params.set('categoryId', String(options.categoryId))

      const data = await apiGet<Array<Record<string, unknown>>>(`/transactions?${params.toString()}`)
      list.value = data.map((tx) => normalizeTransaction(tx))
    } catch {
      error.value = ERROR_MESSAGES.TRANSACTION_LOAD_FAILED
      list.value = []
    } finally {
      loading.value = false
    }
  }

  async function createTransaction(type: 'income' | 'expense', amount: number, description: string, date: string, categoryId: number, userId: number) {
    error.value = ''
    try {
      const newTransaction = await apiCreateTransaction({ type, amount, description, date, categoryId, userId })
      const normalized = normalizeTransaction(newTransaction as unknown as Record<string, unknown>)
      list.value.push(normalized)
      return normalized
    } catch (err: unknown) {
      error.value = String((err as Error)?.message || '') || ERROR_MESSAGES.TRANSACTION_CREATE_FAILED
      throw err
    }
  }

  /**
   * Löscht eine Transaktion
   */
  async function deleteTransaction(transactionId: number) {
    error.value = ''
    try {
      await apiDelete(`/transactions/${transactionId}`)
      list.value = list.value.filter(t => t.id !== transactionId)
    } catch (err: unknown) {
      error.value = String((err as Error)?.message || '') || ERROR_MESSAGES.TRANSACTION_DELETE_FAILED
      throw err
    }
  }

  return {
    list,
    loading,
    error,

    // Methods
    loadTransactions,
    createTransaction,
    deleteTransaction
  }
}
