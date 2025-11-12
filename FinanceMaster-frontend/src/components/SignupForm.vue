<script setup>
import { reactive, ref } from 'vue'
import { createUser } from '../api.js'
import ErrorBanner from './ErrorBanner.vue'

const props = defineProps({ externalError: { type: String, default: '' } })

const emit = defineEmits(['signed-up', 'proceed-anonymous'])

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
    const created = await createUser({ name, email, password })
    success.value = true
    emit('signed-up', created)
    form.name = ''
    form.email = ''
    form.password = ''
  } catch (e) {
    error.value = 'Registrierung fehlgeschlagen.'
  }
}

function proceedAnonymous() {
  emit('proceed-anonymous')
}
</script>

<template>
  <section class="signup">
    <h2 class="auth-title">Registrieren</h2>
    <form @submit.prevent="signup" class="auth-form">
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
    <div class="auth-actions">
      <a href="#" @click.prevent="proceedAnonymous">Als Gast fortfahren</a>
    </div>
    <ErrorBanner v-if="error || props.externalError" :message="error || props.externalError" />
    <div v-if="success" class="info" role="status">Erfolgreich registriert!</div>
  </section>
</template>

<style scoped>
.signup-form { display: flex; flex-direction: column; gap: .75rem; max-width: 320px; }
</style>
