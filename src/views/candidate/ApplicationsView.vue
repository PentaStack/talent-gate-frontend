<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import ApplicationStatusBadge from '@/components/applications/ApplicationStatusBadge.vue'
import WithdrawConfirmModal from '@/components/applications/WithdrawConfirmModal.vue'
import { useApplicationsStore } from '@/stores/applications'
import { useToast } from '@/composables/useToast'
import type { CandidateApplication } from '@/types'

const router = useRouter()
const store = useApplicationsStore()
const { show: showToast } = useToast()

const withdrawTarget = ref<CandidateApplication | null>(null)

onMounted(() => store.fetchMyApplications(1))

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function canWithdraw(status: CandidateApplication['status']) {
  return status === 'pending' || status === 'shortlisted'
}

async function confirmWithdraw() {
  if (!withdrawTarget.value) return
  try {
    await store.withdraw(withdrawTarget.value.id)
    showToast('Application withdrawn.', 'info')
  } catch {
    showToast('Failed to withdraw. Please try again.', 'error')
  } finally {
    withdrawTarget.value = null
  }
}

function loadMore() {
  store.fetchMyApplications(store.currentPage + 1)
}
</script>

<template>
  <AppLayout>
    <div class="apps-page">
      <div class="apps-header">
        <h1 class="apps-title">My Applications</h1>
      </div>

      <div v-if="store.isLoading && store.candidateApplications.length === 0" class="apps-loading">
        Loading…
      </div>

      <template v-else-if="store.candidateApplications.length > 0">
        <div class="apps-list">
          <div
            v-for="app in store.candidateApplications"
            :key="app.id"
            class="app-row glass-panel"
            role="button"
            tabindex="0"
            @click="router.push(`/applications/${app.id}`)"
            @keydown.enter="router.push(`/applications/${app.id}`)"
          >
            <div class="app-row__logo">
              <img
                v-if="app.job.employer.logo_url"
                :src="app.job.employer.logo_url"
                :alt="app.job.employer.company_name"
                class="app-row__logo-img"
              />
              <span v-else>{{ app.job.employer.company_name.charAt(0) }}</span>
            </div>

            <div class="app-row__body">
              <div class="app-row__top">
                <div>
                  <p class="app-row__title">{{ app.job.title }}</p>
                  <p class="app-row__company">{{ app.job.employer.company_name }}</p>
                </div>
                <div class="app-row__badges">
                  <ApplicationStatusBadge :status="app.status" />
                  <span v-if="app.viewed_at" class="viewed-chip">Viewed</span>
                </div>
              </div>

              <div class="app-row__footer">
                <span class="app-row__date">Applied {{ formatDate(app.submitted_at) }}</span>
                <button
                  v-if="canWithdraw(app.status)"
                  type="button"
                  class="withdraw-btn"
                  @click.stop="withdrawTarget = app"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="store.currentPage < store.lastPage" class="apps-load-more">
          <button
            type="button"
            class="load-more-btn"
            :disabled="store.isLoading"
            @click="loadMore"
          >
            {{ store.isLoading ? 'Loading…' : 'Load more' }}
          </button>
        </div>
      </template>

      <div v-else class="apps-empty glass-panel">
        <span class="material-symbols-outlined">work_off</span>
        <p>You haven't applied to any jobs yet.</p>
        <RouterLink to="/jobs" class="apps-empty__link">Browse Jobs</RouterLink>
      </div>
    </div>

    <WithdrawConfirmModal
      :open="!!withdrawTarget"
      :job-title="withdrawTarget?.job.title ?? ''"
      @withdrawn="confirmWithdraw"
      @close="withdrawTarget = null"
    />
  </AppLayout>
</template>

<style scoped>
.apps-page {
  display: grid;
  gap: 1.5rem;
}

.apps-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.apps-title {
  margin: 0;
  font-family: var(--font-display), serif;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  color: var(--on-surface);
}

.apps-loading {
  color: var(--on-surface-variant);
  text-align: center;
  padding: 3rem;
}

.apps-list {
  display: grid;
  gap: 0.85rem;
}

.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 183, 125, 0.15);
}

.app-row {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1.1rem;
  align-items: flex-start;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
  outline: none;
}

.app-row:hover,
.app-row:focus-visible {
  border-color: rgba(255, 183, 125, 0.28);
  transform: translateY(-1px);
}

.app-row__logo {
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  display: grid;
  place-items: center;
  font-family: var(--font-display), serif;
  font-size: 1.2rem;
  color: var(--on-surface);
  overflow: hidden;
}

.app-row__logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-row__body {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.6rem;
}

.app-row__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.app-row__title {
  margin: 0;
  font-weight: 600;
  color: var(--on-surface);
  font-size: 0.95rem;
}

.app-row__company {
  margin: 0.15rem 0 0;
  font-size: 0.82rem;
  color: var(--on-surface-variant);
}

.app-row__badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.viewed-chip {
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  background: rgba(255, 183, 125, 0.1);
  border: 1px solid rgba(255, 183, 125, 0.2);
  color: var(--primary-dim);
  font-size: 0.72rem;
  font-weight: 600;
}

.app-row__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.app-row__date {
  font-size: 0.8rem;
  color: var(--on-surface-variant);
}

.withdraw-btn {
  padding: 0.3rem 0.85rem;
  border-radius: 9999px;
  border: 1px solid rgba(248, 113, 113, 0.25);
  background: rgba(248, 113, 113, 0.07);
  color: #f87171;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.withdraw-btn:hover {
  background: rgba(248, 113, 113, 0.15);
  border-color: rgba(248, 113, 113, 0.4);
}

.apps-load-more {
  display: flex;
  justify-content: center;
}

.load-more-btn {
  padding: 0.6rem 1.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: var(--on-surface-variant);
  font: inherit;
  font-size: 0.88rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.load-more-btn:not(:disabled):hover {
  border-color: rgba(255, 183, 125, 0.3);
  color: var(--primary-dim);
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apps-empty {
  display: grid;
  place-items: center;
  gap: 0.75rem;
  padding: 4rem 2rem;
  border-radius: 1.25rem;
  text-align: center;
}

.apps-empty .material-symbols-outlined {
  font-size: 3rem;
  color: var(--on-surface-variant);
}

.apps-empty p {
  margin: 0;
  color: var(--on-surface-variant);
}

.apps-empty__link {
  padding: 0.55rem 1.4rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 183, 125, 0.25);
  background: rgba(255, 183, 125, 0.08);
  color: var(--primary-dim);
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}

.apps-empty__link:hover {
  background: rgba(255, 183, 125, 0.18);
}
</style>
