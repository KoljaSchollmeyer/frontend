<script setup lang="ts">
import { ref } from 'vue'
import { store } from '../stores/financeStore'
import DarkMode from '../components/DarkMode.vue'

// --- State ---
// Steuert, ob das Login- oder das Registrierungs-Formular angezeigt wird
const isRegister = ref(false)

// Lokaler Formular-State
const form = ref({ 
  name: '', 
  email: '', 
  password: '' 
})

// --- Actions ---

/**
 * Verarbeitet das Absenden des Formulars.
 * Unterscheidet automatisch zwischen Login und Registrierung 
 * und leitet die Daten an den zentralen Store weiter.
 */
const submit = async () => {
  try {
    if (isRegister.value) {
      // Registrierung: Benötigt auch den Namen
      await store.register(form.value)
    } else {
      // Login: Nur Email & Passwort
      await store.login(form.value)
    }
  } catch { 
    // Setzt eine Fehlermeldung im globalen Store, die dann in der UI angezeigt wird
    store.error = 'Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Daten.'
  }
}
</script>

<template>
  <div class="login-wrapper">
    
    <div class="theme-toggle">
      <DarkMode />
    </div>

    <div class="content-container">
      
      <div class="brand-section">
        <h1 class="title">Willkommen bei FinanceMaster</h1>
        <p class="description">
          Verwalten Sie Ihre Finanzen professionell und behalten Sie jederzeit den Überblick über Ihre Einnahmen, Ausgaben und Budgets.
        </p>
        <p class="cta-text">
          Melden Sie sich an, um mit der Verwaltung Ihrer persönlichen Finanzen zu beginnen.
        </p>
      </div>

      <div class="card auth-card">
        <h2 class="auth-title">
          {{ isRegister ? 'Neues Konto' : 'Anmelden' }}
        </h2>
        
        <form @submit.prevent="submit" class="auth-form">
          
          <div v-if="isRegister" class="field">
            <label>Name</label>
            <input 
              v-model="form.name" 
              placeholder="Ihr Name" 
              required 
            />
          </div>

          <div class="field">
            <label>E-Mail</label>
            <input 
              v-model="form.email" 
              type="email" 
              placeholder="name@beispiel.de" 
              required 
            />
          </div>

          <div class="field">
            <label>Passwort</label>
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="••••••" 
              required 
              minlength="6" 
            />
          </div>
          
          <button 
            type="submit" 
            class="btn-primary full-btn" 
            :disabled="store.loading"
          >
            {{ store.loading ? 'Bitte warten...' : (isRegister ? 'Registrieren' : 'Einloggen') }}
          </button>
        </form>
        
        <div class="auth-switch">
          <button @click="isRegister = !isRegister" class="text-link">
            {{ isRegister ? 'Zurück zur Anmeldung' : 'Noch kein Konto? Registrieren' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* --- Layout: Split Screen --- */
.login-wrapper {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  padding: 20px;
  box-sizing: border-box;
  position: relative; /* Wichtig für absolute Positionierung des Toggles */
}

/* --- Theme Toggle Positionierung --- */
.theme-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.content-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  max-width: 1000px;
  width: 100%;
}

/* --- Linke Seite: Branding --- */
.brand-section { 
  flex: 1; 
  max-width: 450px; 
}

.title {
  font-size: 2.8rem;
  /* Gradient Text Effekt */
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  font-weight: 800;
}

.description { 
  font-size: 1.15rem; 
  color: var(--text-color); 
  margin-bottom: 1rem; 
  line-height: 1.6;
}

.cta-text { 
  color: var(--text-muted); 
  font-size: 1rem; 
}

/* --- Rechte Seite: Karte --- */
.auth-card { 
  flex: 1;
  max-width: 380px; 
  width: 100%; 
  /* Karte nutzt Styles aus main.css (.card), hier nur Layout-spezifisch */
}

.auth-title { 
  text-align: center;
  margin-bottom: 25px; 
  font-size: 1.5rem; 
}

/* --- Formular Styles --- */
.auth-form { 
  display: flex; 
  flex-direction: column; 
  gap: 20px;
}

.field { 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
}

.field label { 
  font-size: 0.85rem; 
  font-weight: 600;
  color: var(--text-muted); 
  margin-left: 2px; 
}

.full-btn { 
  width: 100%; 
  margin-top: 10px; 
  font-size: 1rem;
}

/* --- Umschalter (Link) --- */
.auth-switch { 
  margin-top: 20px; 
  text-align: center; 
}

.text-link { 
  background: none;
  border: none; 
  color: var(--primary); 
  font-size: 0.9rem; 
  padding: 0; 
  text-decoration: none; 
  cursor: pointer;
}

.text-link:hover { 
  text-decoration: underline;
}

/* --- Responsive Design (Mobile) --- */
@media (max-width: 850px) {
  .content-container { 
    flex-direction: column;
    text-align: center; 
    gap: 40px; 
  }
  
  .brand-section { 
    margin-bottom: 0; 
    padding: 0 10px;
  }
  
  .title { 
    font-size: 2.5rem;
  }
}
</style>