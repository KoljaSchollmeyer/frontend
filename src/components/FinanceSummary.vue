<script setup lang="ts">
import { store } from '../stores/financeStore'
import FilterBar from './FilterBar.vue'

// Diese Komponente dient als Dashboard-Kopfzeile.
// Sie zeigt die finanzielle Zusammenfassung (Einnahmen, Ausgaben, Bilanz)
// basierend auf den aktuellen Filtereinstellungen im Store an.
</script>

<template>
  <section class="card summary-card">
    <div class="header">
      <h3>Übersicht</h3>
      <FilterBar v-model:filter="store.summaryFilter" />
    </div>

    <div class="stats-row">
      
      <div class="stat-item">
        <span class="label">Einnahmen</span>
        <span class="value income">+{{ store.balance.totalIncome.toFixed(2) }} €</span>
      </div>
      
      <div class="divider"></div>

      <div class="stat-item">
        <span class="label">Ausgaben</span>
        <span class="value expense">-{{ store.balance.totalExpense.toFixed(2) }} €</span>
      </div>

      <div class="divider"></div>

      <div class="stat-item">
        <span class="label">Bilanz</span>
        <span class="value total">{{ store.balance.balance.toFixed(2) }} €</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Header-Layout: Flexbox sorgt dafür, dass Titel und Filter nebeneinander stehen */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 25px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 15px;
}

/* Container für die drei Kennzahlen */
.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

/* Einzelne Statistik-Box */
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

/* Typografie für Labels und Werte */
.label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  font-weight: 600;
}

.value { 
  font-size: 1.8rem; 
  font-weight: 700; 
}

/* Farbcodierung der Werte */
.income { color: var(--success); }
.expense { color: var(--danger); }
.total { color: var(--text-color); }

/* Visueller Trennstrich zwischen den Werten */
.divider {
  width: 1px;
  height: 50px;
  background: var(--border-color);
}

/* Responsive Anpassung für kleine Bildschirme */
@media (max-width: 600px) {
  .stats-row { 
    flex-direction: column; /* Stapelt die Werte untereinander */
    gap: 20px; 
  }
  
  .divider { 
    width: 100%; /* Trenner wird horizontal */
    height: 1px; 
  }
}
</style>