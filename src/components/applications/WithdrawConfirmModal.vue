<script setup lang="ts">
import BaseModal from '@/components/shared/BaseModal.vue'

defineProps<{ open: boolean; jobTitle: string }>()
const emit = defineEmits<{ withdrawn: []; close: [] }>()
</script>

<template>
  <BaseModal :open="open" title="Withdraw Application" @close="emit('close')">
    <p class="confirm-text">
      Are you sure you want to withdraw your application for
      <strong>{{ jobTitle }}</strong>?
    </p>

    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancel</button>
      <button type="button" class="btn btn--danger" @click="emit('withdrawn')">Withdraw</button>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm-text {
  margin: 0;
  color: var(--on-surface);
  line-height: 1.6;
}

.btn {
  padding: 0.55rem 1.2rem;
  border-radius: 9999px;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.btn--ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--on-surface-variant);
}

.btn--danger {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #f87171;
}

.btn--danger:hover {
  background: rgba(248, 113, 113, 0.2);
  border-color: rgba(248, 113, 113, 0.5);
}
</style>
