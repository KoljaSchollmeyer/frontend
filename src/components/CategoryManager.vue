<script setup lang="ts">
import { ref } from 'vue'
import { store } from '../stores/financeStore'

// --- Lokaler State ---
const name = ref('')
const desc = ref('')

// --- Aktionen ---

/**
 * Fügt eine neue Kategorie hinzu und setzt das Formular zurück.
 */
const add = () => {
  if (!name.value) return
  store.addCat({ name: name.value, description: desc.value })
  name.value = ''
  desc.value = ''
}

/**
 * Versucht, eine Kategorie zu löschen.
 * Führt zuerst eine Prüfung im Frontend durch, um unnötige Server-Calls zu vermeiden,
 * und fängt anschließend Fehler vom Backend ab.
 */
const tryDelete = async (categoryId: number) => {
  // 1. Frontend-Check: Prüfen, ob lokal Transaktionen mit dieser Kategorie existieren
  const isUsed = store.transactions.some(t => String(t.categoryId) === String(categoryId))

  if (isUsed) {
    store.error = 'Kategorie konnte nicht gelöscht werden, da sie noch dazugehörige Transaktionen hat.'
    return
  }

  // 2. Backend-Check: Löschversuch am Server
  try {
    await store.delCat(categoryId)
  } catch { 
    store.error = 'Kategorie konnte nicht gelöscht werden, da sie noch dazugehörige Transaktionen hat.'
  }
}
</script>

<template>
  <section class="card">
    <div class="card-header">
      <h3>Kategorien</h3>
    </div>

    <div class="form-container">
      <div class="inputs-row">
        <input 
          v-model="name" 
          placeholder="Neue Kategorie" 
          class="input-name" 
        />
        <input 
          v-model="desc" 
          placeholder="Beschreibung (optional)" 
          class="input-desc" 
        />
      </div>
      
      <button @click="add" class="btn-primary full-width-btn">
        Speichern
      </button>
    </div>

    <ul class="cat-list">
      <li v-for="c in store.categories" :key="c.id" class="cat-item">
        <div class="info">
          <span class="name">{{ c.name }}</span>
          <span v-if="c.description" class="desc">{{ c.description }}</span>
        </div>
        
        <button @click="tryDelete(c.id)" class="btn-danger text-sm">
          Löschen
        </button>
      </li>
      
      <li v-if="store.categories.length === 0" class="empty-state">
        Keine Kategorien gefunden.
      </li>
    </ul>
  </section>
</template>

<style scoped>
/* Basis-Layout der Karte */
.card {
  position: relative; /* Wichtig für korrekte Positionierung von Fehlermeldungen im Dark/Light Mode */
}

.card-header { 
  margin-bottom: 20px; 
}

/* Formular-Design */
.form-container {
  background: var(--bg-color);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.inputs-row { 
  display: flex; 
  gap: 10px; 
  width: 100%; 
}

.input-name { flex: 1; }
.input-desc { flex: 2; }

.full-width-btn { 
  width: 100%; 
  justify-content: center; 
  padding: 12px; 
  font-size: 1rem; 
}

/* Listen-Styling */
.cat-list { 
  list-style: none; 
  padding: 0; 
  margin: 0; 
}

.cat-item { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 16px 0; 
  border-bottom: 1px solid var(--border-color); 
}

.cat-item:last-child { 
  border-bottom: none; 
}

.name { 
  font-weight: 600; 
  color: var(--text-color); 
}

.desc { 
  margin-left: 10px; 
  color: var(--text-muted); 
  font-size: 0.9rem; 
}

.text-sm { 
  font-size: 0.85rem; 
}

.empty-state {
  text-align: center; 
  color: var(--text-muted); 
  padding: 20px;
}

/* Responsive Anpassungen */
@media (max-width: 600px) {
  .inputs-row { 
    flex-direction: column; 
  }
}
</style>