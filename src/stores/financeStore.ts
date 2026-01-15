import { reactive, watch } from 'vue'
import { api } from '../services/api'
import type { Transaction, Category, Balance, User, Filter } from '../types'

// Hilfstypen für neue Einträge (noch ohne ID)
type NewTransaction = Omit<Transaction, 'id' | 'categoryName'>
type NewCategory = Omit<Category, 'id'>

// Entfernt leere Parameter für die API-Anfrage
function cleanParams(filter: Filter): Record<string, unknown> {
  const params = { ...filter } as Record<string, unknown>
  if (params.timeMode === 'all') {
    delete params.from
    delete params.to
  }
  return params
}

export const store = reactive({
  user: null as User | null,
  transactions: [] as Transaction[],
  categories: [] as Category[],
  
  // Standard-Initialisierung für die Bilanz
  balance: { totalIncome: 0, totalExpense: 0, balance: 0 } as Balance,
  
  // Filter-Zustände
  summaryFilter: { timeMode: 'all' } as Filter,
  txFilter: { timeMode: 'all' } as Filter,
  
  loading: false,
  error: null as string | null,

  // Initialisierung beim App-Start
  async init() {
    this.user = await api.session()
    if (this.user) {
      await this.refreshAll() 
    }
  },

  // Authentifizierung
  async login(creds: Record<string, string>) { 
    this.user = await api.login(creds)
    await this.refreshAll() 
  },

  async register(data: Record<string, string>) { 
    this.user = await api.register(data)
    await this.refreshAll() 
  },

  async logout() { 
    await api.logout()
    this.user = null
    this.transactions = [] 
  },

  // Lädt alle relevanten Daten neu
  async refreshAll() {
    this.loading = true
    try {
      await Promise.all([
        this.fetchCategories(),
        this.fetchBalance(),
        this.fetchTransactions()
      ])
    } catch {
      this.error = 'Fehler beim Laden der Daten.'
    } finally {
      this.loading = false
    }
  },

  async fetchCategories() {
    try { 
      this.categories = await api.get<Category[]>('/categories') 
    } catch { 
      // Fehler ignoriert
    }
  },

  async fetchBalance() {
    try {
      this.balance = await api.get<Balance>(
        '/transactions/summary/balance', 
        cleanParams(this.summaryFilter)
      )
    } catch { 
      // Fehler ignoriert
    }
  },

  async fetchTransactions() {
    try {
      this.transactions = await api.get<Transaction[]>(
        '/transactions', 
        cleanParams(this.txFilter)
      )
    } catch { 
      // Fehler ignoriert
    }
  },

  // Daten-Manipulationen (Typ-sicher)
  async addTx(tx: NewTransaction) { 
    await api.post('/transactions', tx)
    await this.refreshAll() 
  },

  async delTx(id: number) { 
    await api.delete(`/transactions/${id}`)
    await this.refreshAll() 
  },

  async addCat(cat: NewCategory) { 
    await api.post('/categories', cat)
    await this.refreshAll() 
  },

  async delCat(id: number) { 
    await api.delete(`/categories/${id}`)
    await this.refreshAll() 
  },

  // Erstellt Demo-Daten für neue Nutzer mit unterschiedlichen Datumsangaben
  async generateExampleData() {
    this.loading = true

    // Helfer: Gibt ein Datum im Format YYYY-MM-DD zurück, das X Tage in der Vergangenheit liegt
    const daysAgo = (days: number) => {
      const date = new Date()
      date.setDate(date.getDate() - days)
      return date.toISOString().split('T')[0]
    }

    try {
      // 1. Kategorie: Mensa & Lebensmittel
      const cat1 = await api.post<Category>('/categories', { 
        name: 'Verpflegung [BEISPIEL]', 
        description: 'Mensa und Supermarkt' 
      })
      
      // Transaktionen für Kat 1 (Heute, vor 2 Tagen, vor 5 Tagen)
      await api.post('/transactions', {
        description: 'Mittagessen Mensa',
        amount: 4.50,
        type: 'EXPENSE',
        categoryId: cat1.id,
        date: daysAgo(0) // Heute
      })
      
      await api.post('/transactions', {
        description: 'Wocheneinkauf Lidl',
        amount: 32.80,
        type: 'EXPENSE',
        categoryId: cat1.id,
        date: daysAgo(2) // Vorgestern
      })
      
      await api.post('/transactions', {
        description: 'Kaffee am Campus',
        amount: 2.80,
        type: 'EXPENSE',
        categoryId: cat1.id,
        date: daysAgo(5) // Vor 5 Tagen
      })


      // 2. Kategorie: Studium
      const cat2 = await api.post<Category>('/categories', { 
        name: 'Studium [BEISPIEL]', 
        description: 'Bücher und Material' 
      })
      
      // Transaktionen für Kat 2 (Vor 10 Tagen, vor 3 Wochen)
      await api.post('/transactions', {
        description: 'Fachbuch Programmierung',
        amount: 45.00,
        type: 'EXPENSE',
        categoryId: cat2.id,
        date: daysAgo(10) 
      })

      await api.post('/transactions', {
        description: 'Semesterbeitrag (Anteilig)',
        amount: 120.00,
        type: 'EXPENSE',
        categoryId: cat2.id,
        date: daysAgo(21) 
      })


      // 3. Kategorie: Einkommen
      const cat3 = await api.post<Category>('/categories', { 
        name: 'Werkstudentenjob [BEISPIEL]', 
        description: 'Monatliches Gehalt' 
      })
      
      // Transaktion für Kat 3 (Gestern)
      await api.post('/transactions', {
        description: 'Gehaltseingang',
        amount: 950.00,
        type: 'INCOME',
        categoryId: cat3.id,
        date: daysAgo(1) // Gestern
      })

      // Alles neu laden, damit es angezeigt wird
      await this.refreshAll()

    } catch {
      this.error = 'Konnte Beispieldaten nicht erstellen.'
    } finally {
      this.loading = false
    }
  }
})

// Automatische Aktualisierung bei Filter-Änderungen
watch(() => store.summaryFilter, () => store.fetchBalance(), { deep: true })
watch(() => store.txFilter, () => store.fetchTransactions(), { deep: true })