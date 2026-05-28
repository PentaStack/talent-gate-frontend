<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import ApplicationStatusBadge from '@/components/applications/ApplicationStatusBadge.vue'
import WithdrawConfirmModal from '@/components/applications/WithdrawConfirmModal.vue'
import { getMyCandidateApplication } from '@/api/applications'
import { useApplicationsStore } from '@/stores/applications'
import { useToast } from '@/composables/useToast'
import type { CandidateApplication } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useApplicationsStore()
const { show: showToast } = useToast()

const applicationId = Number(route.params.applicationId)
const application = ref<CandidateApplication | null>(null)
const isLoading = ref(true)
const showWithdrawModal = ref(false)

onMounted(async () => {
  try {
    const cached = store.candidateApplications.find((a) => a.id === applicationId)
    if (cached) {
      application.value = cached
      isLoading.value = false
    }
    application.value = await getMyCandidateApplication(applicationId)
  } finally {
    isLoading.value = false
  }
})

async function confirmWithdraw() {
  if (!application.value) return
  try {
    await store.withdraw(applicationId)
    application.value = { ...application.value, status: 'withdrawn' }
    showToast('Application withdrawn.', 'info')
  } catch {
    showToast('Failed to withdraw. Please try again.', 'error')
  } finally {
    showWithdrawModal.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

const canWithdraw = (status: CandidateApplication['status']) =>
  status === 'pending' || status === 'shortlisted'
</script>

<template>
  <AppLayout>
    <div class="detail-page">
      <button type="button" class="back-btn" @click="router.push('/applications')">
        <span class="material-symbols-outlined">arrow_back</span>
        My Applications
      </button>

      <div v-if="isLoading" class="detail-loading">Loading…</div>

      <template v-else-if="application">
        <div class="detail-grid">
          <!-- Job card -->
          <aside class="job-card glass-panel">
            <div class="job-card__logo">
              <img
                v-if="application.job.employer.logo_url"
                :src="application.job.employer.logo_url"
                :alt="application.job.employer.company_name"
                class="job-card__logo-img"
              />
              <span v-else>{{ application.job.employer.company_name.charAt(0) }}</span>
            </div>
            <p class="job-card__title">{{ application.job.title }}</p>
            <p class="job-card__company">{{ application.job.employer.company_name }}</p>

            <div class="job-card__divider" />

            <div class="job-card__row">
              <span class="job-card__label">Status</span>
              <ApplicationStatusBadge :status="application.status" />
            </div>
            <div class="job-card__row">
              <span class="job-card__label">Submitted</span>
              <span class="job-card__value">{{ formatDate(application.submitted_at) }}</span>
            </div>
            <div v-if="application.viewed_at" class="job-card__row">
              <span class="job-card__label">Viewed</span>
              <span class="viewed-chip">Viewed</span>
            </div>

            <button
              v-if="canWithdraw(application.status)"
              type="button"
              class="withdraw-btn"
              @click="showWithdrawModal = true"
            >
              Withdraw Application
            </button>
          </aside>

          <!-- Cover letter -->
          <div class="cover-card glass-panel">
            <p class="cover-card__label">Your Cover Letter</p>
            <pre v-if="application.cover_letter" class="cover-card__text">{{ application.cover_letter }}</pre>
            <p v-else class="cover-card__empty">No cover letter submitted.</p>
          </div>
        </div>
      </template>
    </div>

    <WithdrawConfirmModal
      :open="showWithdrawModal"
      :job-title="application?.job.title ?? ''"
      @withdrawn="confirmWithdraw"
      @close="showWithdrawModal = false"
    />
  </AppLayout>
</template>

<style scoped>
.detail-page {
  display: grid;
  gap: 1.5rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: none;
  color: var(--on-surface-variant);
  font: inherit;
  font-size: 0.88rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
  width: fit-content;
}

.back-btn:hover { color: var(--primary-dim); }
.back-btn .material-symbols-outlined { font-size: 1.1rem; }

.detail-loading {
  color: var(--on-surface-variant);
  text-align: center;
  padding: 3rem;
}

.detail-grid {
  display: grid;
  gap: 1.25rem;
  align-items: start;
}

@media (min-width: 768px) {
  .detail-grid {
    grid-template-columns: 280px 1fr;
  }
}

.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 183, 125, 0.15);
}

.job-card {
  padding: 1.5rem;
  border-radius: 1.1rem;
  display: grid;
  gap: 0.75rem;
}

.job-card__logo {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  display: grid;
  place-items: center;
  font-family: var(--font-display), serif;
  font-size: 1.4rem;
  color: var(--on-surface);
  overflow: hidden;
}

.job-card__logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.job-card__title {
  margin: 0;
  font-family: var(--font-display), serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--on-surface);
}

.job-card__company {
  margin: 0;
  font-size: 0.85rem;
  color: var(--on-surface-variant);
}

.job-card__divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.job-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.job-card__label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--on-surface-variant);
}

.job-card__value {
  font-size: 0.85rem;
  color: var(--on-surface);
}

.viewed-chip {
  padding: 0.18rem 0.55rem;
  border-radius: 9999px;
  background: rgba(255, 183, 125, 0.1);
  border: 1px solid rgba(255, 183, 125, 0.2);
  color: var(--primary-dim);
  font-size: 0.72rem;
  font-weight: 600;
}

.withdraw-btn {
  margin-top: 0.25rem;
  width: 100%;
  padding: 0.55rem 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(248, 113, 113, 0.25);
  background: rgba(248, 113, 113, 0.07);
  color: #f87171;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.withdraw-btn:hover {
  background: rgba(248, 113, 113, 0.15);
  border-color: rgba(248, 113, 113, 0.4);
}

.cover-card {
  padding: 1.75rem 2rem;
  border-radius: 1.1rem;
  display: grid;
  gap: 1rem;
  align-content: start;
}

.cover-card__label {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--on-surface-variant);
}

.cover-card__text {
  margin: 0;
  font: inherit;
  font-size: 0.95rem;
  line-height: 1.8;
  color: var(--on-surface);
  white-space: pre-wrap;
  word-break: break-word;
}

.cover-card__empty {
  margin: 0;
  font-size: 0.9rem;
  color: var(--on-surface-variant);
  font-style: italic;
}
</style>
