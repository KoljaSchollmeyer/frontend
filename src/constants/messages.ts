/**
 * Zentralisierte Error- und Info-Messages
 */

export const ERROR_MESSAGES = {
  // Auth Errors
  AUTH_REQUIRED: 'Bitte zuerst registrieren oder anmelden.',
  AUTH_SESSION_EXPIRED: 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.',
  AUTH_LOGOUT_FAILED: 'Logout fehlgeschlagen',
  AUTH_ACCESS_DENIED: 'Zugriff verweigert',
  
  // Category Errors
  CATEGORY_LOAD_FAILED: 'Kategorien konnten nicht geladen werden. Bitte später erneut versuchen.',
  CATEGORY_CREATE_FAILED: 'Kategorie konnte nicht erstellt werden. Bitte überprüfen Sie Ihre Eingabe und versuchen es erneut.',
  CATEGORY_DELETE_HAS_TRANSACTIONS: 'Kategorie kann nicht gelöscht werden – zuerst zugeordnete Transaktionen löschen.',
  CATEGORY_DELETE_NO_PERMISSION: 'Zugriff verweigert: Diese Kategorie gehört einem anderen Benutzer.',
  CATEGORY_DELETE_FAILED: 'Kategorie konnte nicht gelöscht werden. Bitte später erneut versuchen.',
  CATEGORY_REQUIRED: 'Bitte eine Kategorie wählen.',
  
  // Transaction Errors
  TRANSACTION_LOAD_FAILED: 'Transaktionen konnten nicht geladen werden. Bitte später erneut versuchen.',
  TRANSACTION_CREATE_FAILED: 'Transaktion konnte nicht erstellt werden.',
  TRANSACTION_DELETE_NO_PERMISSION: 'Zugriff verweigert: Diese Transaktion gehört einem anderen Benutzer.',
  TRANSACTION_DELETE_FAILED: 'Transaktion konnte nicht gelöscht werden. Bitte später erneut versuchen.',
  
  // Summary Errors
  SUMMARY_LOAD_FAILED: 'Zusammenfassung konnte nicht geladen werden. Bitte später erneut versuchen.',
  
  // Generic
  NETWORK_ERROR: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
  UNKNOWN_ERROR: 'Ein unerwarteter Fehler ist aufgetreten.'
} as const

export const INFO_MESSAGES = {
  LOADING_CATEGORIES: 'Lade Kategorien…',
  LOADING_TRANSACTIONS: 'Lade Transaktionen…',
  NO_CATEGORIES: 'Noch keine Kategorien.',
  NO_TRANSACTIONS: 'Noch keine Transaktionen vorhanden.',
  WELCOME: 'Willkommen zu FinanceMaster!',
  LOGIN_PROMPT: 'Bitte melden Sie sich an oder registrieren Sie sich, um Ihre Finanzen zu verwalten.'
} as const
