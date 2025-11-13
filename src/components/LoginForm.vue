<script setup>
import { reactive, ref } from 'vue'
import { apiGet } from '../api.js'

const props = defineProps({ externalError: { type: String, default: '' } })
const emit = defineEmits(['logged-in', 'proceed-anonymous', 'switch-to-signup'])

const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

async function login() {
  error.value = ''
  loading.value = true
  try {
    const email = form.email.trim()
    const password = form.password // currently not validated server-side
    if (!email || !password) {
      error.value = 'Bitte E-Mail und Passwort eingeben.'
      return
    }
    // Backend liefert aus Sicherheitsgründen kein Passwort zurück (WRITE_ONLY)
    // Daher identifizieren wir den Nutzer aktuell nur per E-Mail.
    const users = await apiGet('/users')
    const match = (users || []).find(u => (u.email || '').toLowerCase() === email.toLowerCase())
    if (!match) {
      error.value = 'Kein Benutzer mit dieser E-Mail gefunden.'
      return
    }
    emit('logged-in', match)
  } catch (e) {
    error.value = 'Anmeldung fehlgeschlagen.'
  } finally {
    loading.value = false
  }
}

function proceedAnonymous() {
  emit('proceed-anonymous')
}

function goSignup() {
  emit('switch-to-signup')
}
</script>

<template>
  <section>
    <h2 class="auth-title">Anmelden</h2>
    <form @submit.prevent="login" class="auth-form">
      <label>
        E-Mail
        <input v-model.trim="form.email" type="email" placeholder="E-Mail" />
      </label>
      <label>
        Passwort
        <input v-model.trim="form.password" type="password" placeholder="Passwort" />
      </label>
      <button type="submit" :disabled="loading">{{ loading ? 'Bitte warten…' : 'Anmelden' }}</button>
    </form>
  <div class="auth-actions">
      <div class="muted">
        Kein Konto? <a href="#" @click.prevent="goSignup">Jetzt registrieren</a>
      </div>
      <div>
        <a href="#" @click.prevent="proceedAnonymous">Ohne Konto fortfahren</a>
      </div>
    </div>
    <div v-if="error || props.externalError" class="error" role="alert" aria-live="polite">{{ error || props.externalError }}</div>
  </section>
</template>
