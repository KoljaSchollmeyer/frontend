<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { store } from '../stores/financeStore'
import { formatDate } from '../utils/formatters'
import FilterBar from './FilterBar.vue'
import type { Transaction } from '../types'

// --- State Definitionen ---

// Währungsumrechnung
const currency = ref('EUR')
const rate = ref(1)
const loadingRate = ref(false)

// Formular-Daten
const form = ref({ 
  description: '', 
  amount: undefined as number | undefined, 
  // Expliziter Typ für TypeScript
  type: 'expense' as 'income' | 'expense', 
  categoryId: 0, 
  date: new Date().toISOString().split('T')[0] 
})

// Unterstützte Währungen für das Dropdown
const currencies = [
  { code: 'EUR', flag: '🇪🇺' },
  { code: 'USD', flag: '🇺🇸' },
  { code: 'GBP', flag: '🇬🇧' },
  { code: 'CHF', flag: '🇨🇭' },
  { code: 'JPY', flag: '🇯🇵' },
  { code: 'PLN', flag: '🇵🇱' },
  { code: 'AUD', flag: '🇦🇺' },
  { code: 'CAD', flag: '🇨🇦' },
  { code: 'SEK', flag: '🇸🇪' },
  { code: 'NOK', flag: '🇳🇴' }
]

// --- Helper Funktionen ---

/**
 * Ermittelt den Namen der Kategorie für eine Transaktion.
 * Unterstützt zwei Szenarien:
 * 1. Das Backend liefert das Kategorie-Objekt direkt mit (nested object).
 * 2. Wir haben nur die ID und müssen den Namen aus dem lokalen Store suchen.
 */
const getCategoryLabel = (t: Transaction & { category?: { name: string } }) => {
  // Fall 1: Objekt ist vorhanden
  if (t.category && t.category.name) {
    return t.category.name
  }
  
  // Fall 2: Suche über ID im Store
  if (t.categoryId) {
    const cat = store.categories.find(c => String(c.id) === String(t.categoryId))
    return cat ? cat.name : null
  }
  
  return null
}

// Berechnet dynamisch den Euro-Wert für die Anzeige im Formular (Vorschau)
const calculatedEuro = computed(() => {
  if (!form.value.amount || currency.value === 'EUR') return null
  return (form.value.amount * rate.value).toFixed(2)
})

// --- API & Logik ---

/**
 * Lädt den historischen Wechselkurs für das gewählte Datum.
 * Nutzt die frankfurter.app API.
 */
const fetchRate = async () => {
  store.error = null
  
  if (currency.value === 'EUR') {
    rate.value = 1
    return
  }
  
  loadingRate.value = true
  try {
    // Falls kein Datum gewählt ist, nutzen wir 'latest', sonst das Datum aus dem Formular
    const dateParam = form.value.date || 'latest'
    const res = await fetch(`https://api.frankfurter.app/${dateParam}?from=${currency.value}&to=EUR`)
    const data = await res.json()
    
    rate.value = data.rates.EUR
    
  } catch { 
    rate.value = 0 
    store.error = 'Währungskurs konnte nicht geladen werden. Speichern ist deaktiviert.'
  } finally {
    loadingRate.value = false
  }
}

// Aktualisiert den Kurs automatisch, wenn Währung oder Datum geändert werden
watch([currency, () => form.value.date], () => fetchRate())

/**
 * Validiert das Formular und speichert die Transaktion im Store.
 * Rechnet Fremdwährungen automatisch in EUR um und ergänzt die Beschreibung.
 */
const submit = () => {
  // Validierung
  if (!form.value.amount) {
    store.error = 'Bitte einen Betrag eingeben'
    return
  }

  if (!form.value.categoryId || form.value.categoryId === 0) {
    store.error = 'Bitte eine Kategorie wählen'
    return
  }

  if (currency.value !== 'EUR' && rate.value === 0) {
    store.error = 'Kein gültiger Wechselkurs vorhanden. Bitte Internet prüfen oder Währung ändern.'
    return
  }

  // Daten aufbereiten
  const finalAmount = form.value.amount * rate.value
  let desc = form.value.description

  // Bei Fremdwährungen: Originalbetrag in Beschreibung vermerken
  if (currency.value !== 'EUR') {
    const flag = currencies.find(c => c.code === currency.value)?.flag || ''
    const originalString = `${flag} ${Number(form.value.amount).toFixed(2)} ${currency.value}`
    desc = desc ? `${desc} (${originalString})` : originalString
  } else if (!desc) {
    desc = 'Ohne Beschreibung'
  }
  
  // Speichern
  store.addTx({ 
    ...form.value,
    description: desc,
    amount: finalAmount
  })
  
  // Reset
  form.value.description = ''
  form.value.amount = undefined
  form.value.categoryId = 0
}
</script>

<template>
  <section class="card">
    <div class="card-header">
      <h3>Transaktionen</h3>
      <FilterBar v-model:filter="store.txFilter" />
    </div>

    <div class="form-container">
      <div class="inputs-row">
        <select v-model="form.type" class="input-type">
          <option value="income">Einnahme</option>
          <option value="expense">Ausgabe</option>
        </select>
        
        <input 
          v-model="form.description" 
          placeholder="Beschreibung (optional)" 
          class="input-desc" 
        />
        
        <select v-model="form.categoryId" class="input-cat">
          <option :value="0">Keine Kategorie</option>
          <option v-for="c in store.categories" :value="c.id" :key="c.id">{{ c.name }}</option>
        </select>
        
        <select v-model="currency" class="input-currency">
          <option v-for="c in currencies" :key="c.code" :value="c.code">
            {{ c.flag }} {{ c.code }}
          </option>
        </select>

        <div class="amount-wrapper">
          <input 
            type="number" 
            v-model="form.amount" 
            :placeholder="currency === 'EUR' ? '0.00' : currency" 
            step="0.01" 
            class="input-amount" 
          />
        </div>
        
        <input type="date" v-model="form.date" class="input-date" />
      </div>

      <div v-if="currency !== 'EUR' && form.amount" class="currency-hint">
        <span v-if="loadingRate">Lade Wechselkurs...</span>
        
        <span v-else-if="rate > 0">
          Wird gespeichert als: <strong>{{ calculatedEuro }} €</strong> 
          <span class="rate-info">(Kurs vom {{ formatDate(form.date) }}: {{ rate }})</span>
        </span>
        
        <span v-else style="color: var(--danger); font-weight: bold;">
          Kursfehler! Speichern nicht möglich.
        </span>
      </div>

      <button 
        @click="submit" 
        class="btn-primary full-width-btn" 
        :disabled="currency !== 'EUR' && rate === 0"
      >
        Speichern
      </button>
    </div>

    <table class="clean-table">
      <thead>
        <tr>
          <th>Datum</th>
          <th>Beschreibung</th>
          <th>Kategorie</th>
          <th style="text-align: right">Betrag</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in store.transactions" :key="t.id">
          <td style="color: var(--text-muted)">{{ formatDate(t.date) }}</td>
          
          <td style="font-weight: 500;">
            {{ t.description }}
          </td>
          
          <td>
            <span class="badge" v-if="getCategoryLabel(t)">
              {{ getCategoryLabel(t) }}
            </span>
            <span class="badge warning" v-else>Keine Kategorie</span>
          </td>
          
          <td style="text-align: right" :class="t.type.toLowerCase()">
            {{ t.type.toLowerCase() === 'expense' ? '-' : '+' }} {{ t.amount.toFixed(2) }} €
          </td>
          
          <td style="text-align: right">
            <button @click="store.delTx(t.id)" class="btn-danger text-sm">
              Löschen
            </button>
          </td>
        </tr>
        
        <tr v-if="store.transactions.length === 0">
          <td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted)">
            Keine Transaktionen gefunden.
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
/* Header Layout */
.card-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 25px; 
  flex-wrap: wrap; 
  gap: 15px; 
}

/* Formular Container */
.form-container { 
  background: var(--bg-color); 
  padding: 20px; 
  border-radius: 12px; 
  margin-bottom: 30px; 
  border: 1px solid var(--border-color); 
  display: flex; 
  flex-direction: column; 
  gap: 15px; 
}

.inputs-row { 
  display: flex; 
  gap: 10px; 
  width: 100%; 
  align-items: center; 
}

/* Eingabefelder Größensteuerung (Desktop) */
.input-type { flex: 0 0 140px; } 
.input-desc { flex: 1.8; min-width: 120px; }
.input-cat  { flex: 1; min-width: 130px; }

.input-currency { 
  flex: 0 0 110px; 
  font-size: 1rem; 
  padding-left: 8px; 
  padding-right: 25px; 
} 

.amount-wrapper { flex: 0 0 100px; } 
.input-amount { width: 100%; }
.input-date { flex: 0 0 135px; }

/* Währungs-Hinweise */
.currency-hint { 
  font-size: 0.9rem; 
  color: var(--text-muted); 
  margin-top: -5px; 
  margin-left: 5px; 
}

.rate-info { 
  font-size: 0.8rem; 
  opacity: 0.8; 
  margin-left: 8px; 
}

/* Buttons */
.full-width-btn { 
  width: 100%; 
  justify-content: center; 
  padding: 12px; 
  font-size: 1rem; 
}

.full-width-btn:disabled { 
  background-color: #ccc; 
  cursor: not-allowed; 
  transform: none; 
  box-shadow: none; 
}

/* Responsive: Formular bricht um */
@media (max-width: 900px) { 
  .inputs-row { flex-wrap: wrap; } 
  .input-type, .input-currency, .amount-wrapper { flex: 1; } 
  .input-desc, .input-cat, .input-date { flex: 100%; margin-top: 5px; } 
}

/* Tabelle Styling */
.clean-table { 
  width: 100%; 
  border-collapse: separate; 
  border-spacing: 0; 
}

.clean-table th { 
  text-align: left; 
  padding: 12px 16px; 
  border-bottom: 2px solid var(--border-color); 
  color: var(--text-muted); 
  font-size: 0.85rem; 
  font-weight: 600; 
  letter-spacing: 0.5px; 
}

.clean-table td { 
  padding: 16px; 
  border-bottom: 1px solid var(--border-color); 
  vertical-align: middle; 
}

.clean-table tr:last-child td { 
  border-bottom: none; 
}

/* Badges (Kategorien) */
.badge { 
  background: var(--bg-color); 
  padding: 6px 10px; 
  border-radius: 8px; 
  font-size: 0.85rem; 
  color: var(--text-muted); 
  border: 1px solid var(--border-color); 
  font-weight: 500; 
}

.badge.warning { 
  color: #d97706; 
  border-color: #d97706; 
  opacity: 0.8; 
}

/* Zahlenfarben */
.income { 
  color: var(--success); 
  font-family: monospace; 
  font-size: 1.1rem; 
  font-weight: 600; 
}

.expense { 
  color: var(--danger); 
  font-family: monospace; 
  font-size: 1.1rem; 
  font-weight: 600; 
}

.text-sm { 
  font-size: 0.85rem; 
}
</style>