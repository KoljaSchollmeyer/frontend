<script setup lang="ts">
import { onMounted } from 'vue'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import { useAuth } from './composables/useAuth'
import { setCurrentUser } from './services/userSession'
import type { User } from './types'

const auth = useAuth()

onMounted(async () => {
  try {
    await auth.restoreSession()
  } catch {
    // No session found - user will see login form
  }
})

function handleAuthenticated(user: User) {
  auth.currentUser.value = user
  setCurrentUser(user)
}

function handleLogout() {
  auth.currentUser.value = null
}
</script>

<template>
  <div class="app-container">
    <LoginView 
      v-if="!auth.currentUser.value" 
      @authenticated="handleAuthenticated" 
    />
    <DashboardView 
      v-else 
      @logout="handleLogout" 
    />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a252f 100%);
}
</style>
