<script setup>
import { ref, onMounted } from 'vue'
import CategoryList from './components/CategoryList.vue'
import TransactionList from './components/TransactionList.vue'
import { apiGet, apiPost } from './api.js'

// Load data only from backend; no example data in FE
const categories = ref([])
const transactions = ref([])

// loading and error state
const loadingCategories = ref(false)
const loadingTransactions = ref(false)
const errorCategories = ref('')
const errorTransactions = ref('')

async function fetchCategories() {
  loadingCategories.value = true
  errorCategories.value = ''
  try {
    const data = await apiGet('/categories')
    categories.value = (data || []).map((c, i) => ({ id: c.id ?? i + 1, name: c.name, description: c.description }))
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
    const tx = await apiGet('/transactions')
    transactions.value = (tx || []).map((t, i) => ({ id: t.id ?? i + 1, date: t.date, description: t.description, category: t.category?.name || t.category || '', type: t.type, amount: t.amount }))
  } catch (err) {
    errorTransactions.value = 'Transaktionen konnten nicht geladen werden. Bitte später erneut versuchen.'
    transactions.value = []
  } finally {
    loadingTransactions.value = false
  }
}

onMounted(async () => {
  await fetchCategories()
  await fetchTransactions()
})

function addCategory(payload) {
  // try to persist category on backend, fallback to local
  apiPost('/categories', { name: payload.name, description: payload.description })
    .then(async () => {
      // re-fetch to ensure state matches server (ids, normalization)
      await fetchCategories()
    })
    .catch(() => {
      // optional fallback: keep local add if server not reachable
      categories.value.push({ id: Date.now(), name: payload.name, description: payload.description })
    })
}

async function addTransaction(payload) {
  // POST to backend and update local list with returned entity; fallback to local push
  try {
    // Ensure backend receives a Category object (not just a string)
    const body = {
      type: payload.type,
      amount: parseFloat(payload.amount),
      description: payload.description,
      date: payload.date,
      category: typeof payload.category === 'string' && payload.category
        ? { name: payload.category }
        : payload.category
    }
    await apiPost('/transactions', body)
    // re-fetch to ensure state matches server (ids, normalization)
    await fetchTransactions()
  } catch (e) {
    console.warn('Failed to save transaction to API, using local only', e)
    transactions.value.push({ id: Date.now(), date: payload.date, description: payload.description, category: payload.category, type: payload.type, amount: parseFloat(payload.amount) })
  }
}
</script>

<template>
  <main class="container">
    <h1>Willkommen zu FinanceMaster!</h1>

    <section class="section-categories">
      <div v-if="loadingCategories" class="info">Lade Kategorien…</div>
      <div v-else-if="errorCategories" class="error" role="alert" aria-live="polite">{{ errorCategories }}</div>
      <div v-else-if="!categories.length" class="muted">Keine Kategorien vorhanden – zuerst anlegen.</div>
      <CategoryList :categories="categories" @add-category="addCategory" />
    </section>

    <section class="section-transactions">
      <div v-if="loadingTransactions" class="info">Lade Transaktionen…</div>
      <div v-else-if="errorTransactions" class="error" role="alert" aria-live="polite">{{ errorTransactions }}</div>
      <div v-else-if="!transactions.length" class="muted">Noch keine Transaktionen.</div>
      <TransactionList
        :categories="categories"
        :transactions="transactions"
        @add-transaction="addTransaction"
      />
    </section>
  </main>
</template>
