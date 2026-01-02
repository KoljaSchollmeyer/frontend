<script setup lang="ts">
import { ref, reactive } from 'vue'
import { loginUser, createUser } from '../services/httpClient'
import { isValidEmail, isValidPassword, isNotEmpty } from '../utils/validators'

const emit = defineEmits(['authenticated'])

const mode = ref<'login' | 'signup'>('login')
const loading = ref(false)
const error = ref('')

const loginForm = reactive({
  email: '',
  password: ''
})

const signupForm = reactive({
  name: '',
  email: '',
  password: ''
})

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const email = loginForm.email.trim()
    const password = loginForm.password
    if (!isNotEmpty(email) || !isNotEmpty(password)) {
      error.value = 'Bitte E-Mail und Passwort eingeben.'
      return
    }
    if (!isValidEmail(email)) {
      error.value = 'Bitte gültige E-Mail-Adresse eingeben.'
      return
    }
    const user = await loginUser({ email, password })
    emit('authenticated', user)
  } catch (e: unknown) {
    const errorMsg = (e as Error)?.message || ''
    if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Invalid')) {
      error.value = 'E-Mail oder Passwort ist falsch.'
    } else {
      error.value = 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es später erneut.'
    }
  } finally {
    loading.value = false
  }
}

async function handleSignup() {
  error.value = ''
  loading.value = true
  try {
    const { name, email, password } = { 
      name: signupForm.name.trim(), 
      email: signupForm.email.trim(), 
      password: signupForm.password.trim() 
    }
    if (!isNotEmpty(name) || !isNotEmpty(email) || !isNotEmpty(password)) {
      error.value = 'Bitte alle Felder ausfüllen.'
      return
    }
    if (!isValidEmail(email)) {
      error.value = 'Bitte gültige E-Mail-Adresse eingeben.'
      return
    }
    if (!isValidPassword(password)) {
      error.value = 'Passwort muss mindestens 6 Zeichen lang sein.'
      return
    }
    const user = await createUser({ name, email, password })
    emit('authenticated', user)
  } catch (e: unknown) {
    const errorMsg = (e as Error)?.message || ''
    if (errorMsg.includes('already exists') || errorMsg.includes('409')) {
      error.value = 'Diese E-Mail ist bereits registriert.'
    } else if (errorMsg.includes('400')) {
      error.value = 'Ungültige Eingabe. Bitte überprüfen Sie Ihre Daten.'
    } else {
      error.value = 'Registrierung fehlgeschlagen. Bitte versuchen Sie es später erneut.'
    }
  } finally {
    loading.value = false
  }
}

const switchMode = () => {
  mode.value = mode.value === 'login' ? 'signup' : 'login'
  error.value = ''
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Left: Welcome Message -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1>Willkommen bei FinanceMaster</h1>
          <p class="welcome-text">
            Verwalten Sie Ihre Finanzen professionell und behalten Sie jederzeit den Überblick über Ihre Einnahmen, Ausgaben und Budgets.
          </p>
          <p class="welcome-subtitle">
            Melden Sie sich an, um mit der Verwaltung Ihrer persönlichen Finanzen zu beginnen.
          </p>
        </div>
      </div>

      <!-- Right: Auth Form -->
      <div class="auth-section">
        <div class="auth-panel">
          <h2 class="form-title">{{ mode === 'login' ? 'Anmelden' : 'Registrieren' }}</h2>
          
          <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="auth-form">
            <label>
              E-Mail
              <input v-model.trim="loginForm.email" type="email" placeholder="E-Mail" required />
            </label>
            <label>
              Passwort
              <input v-model.trim="loginForm.password" type="password" placeholder="Passwort" required />
            </label>
            <button type="submit" :disabled="loading">
              {{ loading ? 'Bitte warten…' : 'Anmelden' }}
            </button>
          </form>

          <form v-else @submit.prevent="handleSignup" class="auth-form">
            <label>
              Name
              <input v-model.trim="signupForm.name" placeholder="Name" required />
            </label>
            <label>
              E-Mail
              <input v-model.trim="signupForm.email" type="email" placeholder="E-Mail" required />
            </label>
            <label>
              Passwort
              <input v-model.trim="signupForm.password" type="password" placeholder="Passwort" required />
            </label>
            <button type="submit" :disabled="loading">
              {{ loading ? 'Bitte warten…' : 'Registrieren' }}
            </button>
          </form>

          <div class="auth-actions">
            <button @click="switchMode" class="link-button">
              {{ mode === 'login' ? 'Noch kein Konto? Jetzt registrieren' : 'Schon registriert? Anmelden' }}
            </button>
          </div>

          <div v-if="error" class="error" role="alert">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Login page specific layout */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f1419 0%, #1a252f 100%);
  padding: 2rem;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1000px;
  width: 100%;
  align-items: center;
}

.welcome-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  text-align: left;
}

.welcome-content h1 {
  margin: 0 0 1.5rem 0;
  color: #58a6ff;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.welcome-text {
  margin: 0 0 1rem 0;
  color: #c9d1d9;
  font-size: 1.1rem;
  line-height: 1.6;
}

.welcome-subtitle {
  margin: 0;
  color: #8b949e;
  font-size: 1rem;
  line-height: 1.6;
}

.auth-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-panel {
  width: 100%;
  max-width: 380px;
  padding: 2rem;
  background: rgba(22, 27, 34, 0.8);
  border: 1px solid #2b3a47;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.form-title {
  margin: 0 0 1.5rem 0;
  color: #e8eaed;
  font-size: 1.3rem;
  text-align: center;
  font-weight: 600;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-form label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  color: #c9d1d9;
  font-size: 0.9rem;
  font-weight: 500;
}

.auth-form input {
  padding: 0.7rem;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #e8eaed;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.auth-form input:focus {
  outline: none;
  border-color: #58a6ff;
  box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
}

.auth-form button {
  padding: 0.8rem;
  background: #238636;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.auth-form button:hover:not(:disabled) {
  background: #2ea043;
}

.auth-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-actions {
  margin-top: 1.2rem;
  display: flex;
  justify-content: center;
  width: 100%;
  text-align: center;
}

.link-button {
  background: none;
  border: none;
  color: #58a6ff;
  cursor: pointer;
  padding: 0.3rem;
  font-size: 0.85rem;
  text-decoration: underline;
  transition: color 0.2s;
  display: inline-block;
  margin: 0 auto;
  text-align: center;
}

.link-button:hover:not(:disabled) {
  color: #79c0ff;
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .welcome-content h1 {
    font-size: 2rem;
  }

  .welcome-text {
    font-size: 1rem;
  }

  .auth-panel {
    max-width: 100%;
  }
}
</style>
