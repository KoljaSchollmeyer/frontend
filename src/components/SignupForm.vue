<script setup>
import { reactive, ref } from 'vue'
import { createUser } from '../api.js'

const props = defineProps({ externalError: { type: String, default: '' } })

const emit = defineEmits(['signed-up', 'proceed-anonymous', 'switch-to-login'])

const form = reactive({
  name: '',
  email: '',
  password: ''
})

const error = ref('')

async function signup() {
  error.value = ''
  const name = form.name.trim()
  const email = form.email.trim()
  const password = form.password.trim()
  if (!name || !email || !password) {
    error.value = 'Bitte alle Felder ausfüllen.'
    return
  }
  try {
    const created = await createUser({ name, email, password })
    emit('signed-up', created)
  } catch (e) {
    error.value = 'Registrierung fehlgeschlagen.'
  }
}

function proceedAnonymous() {
  emit('proceed-anonymous')
}

function goLogin() {
  emit('switch-to-login')
}
</script>

<template>
  <section class="signup">
    <h2 class="auth-title">Registrieren</h2>
    <form @submit.prevent="signup" class="auth-form">
      <label>
        Name
        <input v-model.trim="form.name" placeholder="Name" />
      </label>
      <label>
        E-Mail
        <input v-model.trim="form.email" type="email" placeholder="E-Mail" />
      </label>
      <label>
        Passwort
        <input v-model.trim="form.password" type="password" placeholder="Passwort" />
      </label>
      <button type="submit">Konto anlegen</button>
    </form>
    <div class="auth-actions">
      <a href="#" @click.prevent="proceedAnonymous">Ohne Konto fortfahren</a>
      <div class="muted">
        Schon ein Konto? <a href="#" @click.prevent="goLogin">Jetzt anmelden</a>
      </div>
    </div>
  <div v-if="error || props.externalError" class="error" role="alert" aria-live="polite">{{ error || props.externalError }}</div>
  </section>
</template>

<style scoped>
.signup-form { display: flex; flex-direction: column; gap: .75rem; max-width: 320px; }
</style>
