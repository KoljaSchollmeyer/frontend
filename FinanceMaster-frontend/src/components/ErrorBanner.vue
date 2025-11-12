<script setup>
const props = defineProps({ message: { type: String, required: true } })
</script>

<template>
  <div class="error" role="alert" aria-live="polite">{{ props.message }}</div>
</template>

<style scoped>
.error { color: #ff6b6b; background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.25); padding: 0.5rem 0.75rem; border-radius: 8px; }
</style>
