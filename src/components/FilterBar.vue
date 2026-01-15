<script setup lang="ts">
import { computed } from 'vue'
import { store } from '../stores/financeStore'
import type { Filter } from '../types'

// --- Props & Emits ---

// Die Komponente empfängt das aktuelle Filter-Objekt als Prop
const props = defineProps<{
  filter: Filter
}>()

// Events zum Aktualisieren des Filters an die Eltern-Komponente senden
const emit = defineEmits(['update:filter'])

// --- Logik & Helper ---

/**
 * Hilfsfunktion, um eine einzelne Eigenschaft des Filters zu aktualisieren.
 * Da Props in Vue "read-only" sind, erstellen wir eine Kopie des Objekts 
 * und senden diese an die Eltern-Komponente zurück.
 */
const update = (key: keyof Filter, value: unknown) => {
  const newFilter = { ...props.filter, [key]: value }
  emit('update:filter', newFilter)
}

// --- Computed Proxies ---
// Diese Computed Properties fungieren als Mittelsmann zwischen den UI-Inputs (v-model)
// und den Props. Sie lesen den Wert aus den Props und triggern beim Schreiben das Update-Event.

const categoryIdProxy = computed({
  get: () => props.filter.categoryId,
  set: (val) => update('categoryId', val)
})

const timeModeProxy = computed({
  get: () => props.filter.timeMode,
  set: (val) => update('timeMode', val)
})

const fromProxy = computed({
  get: () => props.filter.from,
  set: (val) => update('from', val)
})

const toProxy = computed({
  get: () => props.filter.to,
  set: (val) => update('to', val)
})
</script>

<template>
  <div class="filter-wrapper">
    <select v-model="categoryIdProxy" class="compact-input">
      <option :value="undefined">Alle Kategorien</option>
      <option v-for="c in store.categories" :key="c.id" :value="c.id">
        {{ c.name }}
      </option>
    </select>

    <select v-model="timeModeProxy" class="compact-input">
      <option value="all">Gesamter Zeitraum</option>
      <option value="range">Zeitraum wählen</option>
    </select>

    <div v-if="filter.timeMode === 'range'" class="date-range">
      <input type="date" v-model="fromProxy" class="compact-input">
      <span class="separator">–</span>
      <input type="date" v-model="toProxy" class="compact-input">
    </div>
  </div>
</template>

<style scoped>
/* Container für die Filter-Elemente */
.filter-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

/* Kompaktes Design für Inputs in der Leiste */
.compact-input {
  width: auto;
  min-width: 100px;
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 10px;
  padding-right: 35px; /* Platz für das Dropdown-Icon */
  font-size: 0.85rem;
  height: 36px;
  line-height: 1;
}

/* Container für die beiden Datumsfelder */
.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.separator {
  color: var(--text-muted);
  font-weight: bold;
}

/* Responsive Anpassung für mobile Geräte */
@media (max-width: 500px) {
  .filter-wrapper { 
    flex-wrap: wrap; 
  }
  
  .compact-input { 
    width: 100%; 
  }
}
</style>