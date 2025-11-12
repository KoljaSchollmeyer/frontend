export function getCurrentUser() {
  try {
    const stored = localStorage.getItem('currentUser')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function setCurrentUser(user) {
  try {
    localStorage.setItem('currentUser', JSON.stringify(user))
  } catch {}
}

export function clearCurrentUser() {
  try {
    localStorage.removeItem('currentUser')
  } catch {}
}
