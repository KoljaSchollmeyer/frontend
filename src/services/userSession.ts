import type { User } from '../types'

export function getCurrentUser(): User | null {
  try {
    const stored = localStorage.getItem('currentUser')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function setCurrentUser(user: User): void {
  try {
    localStorage.setItem('currentUser', JSON.stringify(user))
  } catch {}
}

export function clearCurrentUser(): void {
  try {
    localStorage.removeItem('currentUser')
  } catch {}
}
