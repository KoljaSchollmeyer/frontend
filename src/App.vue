<script setup lang="ts">
import { onMounted } from 'vue'
import { store } from './stores/financeStore'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'

/**
 * Initialisiert die App beim Laden und prüft auf eine bestehende Session.
 */
onMounted(() => store.init())
</script>

<template>
  <main>
    <Teleport to="body">
      <div v-if="store.error" class="error-toast">
        <div class="error-content">
          <span class="error-text">{{ store.error }}</span>
          <button class="close-btn" @click="store.error = null" aria-label="Schließen">
            ×
          </button>
        </div>
      </div>
    </Teleport>
    
    <div v-if="!store.user">
      <LoginView />
    </div>
    <div v-else>
      <DashboardView />
    </div>
  </main>
</template>

<style>
/* Globales Styling für den Error-Toast.
  Nutzt position: fixed, um immer im Sichtfeld des Nutzers zu bleiben.
*/
.error-toast {
  position: fixed;
  top: 30px; 
  left: 0;
  right: 0;
  display: flex;
  justify-content: center; /* Zentriert die Fehlermeldung horizontal */
  z-index: 10000;
  pointer-events: none; /* Verhindert, dass der Container Klicks blockiert */
}

.error-content {
  pointer-events: auto; /* Aktiviert Klicks für die Box selbst */
  background-color: #dc2626;
  color: white;
  padding: 14px 24px;
  border-radius: 50px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  
  /* Zentralisierung: Begrenzt die Breite, damit es nicht zu lang wird */
  max-width: 600px; 
  width: auto;
  min-width: 300px;
  
  /* Animation beim Erscheinen */
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.error-text {
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.4;
  text-align: center; /* Text innerhalb der Box zentrieren */
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.8;
  transition: opacity 0.2s;
  padding: 0;
}

.close-btn:hover {
  opacity: 1;
}

/* Animation: Fährt sanft von oben ein */
@keyframes slideDown {
  0% { 
    transform: translateY(-50px);
    opacity: 0; 
  }
  100% { 
    transform: translateY(0); 
    opacity: 1; 
  }
}
</style>