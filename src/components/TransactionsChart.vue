<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type TimeMode = 'all' | 'range'
interface FilterState {
  categoryId?: number
  from?: string
  to?: string
  timeMode: TimeMode
}

const props = defineProps<{
  transactions: Array<{ date: string; amount: number; type: 'income' | 'expense'; categoryId?: number }>
  filter?: FilterState
}>()

const monthFormatter = new Intl.DateTimeFormat('de-DE', { month: 'short' })

const currentFilter = computed<FilterState>(() => props.filter ?? { timeMode: 'all' })

const filteredTransactions = computed(() => {
  let txs = props.transactions || []
  if (currentFilter.value.categoryId) {
    txs = txs.filter(tx => Number(tx.categoryId) === Number(currentFilter.value.categoryId))
  }
  if (currentFilter.value.timeMode === 'range') {
    const from = currentFilter.value.from ? new Date(currentFilter.value.from) : null
    const to = currentFilter.value.to ? new Date(currentFilter.value.to) : null
    txs = txs.filter(tx => {
      if (!tx.date) return false
      const d = new Date(tx.date)
      if (Number.isNaN(d.getTime())) return false
      if (from && d < from) return false
      if (to) {
        // inclusive upper bound
        const toEnd = new Date(to)
        toEnd.setHours(23, 59, 59, 999)
        if (d > toEnd) return false
      }
      return true
    })
  }
  return txs
})

const monthBuckets = computed(() => {
  const keys = new Set<string>()
  filteredTransactions.value.forEach(tx => {
    if (!tx?.date) return
    const d = new Date(tx.date)
    if (Number.isNaN(d.getTime())) return
    keys.add(`${d.getFullYear()}-${d.getMonth()}`)
  })

  const buckets: Array<{ key: string; label: string }> = Array.from(keys)
    .sort((a, b) => {
      const [ay, am] = a.split('-').map(Number)
      const [by, bm] = b.split('-').map(Number)
      return ay === by ? am - bm : ay - by
    })
    .map(k => {
      const [y, m] = k.split('-').map(Number)
      const d = new Date(y, m, 1)
      return { key: k, label: monthFormatter.format(d) }
    })

  // Fallback: show last 6 months if no data yet
  if (buckets.length === 0) {
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      buckets.push({ key, label: monthFormatter.format(d) })
    }
  }

  return buckets
})

const chartData = computed(() => {
  const incomePerMonth: number[] = []
  const expensePerMonth: number[] = []

  monthBuckets.value.forEach(bucket => {
    let income = 0
    let expense = 0
    filteredTransactions.value.forEach(tx => {
      if (!tx?.date) return
      const d = new Date(tx.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (key === bucket.key) {
        const amt = Number(tx.amount) || 0
        if (tx.type === 'income') income += amt
        else expense += amt
      }
    })
    incomePerMonth.push(Number(income.toFixed(2)))
    expensePerMonth.push(Number(expense.toFixed(2)))
  })

  return {
    labels: monthBuckets.value.map(b => b.label),
    datasets: [
      {
        label: 'Einnahmen',
        data: incomePerMonth,
        backgroundColor: 'rgba(46, 204, 113, 0.7)'
      },
      {
        label: 'Ausgaben',
        data: expensePerMonth,
        backgroundColor: 'rgba(231, 76, 60, 0.7)'
      }
    ]
  }
})

const chartTitle = computed(() => {
  if (currentFilter.value.timeMode === 'range') {
    const from = currentFilter.value.from || 'Start'
    const to = currentFilter.value.to || 'Ende'
    return `Verlauf (${from} bis ${to})`
  }
  return 'Verlauf (alle Daten)'
})

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#e8eaed' }
    },
    title: {
      display: true,
      text: chartTitle.value,
      color: '#e8eaed',
      font: { size: 14 }
    },
    tooltip: {
      callbacks: {
        label: (ctx: unknown) => {
          const context = ctx as { dataset: { label: string }; formattedValue: string }
          return `${context.dataset.label}: ${context.formattedValue} €`
        }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#c9d1d9' },
      grid: { color: 'rgba(255, 255, 255, 0.08)' }
    },
    y: {
      ticks: { color: '#c9d1d9' },
      grid: { color: 'rgba(255, 255, 255, 0.08)' }
    }
  }
}))
</script>

<template>
  <section class="chart-card">
    <h3>Finanzübersicht</h3>
    <div class="chart-wrapper">
      <Bar :data="chartData" :options="options" />
    </div>
  </section>
</template>

<style scoped>
.chart-card {
  background: #161b22;
  border: 1px solid #2b3a47;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  color: #e8eaed;
}

.chart-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.chart-wrapper {
  position: relative;
  height: 280px;
}
</style>
