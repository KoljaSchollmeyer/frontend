<script setup>
import { reactive } from 'vue'

const props = defineProps({ categories: Array, transactions: Array })
const emit = defineEmits(['add-transaction'])

const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  description: '',
  category: '',
  type: 'expense',
  amount: ''
})

function resetForm() {
  form.date = new Date().toISOString().slice(0, 10)
  form.description = ''
  form.category = ''
  form.type = 'expense'
  form.amount = ''
}

function addTransaction() {
  const description = form.description.trim()
  const category = form.category
  const amount = Number(form.amount)
  if (!description || !category || Number.isNaN(amount)) return

  emit('add-transaction', {
    date: form.date,
    description,
    category,
    type: form.type,
    amount
  })

  resetForm()
}
</script>

<template>
  <section>
    <h2>Meine Transaktionen</h2>

    <ul class="list">
      <li v-for="t in transactions" :key="t.id" class="item">
        <div class="tx-left">
          <div class="tx-desc"><strong>{{ t.description }}</strong></div>
          <div class="tx-date">{{ t.date }}</div>
          <div class="tx-category">{{ t.category }}</div>
        </div>
        <div class="tx-amount">{{ t.type === 'income' ? '+' : '-' }}{{ Number(t.amount).toFixed(2) }} €</div>
      </li>
    </ul>

    <form class="tx-form" @submit.prevent="addTransaction">
      <label>
        Betrag
        <input
            type="number"
            step="0.01"
            inputmode="decimal"
            v-model="form.amount"
            placeholder="Betrag"
            aria-label="Betrag"
        />
      </label>
      <label>
        Typ
        <select v-model="form.type" aria-label="Typ">
          <option value="expense">Ausgabe</option>
          <option value="income">Einnahme</option>
        </select>
      </label>
      <label>
        Datum
        <input type="date" v-model="form.date" aria-label="Datum" />
      </label>
      <label>
        Beschreibung
        <input v-model="form.description" placeholder="Beschreibung" aria-label="Beschreibung" />
      </label>
      <label>
        Kategorie
        <select v-model="form.category" aria-label="Kategorie">
          <option value="">-- wählen --</option>
          <option v-for="c in categories" :key="c.id" :value="c.name">{{ c.name }}</option>
        </select>
      </label>
      <button type="submit">Hinzufügen</button>
    </form>
  </section>
</template>