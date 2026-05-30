<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { fetchPendingJobs, approveJob, rejectJob } from '@/api/admin'
import type { AdminPendingJob } from '@/types'

const jobs = ref<AdminPendingJob[]>([])
const selected = ref<AdminPendingJob | null>(null)
const isLoading = ref(true)
const actionInProgress = ref(false)
const rejectingId = ref<number | null>(null)
const rejectReason = ref('')

onMounted(async () => {
  jobs.value = await fetchPendingJobs()
  if (jobs.value.length) selected.value = jobs.value[0]
  isLoading.value = false
})

function select(job: AdminPendingJob) {
  selected.value = job
  rejectingId.value = null
  rejectReason.value = ''
}

function removeJob(id: number) {
  jobs.value = jobs.value.filter((j) => j.id !== id)
  selected.value = jobs.value[0] ?? null
}

async function handleApprove(job: AdminPendingJob) {
  actionInProgress.value = true
  try {
    await approveJob(job.id)
    removeJob(job.id)
  } finally {
    actionInProgress.value = false
  }
}

function startReject(id: number) {
  rejectingId.value = id
  rejectReason.value = ''
}

async function handleReject(job: AdminPendingJob) {
  actionInProgress.value = true
  try {
    await rejectJob(job.id, rejectReason.value || undefined)
    rejectingId.value = null
    removeJob(job.id)
  } finally {
    actionInProgress.value = false
  }
}

const submittedAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

const pendingCount = computed(() => jobs.value.length)
</script>

<template>
  <AppLayout>
    <div class="approvals-page">
      <header class="page-header">
        <div>
          <p class="kicker">Admin Console</p>
          <h1 class="page-title">Job Approvals</h1>
          <p class="page-subtitle">Review pending job postings before they go live.</p>
        </div>
        <span class="pending-badge" v-if="!isLoading">
          <span class="material-symbols-outlined">pending_actions</span>
          {{ pendingCount }} pending
        </span>
      </header>

      <p v-if="isLoading" class="loading-text">Loading queue…</p>

      <div v-else-if="jobs.length === 0" class="empty-state glass-panel">
        <span class="material-symbols-outlined">check_circle</span>
        <p>All clear — no pending jobs.</p>
      </div>

      <div v-else class="split-pane">
        <!-- Queue list -->
        <div class="queue-list">
          <div
            v-for="job in jobs"
            :key="job.id"
            class="queue-item glass-panel"
            :class="{ 'queue-item--active': selected?.id === job.id }"
            @click="select(job)"
          >
            <div class="queue-item__accent" v-if="selected?.id === job.id" />

            <div class="queue-item__top">
              <div class="queue-item__info">
                <p class="queue-item__title">{{ job.title }}</p>
                <p class="queue-item__company">
                  <span class="material-symbols-outlined">domain</span>
                  {{ job.employer.company_name }}
                </p>
              </div>
              <div class="queue-item__meta">
                <span class="tag tag--pending">Pending Review</span>
                <span class="queue-item__time">{{ submittedAgo(job.created_at) }}</span>
              </div>
            </div>

            <div class="queue-item__footer">
              <div class="queue-item__chips">
                <span v-if="job.work_type" class="chip">{{ job.work_type }}</span>
                <span v-if="job.category" class="chip">{{ job.category.name }}</span>
                <span v-if="job.location" class="chip chip--loc">
                  <span class="material-symbols-outlined">location_on</span>{{ job.location }}
                </span>
              </div>
              <div class="queue-item__actions" @click.stop>
                <template v-if="rejectingId === job.id">
                  <input
                    v-model="rejectReason"
                    placeholder="Rejection reason (optional)"
                    class="reason-input"
                    @keydown.enter="handleReject(job)"
                    @keydown.escape="rejectingId = null"
                  />
                  <button class="btn btn--danger" :disabled="actionInProgress" @click="handleReject(job)">
                    Confirm
                  </button>
                  <button class="btn btn--ghost" @click="rejectingId = null">Cancel</button>
                </template>
                <template v-else>
                  <button class="btn btn--ghost-danger" :disabled="actionInProgress" @click="startReject(job.id)">
                    <span class="material-symbols-outlined">block</span>
                  </button>
                  <button class="btn btn--approve" :disabled="actionInProgress" @click="handleApprove(job)">
                    Approve
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview pane -->
        <div class="preview-pane glass-panel" v-if="selected">
          <div class="preview-pane__header">
            <span class="label-caps">Listing Preview</span>
          </div>

          <div class="preview-pane__body">
            <div class="preview-pane__job-header">
              <h2 class="preview-pane__title">{{ selected.title }}</h2>
              <div class="preview-pane__meta-row">
                <span class="preview-meta-item">
                  <span class="material-symbols-outlined">domain</span>
                  {{ selected.employer.company_name }}
                </span>
                <span v-if="selected.location" class="preview-meta-item">
                  <span class="material-symbols-outlined">location_on</span>
                  {{ selected.location }}
                </span>
                <span v-if="selected.salary_range" class="preview-meta-item">
                  <span class="material-symbols-outlined">payments</span>
                  {{ selected.salary_range }}
                </span>
                <span v-if="selected.application_deadline" class="preview-meta-item">
                  <span class="material-symbols-outlined">event</span>
                  Deadline: {{ selected.application_deadline }}
                </span>
              </div>
              <div class="preview-tags" v-if="selected.technologies.length || selected.category">
                <span v-if="selected.category" class="chip chip--category">{{ selected.category.name }}</span>
                <span v-for="tech in selected.technologies" :key="tech.id" class="chip chip--tech">{{ tech.name }}</span>
              </div>
            </div>

            <section v-if="selected.description" class="preview-section">
              <h4 class="preview-section__title">About the Role</h4>
              <p class="preview-section__body">{{ selected.description }}</p>
            </section>

            <section v-if="selected.requirements" class="preview-section">
              <h4 class="preview-section__title">Requirements</h4>
              <p class="preview-section__body">{{ selected.requirements }}</p>
            </section>

            <div class="employer-card glass-panel">
              <span class="material-symbols-outlined employer-card__icon">business</span>
              <div>
                <p class="employer-card__name">{{ selected.employer.company_name }}</p>
                <p class="employer-card__email">{{ selected.employer.email }}</p>
              </div>
            </div>
          </div>

          <div class="preview-pane__footer">
            <template v-if="rejectingId === selected.id">
              <input
                v-model="rejectReason"
                placeholder="Rejection reason (optional)"
                class="reason-input reason-input--wide"
                @keydown.enter="handleReject(selected)"
                @keydown.escape="rejectingId = null"
              />
              <button class="btn btn--danger" :disabled="actionInProgress" @click="handleReject(selected)">
                Confirm Rejection
              </button>
              <button class="btn btn--ghost" @click="rejectingId = null">Cancel</button>
            </template>
            <template v-else>
              <button class="btn btn--reject" :disabled="actionInProgress" @click="startReject(selected.id)">
                Reject
              </button>
              <button class="btn btn--approve-lg" :disabled="actionInProgress" @click="handleApprove(selected)">
                <span class="btn__shimmer" />
                Approve Listing
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.approvals-page {
  display: grid;
  gap: 1.75rem;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.kicker {
  margin: 0 0 0.25rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--primary-dim);
}
.page-title {
  margin: 0 0 0.25rem;
  font-family: var(--font-display), serif;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  color: var(--on-surface);
}
.page-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: var(--on-surface-variant);
}

.pending-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 183, 125, 0.25);
  background: rgba(255, 183, 125, 0.08);
  color: var(--primary-dim);
  font-size: 0.82rem;
  font-weight: 600;
}
.pending-badge .material-symbols-outlined { font-size: 1rem; }

.loading-text {
  color: var(--on-surface-variant);
  text-align: center;
  padding: 3rem;
}

.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 183, 125, 0.15);
}

.empty-state {
  display: grid;
  place-items: center;
  gap: 0.75rem;
  padding: 4rem 2rem;
  border-radius: 1rem;
  text-align: center;
  color: var(--on-surface-variant);
}
.empty-state .material-symbols-outlined { font-size: 2.5rem; color: #86efac; }
.empty-state p { margin: 0; }

.split-pane {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: start;
}
@media (min-width: 1024px) {
  .split-pane {
    grid-template-columns: 3fr 2fr;
  }
}

/* Queue list */
.queue-list {
  display: grid;
  gap: 0.75rem;
}

.queue-item {
  border-radius: 1rem;
  padding: 1.1rem 1.25rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.queue-item:hover { border-color: rgba(255, 183, 125, 0.3); }
.queue-item--active {
  border-color: rgba(255, 183, 125, 0.4);
  box-shadow: 0 0 18px rgba(255, 183, 125, 0.12);
}

.queue-item__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary-dim);
  border-radius: 1rem 0 0 1rem;
}

.queue-item__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.queue-item__info { min-width: 0; flex: 1; }
.queue-item__title {
  margin: 0 0 0.3rem;
  font-size: 0.97rem;
  font-weight: 700;
  color: var(--primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.queue-item--active .queue-item__title { color: var(--primary); }
.queue-item:not(.queue-item--active) .queue-item__title { color: var(--on-surface); }
.queue-item__company {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--on-surface-variant);
}
.queue-item__company .material-symbols-outlined { font-size: 0.9rem; }

.queue-item__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
  flex-shrink: 0;
}
.queue-item__time {
  font-size: 0.72rem;
  color: var(--on-surface-variant);
  font-family: 'JetBrains Mono', monospace;
}

.queue-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: 0.75rem;
}

.queue-item__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.queue-item__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Tags & chips */
.tag { padding: 0.2rem 0.65rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
.tag--pending { background: rgba(201, 190, 255, 0.1); color: #c9beff; border: 1px solid rgba(201, 190, 255, 0.2); }

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  padding: 0.15rem 0.55rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 183, 125, 0.2);
  background: rgba(255, 183, 125, 0.07);
  color: var(--primary-dim);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: capitalize;
}
.chip--loc { color: var(--on-surface-variant); border-color: rgba(255,255,255,0.1); background: transparent; }
.chip--loc .material-symbols-outlined { font-size: 0.85rem; }
.chip--category { background: rgba(133, 207, 255, 0.08); border-color: rgba(133, 207, 255, 0.2); color: #85cfff; }
.chip--tech { background: rgba(201, 190, 255, 0.06); border-color: rgba(201, 190, 255, 0.18); color: #c9beff; }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.9rem;
  border-radius: 9999px;
  border: none;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn:not(:disabled):hover { opacity: 0.88; transform: translateY(-1px); }
.btn .material-symbols-outlined { font-size: 1rem; }

.btn--approve {
  background: rgba(255, 183, 125, 0.12);
  color: var(--primary-dim);
  border: 1px solid rgba(255, 183, 125, 0.3);
}
.btn--approve:not(:disabled):hover { background: rgba(255, 183, 125, 0.22); }

.btn--ghost-danger {
  background: transparent;
  color: var(--on-surface-variant);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.4rem;
}
.btn--ghost-danger:not(:disabled):hover { background: rgba(248,113,113,0.1); color: #f87171; border-color: rgba(248,113,113,0.3); }

.btn--danger {
  background: rgba(248,113,113,0.12);
  color: #f87171;
  border: 1px solid rgba(248,113,113,0.3);
}
.btn--danger:not(:disabled):hover { background: rgba(248,113,113,0.22); }

.btn--ghost {
  background: transparent;
  color: var(--on-surface-variant);
  border: 1px solid rgba(255,255,255,0.1);
}
.btn--ghost:not(:disabled):hover { background: rgba(255,255,255,0.05); }

.btn--reject {
  padding: 0.55rem 1.25rem;
  background: transparent;
  color: var(--on-surface-variant);
  border: 1px solid rgba(255,255,255,0.12);
}
.btn--reject:not(:disabled):hover { background: rgba(248,113,113,0.08); color: #f87171; border-color: rgba(248,113,113,0.25); }

.btn--approve-lg {
  position: relative;
  overflow: hidden;
  padding: 0.6rem 1.5rem;
  background: var(--primary-dim);
  color: #0A0A0B;
  font-weight: 700;
  font-size: 0.85rem;
}
.btn__shimmer {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
}
.btn--approve-lg:not(:disabled):hover .btn__shimmer { transform: translateY(0); }

.reason-input {
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.05);
  color: var(--on-surface);
  font: inherit;
  font-size: 0.78rem;
  outline: none;
  min-width: 160px;
  transition: border-color 0.2s;
}
.reason-input:focus { border-color: rgba(255, 183, 125, 0.4); }
.reason-input--wide { flex: 1; min-width: 0; }

/* Preview pane */
.preview-pane {
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
  position: sticky;
  top: 1.5rem;
}

.preview-pane__header {
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: rgba(18,18,20,0.4);
  border-radius: 1rem 1rem 0 0;
}
.label-caps {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--on-surface-variant);
}

.preview-pane__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1.25rem;
  display: grid;
  gap: 1.5rem;
}
.preview-pane__body::-webkit-scrollbar { width: 4px; }
.preview-pane__body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

.preview-pane__job-header { display: grid; gap: 0.75rem; }
.preview-pane__title {
  margin: 0;
  font-family: var(--font-display), serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--on-surface);
  line-height: 1.3;
}

.preview-pane__meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.preview-meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--on-surface-variant);
}
.preview-meta-item .material-symbols-outlined { font-size: 0.95rem; }

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.preview-section { display: grid; gap: 0.5rem; }
.preview-section__title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--on-surface);
  letter-spacing: 0.02em;
}
.preview-section__body {
  margin: 0;
  font-size: 0.88rem;
  color: var(--on-surface-variant);
  line-height: 1.7;
  white-space: pre-wrap;
}

.employer-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 0.75rem;
}
.employer-card__icon { font-size: 1.5rem; color: var(--on-surface-variant); }
.employer-card__name { margin: 0; font-size: 0.9rem; font-weight: 600; color: var(--on-surface); }
.employer-card__email { margin: 0; font-size: 0.75rem; color: var(--on-surface-variant); }

.preview-pane__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  flex-wrap: wrap;
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255,255,255,0.05);
  background: rgba(18,18,20,0.4);
  border-radius: 0 0 1rem 1rem;
}
</style>
