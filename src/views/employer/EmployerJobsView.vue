<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { fetchEmployerJobs, deleteJob, type EmployerJob } from '@/api/employer'

const router = useRouter()
const jobs = ref<EmployerJob[]>([])
const isLoading = ref(true)
const confirmDeleteId = ref<number | null>(null)
const isDeleting = ref(false)

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

const workTypeLabel: Record<string, string> = {
  remote: 'Remote', onsite: 'On-site', hybrid: 'Hybrid',
}

async function confirmDelete(id: number) {
  isDeleting.value = true
  try {
    await deleteJob(id)
    jobs.value = jobs.value.filter((j) => j.id !== id)
  } finally {
    confirmDeleteId.value = null
    isDeleting.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="jobs-page">
      <div class="jobs-header">
        <div>
          <p class="kicker">Employer Portal</p>
          <h1 class="jobs-title">My Job Listings</h1>
        </div>
        <button
          type="button"
          class="btn-create"
          id="create-job-btn"
          @click="router.push({ name: 'employer-job-create' })"
        >
          <span class="material-symbols-outlined">add</span>
          Post New Job
        </button>
      </div>

      <div v-if="isLoading" class="jobs-loading">Loading…</div>

      <template v-else-if="jobs.length > 0">
        <div class="jobs-list">
          <div v-for="job in jobs" :key="job.id" class="job-row glass-panel">
            <div class="job-row__info">
              <p class="job-row__title">{{ job.title }}</p>
              <div class="job-row__sub">
                <span v-if="job.work_type" class="work-badge">{{ workTypeLabel[job.work_type] ?? job.work_type }}</span>
                <span v-if="job.location" class="job-row__loc">
                  <span class="material-symbols-outlined">location_on</span>{{ job.location }}
                </span>
                <span v-if="job.application_deadline" class="job-row__deadline">
                  Deadline: {{ job.application_deadline }}
                </span>
              </div>
            </div>

            <div class="job-row__meta">
              <span
                class="status-badge"
                :style="{ color: statusStyle[job.status]?.color ?? '#fff', background: statusStyle[job.status]?.bg ?? 'transparent' }"
              >{{ job.status }}</span>

              <span class="app-count">
                <span class="material-symbols-outlined">description</span>
                {{ job.applications_count }}
              </span>

              <button type="button" class="action-btn" @click="router.push(`/employer/jobs/${job.id}/applications`)">
                Applications
              </button>

              <button type="button" class="action-btn action-btn--edit" :id="`edit-job-${job.id}`" @click="router.push({ name: 'employer-job-edit', params: { jobId: job.id } })">
                <span class="material-symbols-outlined">edit</span>
              </button>

              <template v-if="confirmDeleteId === job.id">
                <span class="delete-confirm-text">Sure?</span>
                <button type="button" class="action-btn action-btn--danger" :disabled="isDeleting" @click="confirmDelete(job.id)">
                  {{ isDeleting ? '…' : 'Yes' }}
                </button>
                <button type="button" class="action-btn" @click="confirmDeleteId = null">No</button>
              </template>
              <button v-else type="button" class="action-btn action-btn--danger" :id="`delete-job-${job.id}`" @click="confirmDeleteId = job.id">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="jobs-empty glass-panel">
        <span class="material-symbols-outlined">work_off</span>
        <p>No job listings yet.</p>
        <button type="button" class="btn-create" @click="router.push({ name: 'employer-job-create' })">
          <span class="material-symbols-outlined">add</span> Post Your First Job
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.jobs-page { display: grid; gap: 1.75rem; }

.jobs-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.kicker { margin: 0 0 0.25rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--primary-dim); }

.jobs-title { margin: 0; font-family: var(--font-display), serif; font-size: clamp(1.5rem, 2.5vw, 2rem); color: var(--on-surface); }

.btn-create {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.4rem;
  border-radius: 9999px;
  border: none;
  background: var(--primary-dim);
  color: #0A0A0B;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
}
.btn-create:hover { opacity: 0.88; transform: translateY(-1px); }
.btn-create .material-symbols-outlined { font-size: 1.1rem; }

.jobs-loading { color: var(--on-surface-variant); text-align: center; padding: 3rem; }

.jobs-list { display: grid; gap: 0.75rem; }

.glass-panel { background: rgba(26,26,28,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,183,125,0.15); }

.job-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.1rem 1.5rem; border-radius: 1rem; flex-wrap: wrap; transition: border-color 0.2s; }
.job-row:hover { border-color: rgba(255,183,125,0.28); }

.job-row__info { display: grid; gap: 0.3rem; flex: 1; min-width: 0; }
.job-row__title { margin: 0; font-weight: 600; font-size: 0.97rem; color: var(--on-surface); }

.job-row__sub { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; }

.work-badge { padding: 0.15rem 0.6rem; border-radius: 9999px; border: 1px solid rgba(255,183,125,0.2); background: rgba(255,183,125,0.08); color: var(--primary-dim); font-size: 0.72rem; font-weight: 700; text-transform: capitalize; }

.job-row__loc { display: flex; align-items: center; gap: 0.2rem; font-size: 0.78rem; color: var(--on-surface-variant); }
.job-row__loc .material-symbols-outlined { font-size: 0.9rem; }
.job-row__deadline { font-size: 0.78rem; color: var(--on-surface-variant); }

.job-row__meta { display: flex; align-items: center; gap: 0.65rem; flex-shrink: 0; flex-wrap: wrap; }

.status-badge { padding: 0.22rem 0.7rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; border: 1px solid currentColor; }

.app-count { display: flex; align-items: center; gap: 0.25rem; font-size: 0.85rem; color: var(--on-surface-variant); }
.app-count .material-symbols-outlined { font-size: 1rem; }

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.9rem;
  border-radius: 9999px;
  border: 1px solid rgba(255,183,125,0.2);
  background: rgba(255,183,125,0.06);
  color: var(--primary-dim);
  font: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.action-btn:hover:not(:disabled) { background: rgba(255,183,125,0.14); border-color: rgba(255,183,125,0.4); }
.action-btn--edit { background: transparent; border-color: rgba(255,255,255,0.1); color: var(--on-surface-variant); }
.action-btn--edit:hover { border-color: rgba(255,255,255,0.25); color: var(--on-surface); background: rgba(255,255,255,0.05); }
.action-btn--edit .material-symbols-outlined { font-size: 1rem; }
.action-btn--danger { border-color: rgba(248,113,113,0.25); color: #f87171; background: rgba(248,113,113,0.06); }
.action-btn--danger:hover:not(:disabled) { background: rgba(248,113,113,0.14); border-color: rgba(248,113,113,0.4); }
.action-btn--danger .material-symbols-outlined { font-size: 1rem; }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.delete-confirm-text { font-size: 0.78rem; color: #f87171; }

.jobs-empty { display: grid; place-items: center; gap: 0.75rem; padding: 4rem 2rem; border-radius: 1.25rem; text-align: center; }
.jobs-empty .material-symbols-outlined { font-size: 2.5rem; color: var(--on-surface-variant); }
.jobs-empty p { margin: 0; color: var(--on-surface-variant); }
</style>
