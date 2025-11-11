<script setup>
import { reactive, ref } from 'vue'
import { apiPost } from '../api.js'

const emit = defineEmits(['signed-up'])

const form = reactive({
  name: '',
  email: '',
  password: ''
})

const error = ref('')
const success = ref(false)

async function signup() {
  error.value = ''
  success.value = false
  const name = form.name.trim()
  const email = form.email.trim()
  const password = form.password
  if (!name || !email || !password) {
    error.value = 'Bitte alle Felder ausfüllen.'
    return
  }
  try {
    await apiPost('/users', { name, email, password })
    success.value = true
    emit('signed-up', { name, email })
    form.name = ''
    form.email = ''
    form.password = ''
  } catch (e) {
    error.value = 'Registrierung fehlgeschlagen.'
  }
}
</script>

<template>
  <section class="signup">
    <h2>Registrieren</h2>
    <form @submit.prevent="signup" class="signup-form">
      <label>
        Name
        <input v-model="form.name" placeholder="Name" />
      </label>
      <label>
        E-Mail
        <input v-model="form.email" type="email" placeholder="E-Mail" />
      </label>
      <label>
        Passwort
        <input v-model="form.password" type="password" placeholder="Passwort" />
      </label>
      <button type="submit">Konto anlegen</button>
    </form>
    <div v-if="error" class="error" role="alert">{{ error }}</div>
    <div v-if="success" class="success" role="status">Erfolgreich registriert!</div>
  </section>
</template>

<style scoped>
.signup-form { display: flex; flex-direction: column; gap: .75rem; max-width: 320px; }
.signup-form input { width: 100%; padding: .5rem; }
.error { color: #b00020; margin-top: .5rem; }
.success { color: #0a7f35; margin-top: .5rem; }
</style>
