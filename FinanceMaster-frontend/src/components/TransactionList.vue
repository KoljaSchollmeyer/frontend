<script setup>
import { reactive, ref } from 'vue'

const props = defineProps({ categories: Array, transactions: Array })
const emit = defineEmits(['add-transaction'])

const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  description: '',
  categoryId: '', // holds selected category id
  type: 'expense',
  amount: ''
})

const categoryError = ref('')

function resetForm() {
  form.date = new Date().toISOString().slice(0, 10)
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
  const amount = Number(form.amount)
  if (!categoryId) {
    categoryError.value = 'Bitte eine Kategorie wählen.'
    return
  }
  if (!description || Number.isNaN(amount)) return

  emit('add-transaction', {
    date: form.date,
    description,
    categoryId,
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
        <select v-model="form.categoryId" aria-label="Kategorie">
          <option value="">-- wählen --</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <div v-if="categoryError" class="error" role="alert" aria-live="polite">{{ categoryError }}</div>
      </label>
      <button type="submit">Hinzufügen</button>
    </form>
  </section>
</template>