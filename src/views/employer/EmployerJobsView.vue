<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { fetchEmployerJobs } from '@/api/employer'
import type { EmployerJob } from '@/api/employer'

const router = useRouter()
const jobs = ref<EmployerJob[]>([])
const isLoading = ref(true)

onMounted(async () => {
  jobs.value = await fetchEmployerJobs()
  isLoading.value = false
})

const statusStyle: Record<string, { color: string; bg: string }> = {
  active:   { color: '#86efac', bg: 'rgba(134,239,172,0.1)' },
  closed:   { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  pending:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  draft:    { color: '#6b7280', bg: 'rgba(107,114,128,0.08)' },
  rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
}
</script>

<template>
  <AppLayout>
    <div class="jobs-page">
      <h1 class="jobs-title">My Job Listings</h1>

      <div v-if="isLoading" class="jobs-loading">Loading…</div>

      <template v-else-if="jobs.length > 0">
        <div class="jobs-list">
          <div
            v-for="job in jobs"
            :key="job.id"
            class="job-row glass-panel"
          >
            <div class="job-row__info">
              <p class="job-row__title">{{ job.title }}</p>
              <p v-if="job.application_deadline" class="job-row__deadline">
                Deadline: {{ job.application_deadline }}
              </p>
            </div>

            <div class="job-row__meta">
              <span
                class="status-badge"
                :style="{ color: statusStyle[job.status]?.color ?? '#fff', background: statusStyle[job.status]?.bg ?? 'transparent' }"
              >
                {{ job.status }}
              </span>
              <span class="app-count">
                <span class="material-symbols-outlined">description</span>
                {{ job.applications_count }}
              </span>
              <button
                type="button"
                class="view-btn"
                @click="router.push(`/employer/jobs/${job.id}/applications`)"
              >
                View Applications
              </button>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="jobs-empty glass-panel">
        <span class="material-symbols-outlined">work_off</span>
        <p>No job listings yet.</p>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.jobs-page {
  display: grid;
  gap: 1.5rem;
}

.jobs-title {
  margin: 0;
  font-family: var(--font-display), serif;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  color: var(--on-surface);
}

.jobs-loading {
  color: var(--on-surface-variant);
  text-align: center;
  padding: 3rem;
}

.jobs-list {
  display: grid;
  gap: 0.75rem;
}

.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 183, 125, 0.15);
}

.job-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.5rem;
  border-radius: 1rem;
  flex-wrap: wrap;
  transition: border-color 0.2s;
}

.job-row:hover {
  border-color: rgba(255, 183, 125, 0.28);
}

.job-row__info {
  display: grid;
  gap: 0.2rem;
}

.job-row__title {
  margin: 0;
  font-weight: 600;
  font-size: 0.97rem;
  color: var(--on-surface);
}

.job-row__deadline {
  margin: 0;
  font-size: 0.78rem;
  color: var(--on-surface-variant);
}

.job-row__meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.status-badge {
  padding: 0.22rem 0.7rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  border: 1px solid currentColor;
}

.app-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: var(--on-surface-variant);
}

.app-count .material-symbols-outlined {
  font-size: 1rem;
}

.view-btn {
  padding: 0.45rem 1.1rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 183, 125, 0.25);
  background: rgba(255, 183, 125, 0.08);
  color: var(--primary-dim);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.view-btn:hover {
  background: rgba(255, 183, 125, 0.18);
  border-color: rgba(255, 183, 125, 0.4);
}

.jobs-empty {
  display: grid;
  place-items: center;
  gap: 0.65rem;
  padding: 4rem 2rem;
  border-radius: 1.25rem;
  text-align: center;
}

.jobs-empty .material-symbols-outlined {
  font-size: 2.5rem;
  color: var(--on-surface-variant);
}

.jobs-empty p {
  margin: 0;
  color: var(--on-surface-variant);
}
</style>
