<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import CategoryList from './components/CategoryList.vue'
import TransactionList from './components/TransactionList.vue'
import SignupForm from './views/SignupForm.vue'
import LoginForm from './views/LoginForm.vue'
import { getCurrentUser, setCurrentUser, clearCurrentUser } from './services/userSession'
import { apiGet, apiDelete, createCategory as apiCreateCategory, createTransaction as apiCreateTransaction, createUser as apiCreateUser } from './services/httpClient'
import type { User, Category, Transaction, CategoryPayload, TransactionPayload } from './types'

const categories = ref<Category[]>([])
const transactions = ref<Transaction[]>([])

const loadingCategories = ref(false)
const loadingTransactions = ref(false)
const errorCategories = ref('')
const errorTransactions = ref('')

const currentUser = ref<User | null>(getCurrentUser())
const view = ref<'login' | 'signup' | 'app'>(currentUser.value ? 'app' : 'login')
const authError = ref('')
const isSignedIn = computed(() => !!currentUser.value?.id)

const GUEST_EMAIL = 'dummy@test.com'
function isGuestUser(user: User | null): boolean {
  return user?.email.toLowerCase() === GUEST_EMAIL
}

// Generische Ladefunktion für verschiedene Datentypen
async function loadData(type: 'categories' | 'transactions') {
  if (type === 'categories') {
    loadingCategories.value = true
    errorCategories.value = ''
    try {
      const userId = currentUser.value?.id
      const data = userId ? await apiGet<any[]>(`/categories?userId=${encodeURIComponent(userId)}`) : []
      categories.value = data.map(c => ({ id: c.id, name: c.name, description: c.description }))
    } catch (err) {
      errorCategories.value = 'Kategorien konnten nicht geladen werden. Bitte später erneut versuchen.'
      categories.value = []
    } finally {
      loadingCategories.value = false
    }
  } else {
    loadingTransactions.value = true
    errorTransactions.value = ''
    try {
      const userId = currentUser.value?.id
      const data = userId ? await apiGet<any[]>(`/transactions?userId=${encodeURIComponent(userId)}`) : []
      transactions.value = data.map(t => ({ 
        id: t.id, 
        date: t.date, 
        description: t.description, 
        category: t.category?.name || t.category || '', 
        type: t.type, 
        amount: t.amount 
      }))
    } catch (err) {
      errorTransactions.value = 'Transaktionen konnten nicht geladen werden. Bitte später erneut versuchen.'
      transactions.value = []
    } finally {
      loadingTransactions.value = false
    }
  }
}

async function loadAllData() {
  await Promise.all([loadData('categories'), loadData('transactions')])
}

// Helper: Build URL with userId query parameter
function buildUserUrl(path: string) {
  return `${path}?userId=${encodeURIComponent(currentUser.value!.id)}`
}

// Helper: Check auth before mutation operations
function requireAuth() {
  if (!isSignedIn.value) {
    authError.value = 'Bitte zuerst registrieren oder anmelden.'
    view.value = 'login'
    return false
  }
  return true
}

onMounted(() => {
  if (isSignedIn.value) loadAllData()
})

async function addCategory(payload: CategoryPayload) {
  if (!requireAuth() || !currentUser.value) return
  try {
    await apiCreateCategory({ ...payload, userId: currentUser.value.id })
    await loadData('categories')
  } catch (_) {
    errorCategories.value = 'Kategorie konnte nicht gespeichert werden.'
  }
}

async function addTransaction(payload: TransactionPayload) {
  if (!requireAuth() || !currentUser.value) return
  try {
    await apiCreateTransaction({ ...payload, userId: currentUser.value.id })
    await loadData('transactions')
  } catch (e) {
    errorTransactions.value = 'Transaktion konnte nicht gespeichert werden.'
  }
}

// Generische Delete-Funktion
async function deleteItem(type: 'categories' | 'transactions', id: number) {
  if (!currentUser.value?.id) return
  
  const config = {
    categories: {
      endpoint: '/categories',
      errorRef: errorCategories,
      errorMsg: 'Kategorie konnte nicht gelöscht werden.'
    },
    transactions: {
      endpoint: '/transactions',
      errorRef: errorTransactions,
      errorMsg: 'Transaktion konnte nicht gelöscht werden.'
    }
  }

  const cfg = config[type]
  if (!cfg) return

  try {
    await apiDelete(buildUserUrl(`${cfg.endpoint}/${id}`))
    await loadData(type)
  } catch (_) {
    cfg.errorRef.value = cfg.errorMsg
  }
}

function signedUp(user: User) {
  currentUser.value = user
  setCurrentUser(user)
  view.value = 'app'
  loadAllData()
}

async function proceedAnonymous() {
  try {
    authError.value = ''
    const users = await apiGet<User[]>('/users')
    let guest = users.find(u => (u.email || '').toLowerCase() === GUEST_EMAIL)
    if (!guest) {
      guest = await apiCreateUser({ name: 'Gast', email: GUEST_EMAIL, password: '12345' })
    }
    signedUp(guest)
  } catch (e) {
    authError.value = 'Gast-Anmeldung fehlgeschlagen.'
  }
}

function logout() {
  clearCurrentUser()
  currentUser.value = null
  view.value = 'login'
  categories.value = []
  transactions.value = []
}

async function resetUserData() {
  if (!currentUser.value?.id) return
  await apiDelete(buildUserUrl('/transactions'))
  await apiDelete(buildUserUrl('/categories'))
  await loadAllData()
}
</script>

<template>
  <div class="auth-wrapper" v-if="view === 'login' || view === 'signup'">
    <div class="auth-card">
      <LoginForm
        v-if="view === 'login'"
        :external-error="authError"
        @logged-in="signedUp"
        @proceed-anonymous="proceedAnonymous"
        @switch-to-signup="() => { authError = ''; view = 'signup' }"
      />
      <SignupForm
        v-else
        :external-error="authError"
        @signed-up="signedUp"
        @proceed-anonymous="proceedAnonymous"
        @switch-to-login="() => { authError = ''; view = 'login' }"
      />
    </div>
  </div>

  <main class="container" v-else-if="view === 'app'">
    <h1>Willkommen zu FinanceMaster!</h1>
    <div class="muted" style="margin:.25rem 0 .75rem;">
      <span v-if="isGuestUser(currentUser)">Du bist als Gast angemeldet.</span>
      <span v-else>Angemeldet als: {{ currentUser?.name }}</span>
      · <a href="#" @click.prevent="logout">Abmelden</a>
    </div>
    <div v-if="currentUser?.id" style="margin: .5rem 0 1rem;">
      <button @click="resetUserData" style="background:#ff6b6b;color:#0b0f10">Alles löschen</button>
    </div>

    <section class="section-categories">
      <div v-if="loadingCategories" class="info">Lade Kategorien…</div>
      <div v-else-if="errorCategories" class="error" role="alert" aria-live="polite">{{ errorCategories }}</div>
      <div v-else-if="!categories.length" class="muted">Noch keine Kategorien.</div>
      <CategoryList v-else :categories="categories" @add-category="addCategory" @delete-category="(id: number) => deleteItem('categories', id)" />
    </section>

    <section class="section-transactions">
      <div v-if="loadingTransactions" class="info">Lade Transaktionen…</div>
      <div v-else-if="errorTransactions" class="error" role="alert" aria-live="polite">{{ errorTransactions }}</div>
      <div v-else-if="!transactions.length" class="muted">Noch keine Transaktionen.</div>
      <TransactionList
        v-else
        :categories="categories"
        :transactions="transactions"
        @add-transaction="addTransaction"
        @delete-transaction="(id: number) => deleteItem('transactions', id)"
      />
    </section>
  </main>
</template>
