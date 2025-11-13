<script setup>
import { ref } from 'vue'
defineProps({ categories: Array })
const emit = defineEmits(['add-category'])

const newName = ref('')
const newDescription = ref('')

function addCategory() {
  const name = newName.value.trim()
  const description = newDescription.value.trim()
  if (!name) return
  emit('add-category', { name, description })
  newName.value = ''
  newDescription.value = ''
}
</script>

<template>
  <section class="section-categories">
    <h2>Meine Kategorien</h2>

    <ul class="list">
      <li v-for="c in categories" :key="c.id" class="item">
        <div class="title">{{ c.name }}</div>
        <div class="desc">{{ c.description || ' ' }}</div>
      </li>
    </ul>

    <form class="row" @submit.prevent="addCategory">
      <input v-model="newName" placeholder="Neuer Kategoriename..." />
      <input v-model="newDescription" placeholder="Beschreibung (optional)..." />
      <button type="submit">Hinzufügen</button>
    </form>
  </section>
</template>