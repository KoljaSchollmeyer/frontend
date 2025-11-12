<script setup>
import { ref, onMounted, computed } from 'vue'
import CategoryList from './components/CategoryList.vue'
import TransactionList from './components/TransactionList.vue'
import ErrorBanner from './components/ErrorBanner.vue'
import SignupForm from './components/SignupForm.vue'
import LoginForm from './components/LoginForm.vue'
import { getCurrentUser, setCurrentUser, clearCurrentUser } from './auth.js'
import { apiGet, getCategories as apiGetCategories, getTransactions as apiGetTransactions, createCategory as apiCreateCategory, createTransaction as apiCreateTransaction, createUser as apiCreateUser } from './api.js'

// Load data only from backend; no example data in FE
const categories = ref([])
const transactions = ref([])

// loading and error state
const loadingCategories = ref(false)
const loadingTransactions = ref(false)
const errorCategories = ref('')
const errorTransactions = ref('')

// current user and initial view
const currentUser = ref(getCurrentUser())
// views: 'login' | 'signup' | 'app' (default to login if no user yet)
const view = ref(currentUser.value ? 'app' : 'login')
const authError = ref('')
const isSignedIn = computed(() => !!currentUser.value?.id)
const MISSING_USER_MSG = 'Bitte zuerst registrieren oder anmelden.'

async function fetchCategories() {
  loadingCategories.value = true
  errorCategories.value = ''
  try {
    const data = await apiGetCategories()
    categories.value = (data || []).map((c) => ({ id: c.id, name: c.name, description: c.description }))
  } catch (err) {
    errorCategories.value = 'Kategorien konnten nicht geladen werden. Bitte später erneut versuchen.'
    categories.value = []
  } finally {
    loadingCategories.value = false
  }
}

async function fetchTransactions() {
  loadingTransactions.value = true
  errorTransactions.value = ''
  try {
    const tx = await apiGetTransactions()
    transactions.value = (tx || []).map((t) => ({ id: t.id, date: t.date, description: t.description, category: t.category?.name || t.category || '', type: t.type, amount: t.amount }))
  } catch (err) {
    errorTransactions.value = 'Transaktionen konnten nicht geladen werden. Bitte später erneut versuchen.'
    transactions.value = []
  } finally {
    loadingTransactions.value = false
  }
}

onMounted(async () => {
  if (isSignedIn.value) {
    view.value = 'app'
    await fetchCategories()
    await fetchTransactions()
  } else {
    view.value = 'login'
  }
})

function addCategory(payload) {
  if (!isSignedIn.value) {
    errorCategories.value = MISSING_USER_MSG
    view.value = 'login'
    return
  }
  // try to persist category on backend
  apiCreateCategory({ name: payload.name, description: payload.description, userId: currentUser.value.id })
    .then(async () => {
      await fetchCategories()
    })
    .catch(() => {
      errorCategories.value = 'Kategorie konnte nicht gespeichert werden.'
    })
}

async function addTransaction(payload) {
  // POST to backend and update local list with returned entity; fallback to local push
  try {
    if (!isSignedIn.value) {
      throw new Error('no-user')
    }
    // Ensure backend receives a Category reference by id only
    await apiCreateTransaction({
      type: payload.type,
      amount: payload.amount,
      description: payload.description,
      date: payload.date,
      categoryId: payload.categoryId,
      userId: currentUser.value.id
    })
    // re-fetch to ensure state matches server (ids, normalization)
    await fetchTransactions()
  } catch (e) {
    if (e && e.message === 'no-user') {
      errorTransactions.value = MISSING_USER_MSG
      view.value = 'login'
      return
    }
    console.warn('Failed to save transaction to API', e)
    errorTransactions.value = 'Transaktion konnte nicht gespeichert werden.'
  }
}

function signedUp(user) {
  currentUser.value = user
  setCurrentUser(user)
  view.value = 'app'
  fetchCategories()
  fetchTransactions()
}

function loggedIn(user) {
  currentUser.value = user
  setCurrentUser(user)
  view.value = 'app'
  fetchCategories()
  fetchTransactions()
}

async function proceedAnonymous() {
  try {
    authError.value = ''
    const GUEST_EMAIL = 'guest@financemaster.local'
    const GUEST_NAME = 'Gast'
    // Try to find existing guest user by email
    const users = await apiGet('/users')
    let guest = (users || []).find(u => (u.email || '').toLowerCase() === GUEST_EMAIL)
    if (!guest) {
      guest = await apiCreateUser({ name: GUEST_NAME, email: GUEST_EMAIL, password: '12345' })
    }
    signedUp(guest)
    // Seed demo data for guest if empty
    await seedGuestDataIfNeeded(guest.id)
  } catch (e) {
    authError.value = 'Gast-Anmeldung fehlgeschlagen.'
  }
}

async function seedGuestDataIfNeeded(userId) {
  try {
    await fetchCategories()
    if (!categories.value.length) {
      await apiCreateCategory({ name: 'Essen', description: 'Lebensmittel', userId })
      await apiCreateCategory({ name: 'Gehalt', description: 'Monatlich', userId })
      await fetchCategories()
    }
    await fetchTransactions()
    if (!transactions.value.length && categories.value.length) {
      const cat = categories.value[0]
      const today = new Date().toISOString().slice(0,10)
      await apiCreateTransaction({ type: 'income', amount: 1200, description: 'Demo-Gehalt', date: today, categoryId: cat.id, userId })
      await fetchTransactions()
    }
  } catch (_) {
    // best-effort seeding; ignore failures
  }
}

function logout() {
  clearCurrentUser()
  currentUser.value = null
  view.value = 'login'
  categories.value = []
  transactions.value = []
}

function switchToSignup() {
  authError.value = ''
  view.value = 'signup'
}
</script>

<template>
  <div class="auth-wrapper" v-if="view === 'login' || view === 'signup'">
    <div class="auth-card">
      <LoginForm
        v-if="view === 'login'"
        :external-error="authError"
        @logged-in="loggedIn"
        @proceed-anonymous="proceedAnonymous"
        @switch-to-signup="switchToSignup"
      />
      <SignupForm
        v-else
        :external-error="authError"
        @signed-up="signedUp"
        @proceed-anonymous="proceedAnonymous"
      />
    </div>
  </div>

  <main class="container" v-else-if="view === 'app'">
    <h1>Willkommen zu FinanceMaster<span v-if="currentUser?.name">, {{ currentUser.name }}</span>!</h1>

    <section class="section-categories">
      <div v-if="loadingCategories" class="info">Lade Kategorien…</div>
      <ErrorBanner v-else-if="errorCategories" :message="errorCategories" />
      <div v-else-if="!categories.length" class="muted">Keine Kategorien vorhanden – zuerst anlegen.</div>
      <CategoryList :categories="categories" @add-category="addCategory" />
    </section>

    <section class="section-transactions">
      <div v-if="loadingTransactions" class="info">Lade Transaktionen…</div>
      <ErrorBanner v-else-if="errorTransactions" :message="errorTransactions" />
      <div v-else-if="!transactions.length" class="muted">Noch keine Transaktionen.</div>
      <TransactionList
        :categories="categories"
        :transactions="transactions"
        @add-transaction="addTransaction"
      />
    </section>
  </main>
</template>
