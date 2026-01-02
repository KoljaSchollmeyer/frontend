<script setup lang="ts">
import { watchEffect, computed, ref } from 'vue'
import { fetchBalanceSummary } from '../services/httpClient'
import { formatCurrency } from '../utils/formatters'
import FilterBar from './FilterBar.vue'
import type { Category } from '../types'

type TimeMode = 'all' | 'range'
interface FilterState {
  categoryId?: number
  from?: string
  to?: string
  timeMode: TimeMode
}

const props = defineProps<{ categories: Category[]; filter?: FilterState }>()
const emit = defineEmits<{ 'update:filter': [FilterState] }>()

const balance = ref<{ income: number; expense: number; balance: number } | null>(null)

const currentFilter = computed<FilterState>(() => props.filter ?? { timeMode: 'all' })

watchEffect(async () => {
  try {
    const params = currentFilter.value.timeMode === 'range'
      ? { from: currentFilter.value.from, to: currentFilter.value.to }
      : {}
    balance.value = await fetchBalanceSummary({ ...params, categoryId: currentFilter.value.categoryId })
  } catch {
    // Error fetching summary
  }
})

</script>

<template>
  <section class="summary">
    <h2>Finanzübersicht</h2>

    <FilterBar
      :categories="props.categories"
      :filter="currentFilter"
      label="Übersicht gruppieren nach"
      @update:filter="(f) => emit('update:filter', f)"
    />

    <div v-if="balance" class="balance-panel">
      <div class="balance-card income">
        <div class="balance-label">Einnahmen</div>
        <div class="balance-value">{{ formatCurrency(balance.income) }}</div>
      </div>
      <div class="balance-card expense">
        <div class="balance-label">Ausgaben</div>
        <div class="balance-value">{{ formatCurrency(balance.expense) }}</div>
      </div>
      <div class="balance-card total">
        <div class="balance-label">Kontostand</div>
        <div class="balance-value" :class="{ negative: balance.balance < 0 }">
          {{ formatCurrency(balance.balance) }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Summary-specific styling (color overrides and gradients) */
.summary {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #0f1419 0%, #1a252f 100%);
  border-radius: 0.6rem;
  border: 1px solid #2b3a47;
}

.summary h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.6rem;
  color: #fff;
  font-weight: 700;
}

.balance-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.balance-card {
  padding: 1.2rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border: 1px solid;
  background: rgba(0, 0, 0, 0.2);
}

.balance-card.income {
  background: rgba(46, 204, 113, 0.12);
  border-color: #2ecc71;
}

.balance-card.expense {
  background: rgba(231, 76, 60, 0.12);
  border-color: #e74c3c;
}

.balance-card.total {
  background: rgba(52, 152, 219, 0.12);
  border-color: #3498db;
}

.balance-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #8b9aaa;
  letter-spacing: 0.5px;
}

.balance-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
}

.balance-value.negative {
  color: #ff6b6b;
}
</style>
