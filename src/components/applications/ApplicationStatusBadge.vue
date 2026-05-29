<script setup lang="ts">
import type { ApplicationStatus } from '@/types'

defineProps<{ status: ApplicationStatus }>()

const colorMap: Record<ApplicationStatus, string> = {
  pending: 'var(--on-surface-variant)',
  shortlisted: 'var(--secondary)',
  accepted: '#86efac',
  rejected: '#f87171',
  withdrawn: '#6b7280',
}

const labelMap: Record<ApplicationStatus, string> = {
  pending: 'In Review',
  shortlisted: 'Shortlisted',
  accepted: 'Accepted',
  rejected: 'Not Selected',
  withdrawn: 'Withdrawn',
}
</script>

<template>
  <span class="status-badge" :style="{ color: colorMap[status], borderColor: colorMap[status] }">
    {{ labelMap[status] }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  border: 1px solid currentColor;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  background: color-mix(in srgb, currentColor 12%, transparent);
}
</style>
