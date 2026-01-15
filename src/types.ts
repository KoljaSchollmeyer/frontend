export interface Transaction {
  id: number
  description: string
  amount: number
  type: 'income' | 'expense'
  date: string
  categoryId: number
  categoryName: string
}

export interface Category {
  id: number
  name: string
  description?: string
}

export interface User {
  id: number
  name: string
  email: string
}

export interface Balance {
  totalIncome: number
  totalExpense: number
  balance: number
}

export interface Filter {
  timeMode: 'all' | 'range'
  from?: string
  to?: string
  categoryId?: number
}