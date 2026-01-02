import { describe, it, expect } from 'vitest'
import { isValidEmail, isValidPassword, isNotEmpty, maxLength } from '../validators'

describe('validators', () => {
  describe('isValidEmail', () => {
    // Gültige E-Mail-Adressen werden akzeptiert
    it('accepts valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('test.user@example.co.uk')).toBe(true)
      expect(isValidEmail('a@b.c')).toBe(true)
    })

    // Ungültige E-Mail-Adressen werden abgelehnt
    it('rejects invalid email addresses', () => {
      expect(isValidEmail('notanemail')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('user @example.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidPassword', () => {
    // Passwörter mit mindestens 6 Zeichen werden akzeptiert
    it('accepts passwords with 6+ characters', () => {
      expect(isValidPassword('123456')).toBe(true)
      expect(isValidPassword('password')).toBe(true)
      expect(isValidPassword('a1!@#$')).toBe(true)
    })

    // Passwörter mit weniger als 6 Zeichen werden abgelehnt
    it('rejects passwords with less than 6 characters', () => {
      expect(isValidPassword('12345')).toBe(false)
      expect(isValidPassword('pass')).toBe(false)
      expect(isValidPassword('')).toBe(false)
    })
  })

  describe('isNotEmpty', () => {
    // Nicht-leere Strings werden akzeptiert
    it('accepts non-empty strings', () => {
      expect(isNotEmpty('hello')).toBe(true)
      expect(isNotEmpty('a')).toBe(true)
      expect(isNotEmpty('  text  ')).toBe(true)
    })

    // Leere oder nur Whitespace-Strings werden abgelehnt
    it('rejects empty or whitespace-only strings', () => {
      expect(isNotEmpty('')).toBe(false)
      expect(isNotEmpty('   ')).toBe(false)
      expect(isNotEmpty('\t')).toBe(false)
    })
  })

  describe('maxLength', () => {
    // Strings innerhalb der maximalen Länge werden akzeptiert
    it('accepts strings within max length', () => {
      expect(maxLength('hello', 10)).toBe(true)
      expect(maxLength('hello', 5)).toBe(true)
      expect(maxLength('', 1)).toBe(true)
    })

    // Strings die maximale Länge überschreiten werden abgelehnt
    it('rejects strings exceeding max length', () => {
      expect(maxLength('hello', 4)).toBe(false)
      expect(maxLength('hello world', 5)).toBe(false)
    })
  })
})

