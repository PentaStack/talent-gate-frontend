<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import BaseButton from '@/components/shared/BaseButton.vue'

const router = useRouter()
</script>

<template>
  <AppLayout>
    <div class="unauthorized glass-panel">
      <span class="material-symbols-outlined unauthorized__icon">gpp_bad</span>
      <h1 class="font-display">403 — Unauthorized</h1>
      <p>You do not have permission to view this page.</p>
      <BaseButton @click="router.push('/')">Go Home</BaseButton>
    </div>
  </AppLayout>
</template>

<style scoped>
.unauthorized {
  max-width: 420px;
  margin: 4rem auto;
  padding: 3rem 2rem;
  text-align: center;
}
.unauthorized__icon {
  font-size: 4rem;
  color: var(--error);
  opacity: 0.8;
  margin-bottom: 1rem;
}
.unauthorized h1 {
  font-size: 1.75rem;
  color: var(--error);
  margin: 0 0 0.5rem;
}
.unauthorized p {
  color: var(--on-surface-variant);
  margin: 0 0 1.5rem;
}
</style>
