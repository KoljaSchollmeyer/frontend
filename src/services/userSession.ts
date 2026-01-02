import type { User } from '../types'

export const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem('currentUser')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export const setCurrentUser = (user: User): void => {
  try { localStorage.setItem('currentUser', JSON.stringify(user)) } catch {
    // Ignore localStorage errors
  }
}

export const clearCurrentUser = (): void => {
  try { localStorage.removeItem('currentUser') } catch {
    // Ignore localStorage errors
  }
}
