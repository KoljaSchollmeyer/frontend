<script setup lang="ts">
import { reactive, ref } from 'vue'
import { formatDateForInput, parseAmount, formatDate, formatCurrency } from '../utils/formatters'
import { ERROR_MESSAGES, INFO_MESSAGES } from '../constants/messages'
import FilterBar from './FilterBar.vue'
import type { Category, Transaction } from '../types'

interface FilterState {
  categoryId?: number
  from?: string
  to?: string
  timeMode: 'all' | 'range'
}

defineProps<{ categories: Category[]; transactions?: Transaction[]; filter?: FilterState }>()
const emit = defineEmits<{
  'add-transaction': [Pick<Transaction, 'type' | 'amount' | 'description' | 'date' | 'categoryId'>]
  'delete-transaction': [number]
  'update:filter': [FilterState]
}>()

const form = reactive({
  date: formatDateForInput(),
  description: '',
  categoryId: '',
  type: 'expense' as const,
  amount: ''
})

const categoryError = ref('')

function resetForm() {
  form.date = formatDateForInput()
  form.description = ''
  form.categoryId = ''
  form.type = 'expense'
  form.amount = ''
  categoryError.value = ''
}

function addTransaction() {
  categoryError.value = ''
  const description = form.description.trim()
  const categoryId = form.categoryId
  const amount = parseAmount(form.amount)
  if (!categoryId) {
    categoryError.value = ERROR_MESSAGES.CATEGORY_REQUIRED
    return
  }
  if (Number.isNaN(amount)) return

  emit('add-transaction', {
    date: form.date,
    description,
    categoryId: Number(categoryId),
    type: form.type as 'income' | 'expense',
    amount
  })

  resetForm()
}

function deleteTransaction(id: number) {
  emit('delete-transaction', id)
}
</script>

<template>
  <section>
    <h2>Meine Transaktionen</h2>
    
    <FilterBar
      :categories="categories"
      :filter="filter"
      label="Transaktionen gruppieren nach"
      @update:filter="emit('update:filter', $event)"
    />

    <div v-if="!transactions || transactions.length === 0" class="muted">{{ INFO_MESSAGES.NO_TRANSACTIONS }}</div>
    <ul v-else class="list">
      <li v-for="t in transactions" :key="t.id" class="item">
        <div class="tx-left">
          <div class="tx-desc"><strong>{{ t.description || 'Keine Beschreibung' }}</strong></div>
          <div class="tx-category">{{ t.category.name }}</div>
          <div class="tx-date">{{ formatDate(t.date) }}</div>
        </div>
        <div class="tx-amount">{{ t.type === 'income' ? '+' : '-' }}{{ formatCurrency(t.amount).replace('€', '').trim() }} €</div>
        <button @click="deleteTransaction(t.id)" class="btn-delete">Löschen</button>
      </li>
    </ul>

    <h3 class="form-header">Transaktion hinzufügen</h3>
    <form class="tx-form" @submit.prevent="addTransaction">
      <label>
        Betrag
        <input type="number" step="0.01" v-model="form.amount" placeholder="Betrag" required />
      </label>
      <label>
        Typ
        <select v-model="form.type">
          <option value="expense">Ausgabe</option>
          <option value="income">Einnahme</option>
        </select>
      </label>
      <label>
        Datum
        <input type="date" v-model="form.date" required />
      </label>
      <label>
        Beschreibung
        <input v-model.trim="form.description" placeholder="Beschreibung" />
      </label>
      <label>
        Kategorie
        <select v-model="form.categoryId" required>
          <option value="">-- wählen --</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <div v-if="categoryError" class="error" role="alert">{{ categoryError }}</div>
      </label>
      <button type="submit">Hinzufügen</button>
    </form>
  </section>
</template>

<style scoped>
/* Date input specific styling */
input[type="date"] {
  color-scheme: dark;
  background: #0f1419;
  border: 1px solid #2b3a47;
  color: #e0e0e0;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  opacity: 0.9;
}

input[type="date"]:focus {
  outline: none;
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
}
</style>