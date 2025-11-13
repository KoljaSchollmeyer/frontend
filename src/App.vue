<script setup>
import { ref, onMounted, computed } from 'vue'
import CategoryList from './components/CategoryList.vue'
import TransactionList from './components/TransactionList.vue'
import SignupForm from './components/SignupForm.vue'
import LoginForm from './components/LoginForm.vue'
import { getCurrentUser, setCurrentUser, clearCurrentUser } from './auth.js'
import { apiGet, apiDelete, createCategory as apiCreateCategory, createTransaction as apiCreateTransaction, createUser as apiCreateUser } from './api.js'
const categories = ref([])
const transactions = ref([])

const loadingCategories = ref(false)
const loadingTransactions = ref(false)
const errorCategories = ref('')
const errorTransactions = ref('')

const currentUser = ref(getCurrentUser())
const view = ref(currentUser.value ? 'app' : 'login')
const authError = ref('')
const isSignedIn = computed(() => !!currentUser.value?.id)

const GUEST_EMAIL = 'dummy@test.com'
function isGuestUser(user) {
  if (!user) return false
  const email = (user.email || '').toLowerCase()
  return email === GUEST_EMAIL
}

async function fetchCategories() {
  loadingCategories.value = true
  errorCategories.value = ''
  try {
    const userId = currentUser.value?.id
    const data = userId ? await apiGet(`/categories?userId=${encodeURIComponent(userId)}`) : []
    categories.value = data.map((c) => ({ id: c.id, name: c.name, description: c.description }))
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
    const userId = currentUser.value?.id
    const tx = userId ? await apiGet(`/transactions?userId=${encodeURIComponent(userId)}`) : []
    transactions.value = tx.map((t) => ({ id: t.id, date: t.date, description: t.description, category: t.category?.name || t.category || '', type: t.type, amount: t.amount }))
  } catch (err) {
    errorTransactions.value = 'Transaktionen konnten nicht geladen werden. Bitte später erneut versuchen.'
    transactions.value = []
  } finally {
    loadingTransactions.value = false
  }
}

onMounted(async () => {
  view.value = isSignedIn.value ? 'app' : 'login'
  if (view.value === 'app') {
    await Promise.all([fetchCategories(), fetchTransactions()])
  }
})

async function addCategory(payload) {
  if (!isSignedIn.value) {
    authError.value = 'Bitte zuerst registrieren oder anmelden.'
    view.value = 'login'
    return
  }
  try {
    await apiCreateCategory({ name: payload.name, description: payload.description, userId: currentUser.value.id })
    await fetchCategories()
  } catch (_) {
    errorCategories.value = 'Kategorie konnte nicht gespeichert werden.'
  }
}

async function deleteCategory(id) {
  if (!currentUser.value?.id) return
  try {
    await apiDelete(`/categories/${id}?userId=${encodeURIComponent(currentUser.value.id)}`)
    await fetchCategories()
  } catch (_) {
    errorCategories.value = 'Kategorie konnte nicht gelöscht werden.'
  }
}

async function addTransaction(payload) {
  if (!isSignedIn.value) {
    authError.value = 'Bitte zuerst registrieren oder anmelden.'
    view.value = 'login'
    return
  }
  try {
    await apiCreateTransaction({
      type: payload.type,
      amount: payload.amount,
      description: payload.description,
      date: payload.date,
      categoryId: payload.categoryId,
      userId: currentUser.value.id
    })
    await fetchTransactions()
  } catch (e) {
    errorTransactions.value = 'Transaktion konnte nicht gespeichert werden.'
  }
}

async function deleteTransaction(id) {
  if (!currentUser.value?.id) return
  try {
    await apiDelete(`/transactions/${id}?userId=${encodeURIComponent(currentUser.value.id)}`)
    await fetchTransactions()
  } catch (_) {
    errorTransactions.value = 'Transaktion konnte nicht gelöscht werden.'
  }
}

function signedUp(user) {
  currentUser.value = user
  setCurrentUser(user)
  view.value = 'app'
  fetchCategories()
  fetchTransactions()
}

async function proceedAnonymous() {
  try {
    authError.value = ''
    const users = await apiGet('/users')
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

function switchToSignup() {
  authError.value = ''
  view.value = 'signup'
}

function switchToLogin() {
  authError.value = ''
  view.value = 'login'
}

async function resetUserData() {
  if (!currentUser.value?.id) return
  await apiDelete(`/transactions?userId=${encodeURIComponent(currentUser.value.id)}`)
  await apiDelete(`/categories?userId=${encodeURIComponent(currentUser.value.id)}`)
  await fetchTransactions()
  await fetchCategories()
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
        @switch-to-signup="switchToSignup"
      />
      <SignupForm
        v-else
        :external-error="authError"
        @signed-up="signedUp"
        @proceed-anonymous="proceedAnonymous"
        @switch-to-login="switchToLogin"
      />
    </div>
  </div>

  <main class="container" v-else-if="view === 'app'">
    <h1>Willkommen zu FinanceMaster!</h1>
    <div class="muted" style="margin:.25rem 0 .75rem;">
      <span v-if="isGuestUser(currentUser)">Du bist als Gast angemeldet.</span>
      <span v-else>Angemeldet als: {{ currentUser?.email || currentUser?.name }}</span>
      · <a href="#" @click.prevent="logout">Abmelden</a>
    </div>
    <div v-if="currentUser?.id" style="margin: .5rem 0 1rem;">
      <button @click="resetUserData" style="background:#ff6b6b;color:#0b0f10">Alles löschen</button>
    </div>

    <section class="section-categories">
      <div v-if="loadingCategories" class="info">Lade Kategorien…</div>
  <div v-else-if="errorCategories" class="error" role="alert" aria-live="polite">{{ errorCategories }}</div>
      <div v-else-if="!categories.length" class="muted">Noch keine Kategorien.</div>
      <CategoryList :categories="categories" @add-category="addCategory" @delete-category="deleteCategory" />
    </section>

    <section class="section-transactions">
      <div v-if="loadingTransactions" class="info">Lade Transaktionen…</div>
  <div v-else-if="errorTransactions" class="error" role="alert" aria-live="polite">{{ errorTransactions }}</div>
      <div v-else-if="!transactions.length" class="muted">Noch keine Transaktionen.</div>
      <TransactionList
        :categories="categories"
        :transactions="transactions"
        @add-transaction="addTransaction"
        @delete-transaction="deleteTransaction"
      />
    </section>
  </main>
</template>
