/**
 * Validierungs-Utilities
 */

/**
 * Validiert E-Mail-Format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validiert Passwort-Anforderungen (mindestens 6 Zeichen)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6
}

/**
 * Prüft ob ein String nicht leer ist (nach trim)
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0
}

/**
 * Validiert maximale Länge
 */
export function maxLength(value: string, max: number): boolean {
  return value.length <= max
}
