/**
 * API-Konstanten für Backend-Kommunikation
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',
  
  // Categories
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id: number) => `/categories/${id}`,
  
  // Transactions
  TRANSACTIONS: '/transactions',
  TRANSACTION_BY_ID: (id: number) => `/transactions/${id}`,
  
  // Summary
  SUMMARY: '/summary'
} as const
