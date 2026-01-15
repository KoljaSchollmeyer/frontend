<script setup lang="ts">
import { store } from '../stores/financeStore'
import Summary from '../components/FinanceSummary.vue'
import TransactionManager from '../components/TransactionManager.vue'
import CategoryManager from '../components/CategoryManager.vue'
import DarkMode from '../components/DarkMode.vue'

/**
 * Dashboard-Hauptansicht
 * Zentraler Einstiegspunkt nach dem Login. Diese Komponente strukturiert 
 * die Navigation und bindet die funktionalen Module der Anwendung ein.
 */
</script>

<template>
  <div class="page-wrapper">
    <header class="navbar">
      <div class="navbar-content">
        
        <div class="left-section">
          <div class="brand">
            <h1>FinanceMaster</h1>
          </div>
          
          <span class="user-mail" v-if="store.user">
            {{ store.user.email }}
          </span>
        </div>
        
        <div class="actions">
          <button 
            @click="store.generateExampleData()" 
            class="btn-secondary nav-btn" 
            :disabled="store.loading"
          >
            {{ store.loading ? 'Lädt...' : 'Beispieldaten' }}
          </button>

          <button class="logout-btn nav-btn" @click="store.logout()">
            Abmelden
          </button>

          <div class="darkmode-wrapper">
             <DarkMode />
           </div>
        </div>
      </div>
    </header>

    <main class="layout">
      <Summary />
      <TransactionManager />
      <CategoryManager />
    </main>
  </div>
</template>

<style scoped>
/* --- Basis-Layout --- */
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout { 
  max-width: 1200px; 
  margin: 0 auto; 
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

/* --- Navigationsleiste (Sticky) --- */
.navbar {
  width: 100%;
  padding: 16px 0;
  margin-bottom: 30px;
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s;
}

/**
 * Dark Mode Anpassung für die Navbar.
 * Wir verwenden eine deckende Hintergrundfarbe ohne Backdrop-Filter,
 * um sicherzustellen, dass globale Fix-Elemente (wie Error-Toasts) 
 * in allen Browsern korrekt positioniert bleiben.
 */
:global(body.dark-mode) .navbar {
  background: var(--bg-color);
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* --- Branding & Typografie --- */
.left-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.brand h1 { 
  font-size: 1.5rem; 
  margin: 0; 
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: var(--primary); 
}

.user-mail { 
  font-weight: 500; 
  font-size: 0.9rem; 
  color: var(--text-muted); 
  border-left: 1px solid var(--border-color);
  padding-left: 20px;
  height: 24px;
  display: flex;
  align-items: center;
}

/* --- Buttons & Dark Mode Toggle --- */
.actions { 
  display: flex; 
  align-items: center; 
  gap: 15px; 
}

.darkmode-wrapper {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.nav-btn {
  height: 40px; 
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.logout-btn {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  border: 1px solid transparent;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: var(--danger);
  color: white;
}

/* --- Responsive Anpassungen --- */
@media (max-width: 800px) {
  .user-mail { 
    display: none; 
  }
  .navbar-content { 
    padding: 0 15px; 
  }
  .actions { 
    gap: 10px; 
  }
}
</style>