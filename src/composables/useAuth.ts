import { ref } from 'vue'
import type { User } from '../types'
import { logoutUser, fetchMe } from '../services/httpClient'
import { getCurrentUser, setCurrentUser, clearCurrentUser } from '../services/userSession'

/**
 * Composable für Auth-Management
 */
export function useAuth() {
  const currentUser = ref<User | null>(getCurrentUser())
  const authError = ref('')

  /**
   * Meldet einen User ab
   */
  async function logout() {
    authError.value = ''

    try {
      await logoutUser()
    } catch {
      // Ignore logout errors - even if backend fails, clear local state
    } finally {
      // Always clear user state locally
      currentUser.value = null
      clearCurrentUser()
    }
  }

  /**
   * Stellt die Session wieder her
   */
  async function restoreSession() {
    try {
      const user = await fetchMe()
      if (user) {
        currentUser.value = user
        setCurrentUser(user)
      }
    } catch {
      currentUser.value = null
      clearCurrentUser()
    }
  }

  return {
    currentUser,
    authError,
    logout,
    restoreSession
  }
}
