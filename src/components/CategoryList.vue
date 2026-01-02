<script setup lang="ts">
import { reactive } from 'vue'
import { INFO_MESSAGES } from '../constants/messages'
import type { Category } from '../types'

defineProps<{ categories?: Category[]; error?: string }>()
const emit = defineEmits<{
  'add-category': [{ name: string; description: string }]
  'delete-category': [number]
}>()

const form = reactive({ name: '', description: '' })

const addCategory = () => {
  const name = form.name.trim()
  if (!name) return
  emit('add-category', { name, description: form.description.trim() })
  form.name = form.description = ''
}

const deleteCategory = (id: number) => emit('delete-category', id)
</script>

<template>
  <section class="section-categories">
    <h2>Meine Kategorien</h2>

    <div v-if="error" class="error-message" role="alert">{{ error }}</div>

    <div v-if="!categories || categories.length === 0" class="muted">{{ INFO_MESSAGES.NO_CATEGORIES }}</div>
    <ul v-else class="list">
      <li v-for="c in categories" :key="c.id" class="item">
        <div class="category-info">
          <div class="title">{{ c.name }}</div>
          <div class="desc">{{ c.description || ' ' }}</div>
        </div>
        <button @click="deleteCategory(c.id)" class="btn-delete">Löschen</button>
      </li>
    </ul>

    <h3 class="form-header">Kategorie hinzufügen</h3>
    <form class="tx-form" @submit.prevent="addCategory">
      <label>
        Kategoriename
        <input v-model.trim="form.name" placeholder="Neuer Kategoriename..." required maxlength="50" />
      </label>
      <label>
        Beschreibung
        <input v-model.trim="form.description" placeholder="Beschreibung (optional)..." maxlength="200" />
      </label>
      <button type="submit" :disabled="!form.name.trim()">Hinzufügen</button>
    </form>
  </section>
</template>
