<script setup lang="ts">
defineProps<{ title: string; open: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="emit('close')">
      <div class="modal glass-panel" role="dialog" aria-modal="true" :aria-label="title">
        <header class="modal__header">
          <h2 class="modal__title font-display">{{ title }}</h2>
          <button type="button" class="modal__close" aria-label="Close" @click="emit('close')">
            <span class="material-symbols-outlined">close</span>
          </button>
        </header>
        <div class="modal__body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="modal__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 11, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: auto;
  border-radius: var(--radius-xl);
}
.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}
.modal__title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--on-surface);
}
.modal__close {
  background: none;
  border: none;
  color: var(--on-surface-variant);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  transition: color 0.2s, background 0.2s;
}
.modal__close:hover {
  color: var(--primary);
  background: rgba(255, 183, 125, 0.1);
}
.modal__body {
  padding: 1.5rem;
  color: var(--on-surface);
  font-size: 0.95rem;
  line-height: 1.6;
}
.modal__footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-subtle);
}
</style>
