<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="toast-container" aria-live="polite">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast glass-panel"
      :class="`toast--${toast.type}`"
      role="alert"
    >
      <span>{{ toast.message }}</span>
      <button type="button" class="toast__dismiss" @click="dismiss(toast.id)">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 360px;
}
.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
  border-radius: var(--radius-md);
}
.toast--success {
  border-color: rgba(134, 239, 172, 0.35);
  color: var(--success);
}
.toast--error {
  border-color: rgba(255, 180, 171, 0.35);
  color: var(--error);
}
.toast--info {
  border-color: rgba(133, 207, 255, 0.35);
  color: var(--tertiary);
}
.toast__dismiss {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  display: flex;
  padding: 0;
}
.toast__dismiss:hover {
  opacity: 1;
}
</style>
