<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '../types'

type TimeMode = 'all' | 'range'
interface FilterState {
  categoryId?: number
  from?: string
  to?: string
  timeMode: TimeMode
}

const props = defineProps<{ 
  categories: Category[]
  filter?: FilterState | { value: FilterState }
  label?: string
}>()

const emit = defineEmits<{ 'update:filter': [FilterState] }>()

const currentFilter = computed<FilterState>(() => {
  const f = props.filter
  if (!f) return { timeMode: 'all' }
  // Handle both raw object and ref
  return 'value' in f ? f.value : f
})

const categoryModel = computed({
  get: () => currentFilter.value.categoryId ?? '',
  set: (val: string | number) => {
    const id = val === '' ? undefined : Number(val)
    emit('update:filter', { ...currentFilter.value, categoryId: id })
  }
})

const timeModeModel = computed({
  get: () => currentFilter.value.timeMode,
  set: (mode: TimeMode) => emit('update:filter', { ...currentFilter.value, timeMode: mode })
})

const fromModel = computed({
  get: () => currentFilter.value.from || '',
  set: (val: string) => emit('update:filter', { ...currentFilter.value, from: val || undefined })
})

const toModel = computed({
  get: () => currentFilter.value.to || '',
  set: (val: string) => emit('update:filter', { ...currentFilter.value, to: val || undefined })
})

const toggleToRange = () => {
  if (currentFilter.value.timeMode !== 'range') {
    timeModeModel.value = 'range'
  }
}
</script>

<template>
  <div class="filter-bar">
    <div class="filter-label">{{ label || 'Gruppieren nach' }}</div>
    <div class="filter-controls">
      <div class="control-group">
        <label>Kategorie</label>
        <select v-model="categoryModel">
          <option value="">Alle Kategorien</option>
          <option v-for="c in props.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <div class="time-toggle">
        <button
          :class="{ active: currentFilter.timeMode === 'all' }"
          class="toggle-btn"
          type="button"
          :aria-pressed="currentFilter.timeMode === 'all'"
          @click="timeModeModel = 'all'"
        >
          Insgesamt
        </button>
        <button
          :class="{ active: currentFilter.timeMode === 'range' }"
          @click="timeModeModel = 'range'"
          class="toggle-btn"
          :aria-pressed="currentFilter.timeMode === 'range'"
          type="button"
        >
          Datumsbereich
        </button>
      </div>

      <div v-if="currentFilter.timeMode === 'range'" class="date-inputs">
        <label>
          Von
          <input type="date" v-model="fromModel" @focus="toggleToRange" />
        </label>
        <label>
          Bis
          <input type="date" v-model="toModel" @focus="toggleToRange" />
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific button styling */
.toggle-btn {
  padding: 0.6rem 1rem;
  background: #0f1419;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #8b9aaa;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: #238636;
  border-color: #2ea043;
  color: #fff;
}

.toggle-btn:hover:not(.active) {
  border-color: #58a6ff;
  background: #161b22;
}

/* Control group styling */
.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.control-group label {
  font-size: 0.8rem;
  color: #8b9aaa;
  font-weight: 500;
}

.control-group select {
  padding: 0.6rem 0.8rem;
  background: #0f1419;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.9rem;
  cursor: pointer;
  min-width: 180px;
  transition: border-color 0.2s;
}

.control-group select:focus {
  outline: none;
  border-color: #58a6ff;
  box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.15);
}

/* Time toggle */
.time-toggle {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Date inputs */
.date-inputs {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.date-inputs label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: #8b9aaa;
  font-weight: 500;
}

.date-inputs input[type="date"] {
  padding: 0.6rem 0.8rem;
  background: #0f1419;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.9rem;
  min-width: 150px;
  color-scheme: dark;
  transition: border-color 0.2s;
}

.date-inputs input[type="date"]:focus {
  outline: none;
  border-color: #58a6ff;
  box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.15);
}

.date-inputs input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  opacity: 0.8;
}
</style>
