<script setup>
import { ref, onMounted } from 'vue'
import CategoryList from './components/CategoryList.vue'
import TransactionList from './components/TransactionList.vue'
import { apiGet, apiPost } from './api.js'

// categories will be loaded from backend (VITE_API_URL + '/categories') if available
const categories = ref([])

const transactions = ref([
  { id: 1, date: '2025-11-01', description: 'Lebensmittel', category: 'Lebensmittel', type: 'expense', amount: 34.90 },
  { id: 2, date: '2025-11-03', description: 'Gehalt', category: 'Einnahmen', type: 'income', amount: 1500.00 },
  { id: 3, date: '2025-11-04', description: 'Ticket', category: 'Transport', type: 'expense', amount: 2.80 }
])

onMounted(async () => {
  try {
    const data = await apiGet('/categories')
    // normalize data and ensure an id exists for v-for keys
    categories.value = (data || []).map((c, i) => ({ id: c.id ?? i + 1, name: c.name, description: c.description }))
    // load transactions from backend as well
    try {
      const tx = await apiGet('/transactions')
      transactions.value = (tx || []).map((t, i) => ({ id: t.id ?? i + 1, date: t.date, description: t.description, category: t.category?.name || t.category || '', type: t.type, amount: t.amount }))
    } catch (e) {
      console.warn('Failed to load transactions from API, using local defaults', e)
    }
  } catch (err) {
    // fallback to local defaults if API not reachable
    console.warn('Failed to load categories from API, using local defaults', err)
    categories.value = [
      { id: 1, name: 'Lebensmittel', description: 'Einkaufen' },
      { id: 2, name: 'Gehalt', description: 'Monatliches Gehalt' },
      { id: 3, name: 'Transport', description: '' }
    ]
  }
})

function addCategory(payload) {
  // try to persist category on backend, fallback to local
  apiPost('/categories', { name: payload.name, description: payload.description })
    .then(c => categories.value.push({ id: c.id ?? Date.now(), name: c.name, description: c.description }))
    .catch(() => categories.value.push({ id: Date.now(), name: payload.name, description: payload.description }))
}

async function addTransaction(payload) {
  // POST to backend and update local list with returned entity; fallback to local push
  try {
    const saved = await apiPost('/transactions', payload)
    transactions.value.push({ id: saved.id ?? Date.now(), date: saved.date, description: saved.description, category: saved.category?.name || saved.category || payload.category, type: saved.type, amount: saved.amount })
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
      <CategoryList :categories="categories" @add-category="addCategory" />
    </section>

    <section class="section-transactions">
      <TransactionList
        :categories="categories"
        :transactions="transactions"
        @add-transaction="addTransaction"
      />
    </section>
  </main>
</template>
