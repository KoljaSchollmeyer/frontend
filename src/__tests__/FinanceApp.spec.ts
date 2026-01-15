import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { store } from '../stores/financeStore'
import { api } from '../services/api'
import LoginView from '../views/LoginView.vue'
import CategoryManager from '../components/CategoryManager.vue'
import TransactionManager from '../components/TransactionManager.vue'
import DarkMode from '../components/DarkMode.vue'

// Typ-Definition für das HTML-Button-Element für typsicheren Zugriff
type HTMLButtonElement = globalThis.HTMLButtonElement;

describe('FinanceMaster App Tests', () => {

  // Vor jedem Test wird die Umgebung komplett zurückgesetzt,
  // um Seiteneffekte zwischen den Tests zu verhindern.
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    
    // --- Browser-API Mocks ---
    
    // Simulation des LocalStorage
    const localStorageMock = (() => {
      let storage: Record<string, string> = {}
      return {
        getItem: (key: string) => storage[key] || null,
        setItem: (key: string, value: string) => { storage[key] = value.toString() },
        clear: () => { storage = {} },
        removeItem: (key: string) => { delete storage[key] }
      }
    })()
    
    Object.defineProperty(window, 'localStorage', { 
      value: localStorageMock,
      writable: true 
    })

    // Simulation von matchMedia (benötigt für DarkMode Erkennung in LoginView)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    document.body.className = ''
    
    // --- Store Reset ---
    store.user = null
    store.error = null
    store.loading = false
    store.balance = { totalIncome: 0, totalExpense: 0, balance: 0 }
    store.transactions = []
    store.categories = []

    // --- API Spies ---
    // Wir definieren Standard-Rückgabewerte für alle API-Aufrufe,
    // damit die Tests nicht versuchen, echte Netzwerk-Requests zu machen.
    vi.spyOn(api, 'login').mockResolvedValue({} as unknown as Awaited<ReturnType<typeof api.login>>)
    vi.spyOn(api, 'register').mockResolvedValue({} as unknown as Awaited<ReturnType<typeof api.register>>)
    vi.spyOn(api, 'logout').mockResolvedValue(undefined as unknown as Awaited<ReturnType<typeof api.logout>>)
    vi.spyOn(api, 'session').mockResolvedValue(null as unknown as Awaited<ReturnType<typeof api.session>>)
    vi.spyOn(api, 'get').mockResolvedValue([] as unknown as Awaited<ReturnType<typeof api.get>>)
    vi.spyOn(api, 'post').mockResolvedValue({} as unknown as Awaited<ReturnType<typeof api.post>>)
    vi.spyOn(api, 'delete').mockResolvedValue({} as unknown as Awaited<ReturnType<typeof api.delete>>)
  })

  // ---------------------------------------------------------
  // AUTHENTIFIZIERUNG
  // ---------------------------------------------------------
  
  it('sollte einen neuen Nutzer erfolgreich registrieren', async () => {
    const mockUser = { id: 1, name: 'Test', email: 'test@mail.de' }
    vi.spyOn(api, 'register').mockResolvedValue(mockUser as unknown as Awaited<ReturnType<typeof api.register>>)

    const wrapper = mount(LoginView)
    
    // Wechsel zum Registrierungs-Modus
    await wrapper.find('.auth-switch button').trigger('click')
    
    // Formular ausfüllen (Selektor passt zum Placeholder "Ihr Name" in LoginView)
    await wrapper.find('input[placeholder="Ihr Name"]').setValue('Test User')
    await wrapper.find('input[type="email"]').setValue('test@mail.de')
    await wrapper.find('input[type="password"]').setValue('123456')
    
    // Absenden
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    // Prüfung
    expect(api.register).toHaveBeenCalled()
    expect(store.user).toEqual(mockUser)
  })

  it('sollte eine Fehlermeldung zeigen, wenn der Login fehlschlägt', async () => {
    // Simuliert einen Fehler vom Backend
    vi.spyOn(api, 'login').mockRejectedValue(new Error('Auth failed'))

    const wrapper = mount(LoginView)
    
    await wrapper.find('input[type="email"]').setValue('falsch@mail.de')
    await wrapper.find('input[type="password"]').setValue('falsch')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(store.error).toContain('Anmeldung fehlgeschlagen')
    expect(store.user).toBeNull()
  })

  it('sollte beim Logout alle Daten aus dem State entfernen', async () => {
    // Setup eines eingeloggten Zustands
    store.user = { id: 1, name: 'User', email: 'u@test.de' }
    store.transactions = [{ id: 1 } as unknown as typeof store.transactions[0]]
    
    await store.logout()
    
    expect(api.logout).toHaveBeenCalled()
    expect(store.user).toBeNull()
    expect(store.transactions).toHaveLength(0)
  })

  // ---------------------------------------------------------
  // KATEGORIEN
  // ---------------------------------------------------------

  it('sollte eine neue Kategorie erstellen', async () => {
    const wrapper = mount(CategoryManager)
    
    await wrapper.find('.input-name').setValue('Miete')
    await wrapper.find('.input-desc').setValue('Wohnung')
    
    vi.spyOn(api, 'post').mockResolvedValue({ id: 1, name: 'Miete' } as unknown as Awaited<ReturnType<typeof api.post>>)
    
    await wrapper.find('button.btn-primary').trigger('click')
    
    expect(api.post).toHaveBeenCalledWith('/categories', { name: 'Miete', description: 'Wohnung' })
  })

  it('sollte das Löschen einer Kategorie verhindern, wenn sie noch benutzt wird', async () => {
    // Vorbedingung: Kategorie 5 wird von einer Transaktion genutzt
    store.categories = [{ id: 5, name: 'Essen', description: '' }]
    store.transactions = [{ id: 100, categoryId: 5 } as unknown as typeof store.transactions[0]]
    
    const wrapper = mount(CategoryManager)
    await wrapper.find('.btn-danger').trigger('click')
    
    // Erwartung: Kein API-Call, stattdessen Fehlermeldung im Store
    expect(api.delete).not.toHaveBeenCalled()
    expect(store.error).toContain('Kategorie konnte nicht gelöscht werden')
  })

  it('sollte eine unbenutzte Kategorie erfolgreich löschen', async () => {
    store.categories = [{ id: 99, name: 'Leer', description: '' }]
    store.transactions = [] 
    
    const wrapper = mount(CategoryManager)
    await wrapper.find('.btn-danger').trigger('click')
    
    expect(api.delete).toHaveBeenCalledWith('/categories/99')
  })

  // ---------------------------------------------------------
  // TRANSAKTIONEN & WÄHRUNG
  // ---------------------------------------------------------

  it('sollte eine Standard-Transaktion in EUR speichern', async () => {
    store.categories = [{ id: 1, name: 'TestCat', description: '' }]
    const wrapper = mount(TransactionManager)
    
    await wrapper.find('.input-amount').setValue(50)
    await wrapper.find('.input-cat').setValue(1)
    
    await wrapper.find('button.btn-primary').trigger('click')
    
    expect(api.post).toHaveBeenCalledWith('/transactions', expect.objectContaining({
      amount: 50,
      categoryId: 1
    }))
  })

  it('sollte Fremdwährungen korrekt umrechnen und speichern', async () => {
    store.categories = [{ id: 1, name: 'TestCat', description: '' }]

    const wrapper = mount(TransactionManager)
    
    // Mock für die externe Währungs-API (frankfurter.app)
    global.fetch = vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ rates: { EUR: 0.85 } })
      } as Response)
    )

    // 1. Währung ändern auf USD
    await wrapper.find('.input-currency').setValue('USD')
    
    // 2. Warten auf Netzwerk-Response
    await flushPromises() 
    await wrapper.vm.$nextTick()
    
    // 3. Werte eingeben (100 USD)
    await wrapper.find('.input-amount').setValue(100)
    await wrapper.find('.input-cat').setValue(1)
    
    // 4. Speichern
    await wrapper.find('button.btn-primary').trigger('click')
    
    // Erwartung: Umrechnung 100 * 0.85 = 85 EUR wird an API gesendet
    expect(api.post).toHaveBeenCalledWith('/transactions', expect.objectContaining({
      amount: 85
    }))
  })

  it('sollte das Speichern blockieren, wenn der Währungskurs nicht geladen werden kann', async () => {
    const wrapper = mount(TransactionManager)
    
    // Simuliert API-Ausfall (Offline)
    global.fetch = vi.fn(() => Promise.reject(new Error('Offline')))

    await wrapper.find('.input-currency').setValue('GBP')
    await flushPromises()
    await wrapper.vm.$nextTick()

    // Erwartung: Fehleranzeige im Store und deaktivierter Button
    expect(store.error).toContain('Währungskurs konnte nicht geladen werden')
    const btn = wrapper.find('button.btn-primary')
    
    expect((btn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('sollte Validierungsfehler zeigen bei fehlendem Betrag oder Kategorie', async () => {
    const wrapper = mount(TransactionManager)
    
    // Klick ohne Eingaben
    await wrapper.find('button.btn-primary').trigger('click')
    
    expect(store.error).toContain('Bitte einen Betrag eingeben')
    expect(api.post).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------
  // LOGIK & DASHBOARD
  // ---------------------------------------------------------

  it('sollte Daten neu laden, wenn der Filter geändert wird', async () => {
    const spy = vi.spyOn(store, 'fetchTransactions')
    
    // Änderung am Filter-State löst den Watcher aus
    store.txFilter.categoryId = 5
    await flushPromises()
    
    expect(spy).toHaveBeenCalled()
    expect(api.get).toHaveBeenCalledWith('/transactions', expect.objectContaining({
      categoryId: 5
    }))
  })

  it('sollte einen Fehler im Store setzen, wenn das Laden der Transaktionen fehlschlägt', async () => {
    // Wir manipulieren direkt die Store-Methode, damit refreshAll() fehlschlägt.
    // Ein Fehler im API-Call allein würde von fetchTransactions() verschluckt werden.
    vi.spyOn(store, 'fetchTransactions').mockRejectedValue(new Error('Server Error'))

    await store.refreshAll()
    
    expect(store.error).toBe('Fehler beim Laden der Daten.')
    expect(store.loading).toBe(false)
  })

  it('sollte Beispieldaten generieren (API Aufrufe Sequenz)', async () => {
    // Wir stellen sicher, dass jeder Post-Call eine ID zurückgibt, 
    // falls die Logik im Store darauf angewiesen ist (Kategorie -> Transaktion).
    vi.spyOn(api, 'post').mockResolvedValue({ id: 123 } as unknown as Awaited<ReturnType<typeof api.post>>)
    
    await store.generateExampleData()
    
    // Die Generierung erzeugt 9 Aufrufe (3 Kategorien + diverse Transaktionen)
    expect(api.post).toHaveBeenCalledTimes(9)
    expect(store.loading).toBe(false)
  })

  // ---------------------------------------------------------
  // SYSTEM
  // ---------------------------------------------------------

  it('sollte den Dark Mode im LocalStorage speichern', async () => {
    localStorage.setItem('theme', 'light')
    
    const wrapper = mount(DarkMode)
    
    // Toggle Switch betätigen
    await wrapper.find('input[type="checkbox"]').setValue(false) 
    await flushPromises()
    
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.body.classList.contains('dark-mode')).toBe(true)
  })
})