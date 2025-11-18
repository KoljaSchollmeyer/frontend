export interface User {
  id: number
  name: string
  email: string
  password?: string
}

export interface Category {
  id: number
  name: string
  description: string
  userId: number
}

export interface Transaction {
  id: number
  date: string
  description: string
  type: 'income' | 'expense'
  amount: number
  categoryId: number
  userId: number
}

