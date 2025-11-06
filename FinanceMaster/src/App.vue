<script setup>
import { ref } from 'vue'
import CategoryList from './components/CategoryList.vue'
import TransactionList from './components/TransactionList.vue'

const categories = ref([
  { id: 1, name: 'Lebensmittel', description: 'Einkaufen' },
  { id: 2, name: 'Gehalt', description: 'Monatliches Gehalt' },
  { id: 3, name: 'Transport', description: '' }
])

const transactions = ref([
  { id: 1, date: '2025-11-01', description: 'Lebensmittel', category: 'Lebensmittel', type: 'expense', amount: 34.90 },
  { id: 2, date: '2025-11-03', description: 'Gehalt', category: 'Einnahmen', type: 'income', amount: 1500.00 },
  { id: 3, date: '2025-11-04', description: 'Ticket', category: 'Transport', type: 'expense', amount: 2.80 }
])

function addCategory(payload) {
  categories.value.push({ id: Date.now(), name: payload.name, description: payload.description })
}

function addTransaction(payload) {
  transactions.value.push({
    id: Date.now(),
    date: payload.date,
    description: payload.description,
    category: payload.category,
    type: payload.type,
    amount: parseFloat(payload.amount)
  })
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
