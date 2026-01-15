/**
 * Utility-Funktionen für Formatierung
 * Enthält Helfer für Währungen, Datumsangaben und Zahlen-Parsing.
 */

/**
 * Formatiert eine Zahl als Euro-Währungstring nach deutschem Standard.
 * @example formatCurrency(1234.56) // "1.234,56 €"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

/**
 * Formatiert einen Datums-String (YYYY-MM-DD) in ein lesbares deutsches Format (DD.MM.YYYY).
 * @example formatDate('2025-12-30') // "30.12.2025"
 */
export function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('de-DE').format(date)
}

/**
 * Erzeugt einen ISO-String (YYYY-MM-DD) für HTML-Input-Felder (type="date").
 * Standardmäßig wird das aktuelle Datum verwendet.
 * @example formatDateForInput(new Date()) // "2025-12-30"
 */
export function formatDateForInput(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Wandelt einen Eingabestring in eine nutzbare Zahl um.
 * Ersetzt deutsche Kommas durch Punkte für korrekte Berechnung.
 * @example parseAmount('1.234,56') // 1234.56
 */
export function parseAmount(value: string): number {
  if (!value) return 0
  const normalized = String(value).replace(',', '.')
  return Number(normalized)
}