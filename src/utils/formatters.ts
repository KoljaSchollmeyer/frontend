/**
 * Utility-Funktionen für Formatierung
 */

/**
 * Formatiert einen Betrag als Währung (EUR)
 * @example formatCurrency(1234.56) // "1.234,56 €"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

/**
 * Formatiert ein Datum im deutschen Format
 * @example formatDate('2025-12-30') // "30.12.2025"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('de-DE').format(date)
}

/**
 * Formatiert ein Datum für Input-Felder (ISO format)
 * @example formatDateForInput(new Date()) // "2025-12-30"
 */
export function formatDateForInput(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Parst einen Betrag von String zu Number (unterstützt Komma)
 * @example parseAmount('1.234,56') // 1234.56
 */
export function parseAmount(value: string): number {
  const normalized = String(value).replace(',', '.')
  return Number(normalized)
}

/**
 * Validiert ob ein String eine gültige Zahl ist
 */
export function isValidNumber(value: string): boolean {
  const num = parseAmount(value)
  return !Number.isNaN(num) && num >= 0
}
