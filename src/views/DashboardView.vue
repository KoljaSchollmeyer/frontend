<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CategoryList from '../components/CategoryList.vue'
import TransactionList from '../components/TransactionList.vue'
import Summary from '../components/Summary.vue'
import { useAuth } from '../composables/useAuth'
import { useCategories } from '../composables/useCategories'
import { useTransactions } from '../composables/useTransactions'
import { ERROR_MESSAGES } from '../constants/messages'
import type { Category, Transaction } from '../types'

const emit = defineEmits(['logout'])

const auth = useAuth()
const categories = useCategories()
const transactions = useTransactions()
const summaryKey = ref(0)
const userId = computed(() => auth.currentUser.value?.id)
const summaryFilter = ref<{ categoryId?: number; from?: string; to?: string; timeMode: 'all' | 'range' }>({ timeMode: 'all' })
const transactionsFilter = ref<{ categoryId?: number; from?: string; to?: string; timeMode: 'all' | 'range' }>({ timeMode: 'all' })
const showSeedButton = computed(() => categories.list.value.length === 0 && transactions.list.value.length === 0)

onMounted(async () => {
  if (userId.value) {
    await loadAllData()
  }
})

async function loadAllData() {
  if (!userId.value) return
  try {
    categories.list.value = []
    transactions.list.value = []
    categories.error.value = ''
    transactions.error.value = ''
    // Lade Kategorien zuerst, damit Transaktionen mit korrekter Kategoriezuordnung angezeigt werden
    await categories.loadCategories(userId.value)
    await loadTransactionsWithFilter()
    summaryKey.value++
  } catch {
    categories.error.value = 'Fehler beim Laden der Daten. Bitte versuchen Sie es später erneut.'
  }
}


async function addCategory(payload: Pick<Category, 'name' | 'description'>) {
  if (!userId.value) {
    categories.error.value = ERROR_MESSAGES.AUTH_REQUIRED
    return
  }
  try {
    await categories.createCategory(payload.name, payload.description, userId.value)
    await categories.loadCategories(userId.value)
    categories.error.value = ''
  } catch (err: unknown) {
    categories.error.value = String((err as Error)?.message || '') || ERROR_MESSAGES.CATEGORY_CREATE_FAILED
  }
}

async function addTransaction(payload: Pick<Transaction, 'type' | 'amount' | 'description' | 'date' | 'categoryId'>) {
  if (!userId.value || !payload.categoryId) {
    if (!payload.categoryId) transactions.error.value = ERROR_MESSAGES.CATEGORY_REQUIRED
    return
  }
  try {
    await transactions.createTransaction(
      payload.type,
      payload.amount,
      payload.description,
      payload.date,
      Number(payload.categoryId),
      userId.value
    )
    await loadTransactionsWithFilter()
    summaryKey.value++
  } catch (err: unknown) {
    transactions.error.value = String((err as Error)?.message || '') || ERROR_MESSAGES.TRANSACTION_CREATE_FAILED
  }
}

async function deleteCategory(categoryId: number) {
  if (!userId.value) return
  const ok = await categories.deleteCategory(categoryId)
  if (ok) {
    await categories.loadCategories(userId.value)
  }
}

async function deleteTransaction(transactionId: number) {
  if (!userId.value) return
  await transactions.deleteTransaction(transactionId)
  await loadTransactionsWithFilter()
  summaryKey.value++
}

function updateSummaryFilter(next: { categoryId?: number; from?: string; to?: string; timeMode: 'all' | 'range' }) {
  summaryFilter.value = { ...summaryFilter.value, ...next }
  transactionsFilter.value = { ...summaryFilter.value } // Sync Filter
  loadTransactionsWithFilter()
}

async function updateTransactionsFilter(next: { categoryId?: number; from?: string; to?: string; timeMode: 'all' | 'range' }) {
  transactionsFilter.value = { ...transactionsFilter.value, ...next }
  await loadTransactionsWithFilter()
}

async function loadTransactionsWithFilter() {
  if (!userId.value) return
  const filter = transactionsFilter.value
  await transactions.loadTransactions(userId.value, filter.timeMode === 'range' ? {
    from: filter.from,
    to: filter.to,
    categoryId: filter.categoryId
  } : filter.categoryId ? { categoryId: filter.categoryId } : undefined)
}

async function handleLogout() {
  categories.list.value = []
  transactions.list.value = []
  await auth.logout()
  categories.error.value = ''
  transactions.error.value = ''
  emit('logout')
}

async function addSeedData() {
  if (!userId.value) return
  
  try {
    const cat1 = await categories.createCategory('Lebensmittel', '[BEISPIEL] Einkäufe und Haushalt', userId.value)
    const cat2 = await categories.createCategory('Transport', '[BEISPIEL] Fahrtkosten und Tickets', userId.value)
    const cat3 = await categories.createCategory('Gehalt', '[BEISPIEL] Monatliches Einkommen', userId.value)
    
    await transactions.createTransaction('expense', 45.80, '[BEISPIEL] Wocheneinkauf Supermarkt', new Date().toISOString().split('T')[0], cat1.id!, userId.value)
    await transactions.createTransaction('expense', 12.50, '[BEISPIEL] Bus-Ticket Monatskarte', new Date(Date.now() - 86400000).toISOString().split('T')[0], cat2.id!, userId.value)
    await transactions.createTransaction('income', 2500.00, '[BEISPIEL] Monatsgehalt', new Date(Date.now() - 172800000).toISOString().split('T')[0], cat3.id!, userId.value)
    
    await loadAllData()
    categories.error.value = ''
  } catch {
    categories.error.value = 'Fehler beim Hinzufügen von Beispieldaten'
    // eslint-disable-next-line no-console
    console.error('Error adding seed data')
  }
}
</script>

<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="welcome-greeting">
          <h1 class="title">Willkommen, {{ auth.currentUser.value?.name }}!</h1>
          <p class="user-email">{{ auth.currentUser.value?.email }}</p>
        </div>
        <div class="user-section">
          <div class="header-actions">
            <button v-if="showSeedButton" @click="addSeedData" class="header-btn seed-btn">Beispieldaten hinzufügen</button>
            <button @click="handleLogout" class="header-btn logout-btn">Abmelden</button>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <CategoryList
          :categories="categories.list.value"
          :error="categories.error.value"
          @add-category="addCategory"
          @delete-category="deleteCategory"
        />

        <TransactionList
          :categories="categories.list.value"
          :transactions="transactions.list.value"
          :error="transactions.error.value"
          :filter="transactionsFilter"
          @add-transaction="addTransaction"
          @delete-transaction="deleteTransaction"
          @update:filter="updateTransactionsFilter"
        />
        <Summary
          :key="summaryKey"
          :categories="categories.list.value"
          :user-id="userId"
          :filter="summaryFilter"
          @update:filter="updateSummaryFilter"
        />
      </div>
    </main>

  </div>
</template>

<style scoped>
/* Dashboard layout with sticky header */
.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0d1117;
}

.dashboard-header {
  background: #161b22;
  border-bottom: 1px solid #30363d;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.welcome-greeting {
  flex: 1;
}

.title {
  margin: 0;
  color: #58a6ff;
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.2;
}

.user-email {
  margin: 0.3rem 0 0 0;
  color: #8b949e;
  font-size: 0.9rem;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.header-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.2s;
}

.seed-btn {
  background: #238636;
  color: white;
}

.seed-btn:hover {
  background: #2ea043;
}

.logout-btn {
  background: #e74c3c;
  color: white;
}

.logout-btn:hover {
  background: #c0392b;
}

.main-content {
  flex: 1;
  padding: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>