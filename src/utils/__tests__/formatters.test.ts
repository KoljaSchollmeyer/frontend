import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatDateForInput, parseAmount, isValidNumber } from '../formatters'

describe('formatters', () => {
  describe('formatCurrency', () => {
    // Beträge werden im deutschen Währungsformat (EUR) formatiert
    it('formats amounts as German currency (EUR)', () => {
      const result1 = formatCurrency(1234.56)
      expect(result1).toMatch(/1\.234,56\s*€/)
      
      const result2 = formatCurrency(0)
      expect(result2).toMatch(/0,00\s*€/)
      
      const result3 = formatCurrency(100)
      expect(result3).toMatch(/100,00\s*€/)
    })

    // Negative Beträge werden korrekt formatiert
    it('handles negative amounts', () => {
      const result = formatCurrency(-50.25)
      expect(result).toMatch(/-50,25\s*€/)
    })

    // Sehr große Beträge werden mit Tausendertrennern formatiert
    it('handles very large amounts', () => {
      const result = formatCurrency(1000000)
      expect(result).toMatch(/1\.000\.000,00\s*€/)
    })
  })

  describe('formatDate', () => {
    // ISO-Datumsstrings werden in deutsches Format (DD.MM.YYYY) umgewandelt
    it('formats ISO date strings to German format', () => {
      expect(formatDate('2025-12-30')).toBe('30.12.2025')
      const result = formatDate('2025-01-01')
      expect(result).toMatch(/1\.1\.2025|01\.01\.2025/)
    })

    // Verschiedene Datumsformate werden korrekt verarbeitet
    it('handles various date formats', () => {
      const result = formatDate('2024-06-15')
      expect(result).toMatch(/15\.6\.2024|15\.06\.2024/)
    })
  })

  describe('formatDateForInput', () => {
    // Date-Objekte werden in ISO-Format (YYYY-MM-DD) für Input-Felder formatiert
    it('formats Date objects to ISO input format (YYYY-MM-DD)', () => {
      const date = new Date('2025-12-30T12:00:00Z')
      const result = formatDateForInput(date)
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
    })

    // Aktuelles Datum wird verwendet wenn kein Datum übergeben wird
    it('uses current date if not provided', () => {
      const result = formatDateForInput()
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
    })
  })

  describe('parseAmount', () => {
    // Punkt-getrennte Beträge werden korrekt geparst
    it('parses dot-separated amounts', () => {
      expect(parseAmount('1234.56')).toBe(1234.56)
      expect(parseAmount('100.00')).toBe(100)
    })

    // Einfache Ganzzahlen werden korrekt geparst
    it('parses simple integers', () => {
      expect(parseAmount('50')).toBe(50)
      expect(parseAmount('0')).toBe(0)
    })

    // Negative Beträge werden korrekt verarbeitet
    it('handles negative amounts', () => {
      expect(parseAmount('-50.25')).toBe(-50.25)
    })

    // Komma-getrennte Beträge werden als Punkt-Format interpretiert
    it('treats German comma-separated format as dot format', () => {
      const result = parseAmount('100,50')
      expect(result).toBe(100.5)
    })
  })

  describe('isValidNumber', () => {
    // Gültige positive Zahlen (Punkt-Format) werden akzeptiert
    it('accepts valid positive numbers (dot format)', () => {
      expect(isValidNumber('100')).toBe(true)
      expect(isValidNumber('1234.56')).toBe(true)
      expect(isValidNumber('0')).toBe(true)
    })

    // Negative Zahlen werden abgelehnt
    it('rejects negative numbers', () => {
      expect(isValidNumber('-50')).toBe(false)
    })

    // Leerer String wird als Null (gültig) behandelt
    it('treats empty string as zero (valid)', () => {
      expect(isValidNumber('')).toBe(true)
    })

    // Nicht-numerische Strings werden abgelehnt
    it('rejects non-numeric strings', () => {
      expect(isValidNumber('abc')).toBe(false)
    })
  })
})


