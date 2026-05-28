<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ApplicationStatus } from '@/types'

const props = defineProps<{ currentStatus: ApplicationStatus }>()
const emit = defineEmits<{ update: [status: ApplicationStatus] }>()

const inFlight = ref(false)

type Action = { label: string; status: ApplicationStatus; danger?: boolean }

const actions = computed<Action[]>(() => {
  switch (props.currentStatus) {
    case 'pending':
      return [
        { label: 'Shortlist', status: 'shortlisted' },
        { label: 'Accept', status: 'accepted' },
        { label: 'Reject', status: 'rejected', danger: true },
      ]
    case 'shortlisted':
      return [
        { label: 'Accept', status: 'accepted' },
        { label: 'Reject', status: 'rejected', danger: true },
      ]
    default:
      return []
  }
})

function trigger(status: ApplicationStatus) {
  if (inFlight.value) return
  inFlight.value = true
  emit('update', status)
}

function done() {
  inFlight.value = false
}

defineExpose({ done })
</script>

<template>
  <div v-if="actions.length" class="status-actions">
    <button
      v-for="action in actions"
      :key="action.status"
      type="button"
      class="action-btn"
      :class="{ 'action-btn--danger': action.danger, 'action-btn--accent': !action.danger }"
      :disabled="inFlight"
      @click="trigger(action.status)"
    >
      <span v-if="inFlight" class="spinner" />
      <span v-else>{{ action.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.status-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.45rem 1.1rem;
  border-radius: 9999px;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, opacity 0.2s;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 4.5rem;
  justify-content: center;
}

.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.action-btn--accent {
  background: rgba(255, 183, 125, 0.1);
  border: 1px solid rgba(255, 183, 125, 0.25);
  color: var(--primary-dim);
}

.action-btn--accent:not(:disabled):hover {
  background: rgba(255, 183, 125, 0.2);
  border-color: rgba(255, 183, 125, 0.45);
}

.action-btn--danger {
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.25);
  color: #f87171;
}

.action-btn--danger:not(:disabled):hover {
  background: rgba(248, 113, 113, 0.18);
  border-color: rgba(248, 113, 113, 0.45);
}

.spinner {
  display: inline-block;
  width: 0.8rem;
  height: 0.8rem;
  border: 2px solid rgba(255, 183, 125, 0.3);
  border-top-color: var(--primary-dim);
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
