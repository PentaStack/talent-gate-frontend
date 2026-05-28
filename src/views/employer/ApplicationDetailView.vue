<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import ApplicationStatusBadge from '@/components/applications/ApplicationStatusBadge.vue'
import EmployerStatusActions from '@/components/applications/EmployerStatusActions.vue'
import { getApplication, updateApplicationStatus } from '@/api/applications'
import { useToast } from '@/composables/useToast'
import type { ApplicationStatus, EmployerApplicationListItem } from '@/types'

const route = useRoute()
const router = useRouter()
const { show: showToast } = useToast()

const applicationId = Number(route.params.applicationId)
const jobId = route.query.jobId ? Number(route.query.jobId) : null

const application = ref<EmployerApplicationListItem | null>(null)
const isLoading = ref(true)
const actionsRef = ref<InstanceType<typeof EmployerStatusActions> | null>(null)

onMounted(async () => {
  try {
    application.value = await getApplication(applicationId)
  } finally {
    isLoading.value = false
  }
})

async function handleStatusUpdate(newStatus: ApplicationStatus) {
  try {
    const updated = await updateApplicationStatus(applicationId, newStatus)
    application.value = updated
    showToast(`Status updated to ${newStatus}.`, 'success')
  } catch {
    showToast('Failed to update status.', 'error')
  } finally {
    actionsRef.value?.done()
  }
}

function goBack() {
  if (jobId) {
    router.push(`/employer/jobs/${jobId}/applications`)
  } else {
    router.back()
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <AppLayout>
    <div class="adv-page">
      <button type="button" class="back-btn" @click="goBack">
        <span class="material-symbols-outlined">arrow_back</span>
        Back to Applications
      </button>

      <div v-if="isLoading" class="adv-loading">Loading…</div>

      <template v-else-if="application">
        <div class="adv-grid">
          <!-- Candidate card -->
          <aside class="candidate-card glass-panel">
            <div class="candidate-card__avatar">
              <img
                v-if="application.candidate.avatar_url"
                :src="application.candidate.avatar_url"
                :alt="application.candidate.name"
                class="candidate-card__avatar-img"
              />
              <span v-else>{{ application.candidate.name.charAt(0) }}</span>
            </div>
            <p class="candidate-card__name">{{ application.candidate.name }}</p>
            <p v-if="application.candidate.experience_level" class="candidate-card__level">
              {{ application.candidate.experience_level }}
            </p>
            <div v-if="application.candidate.skills?.length" class="candidate-card__skills">
              <span v-for="skill in application.candidate.skills" :key="skill" class="skill-chip">
                {{ skill }}
              </span>
            </div>
          </aside>

          <!-- Main content -->
          <div class="adv-main">
            <div class="adv-meta glass-panel">
              <div class="adv-meta__row">
                <span class="adv-meta__label">Status</span>
                <ApplicationStatusBadge :status="application.status" />
              </div>
              <div class="adv-meta__row">
                <span class="adv-meta__label">Submitted</span>
                <span class="adv-meta__value">{{ formatDate(application.submitted_at) }}</span>
              </div>
              <div class="adv-meta__row" v-if="application.viewed_at">
                <span class="adv-meta__label">Viewed</span>
                <span class="adv-meta__value">{{ formatDate(application.viewed_at) }}</span>
              </div>
            </div>

            <div class="adv-actions glass-panel">
              <p class="adv-actions__label">Actions</p>
              <EmployerStatusActions
                ref="actionsRef"
                :current-status="application.status"
                @update="handleStatusUpdate"
              />
              <p v-if="!['pending','shortlisted'].includes(application.status)" class="adv-actions__terminal">
                No further actions available.
              </p>
            </div>

            <div class="adv-cover glass-panel">
              <p class="adv-cover__label">Cover Letter</p>
              <pre class="adv-cover__text">{{ application.cover_letter }}</pre>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
.adv-page {
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

.back-btn:hover {
  color: var(--primary-dim);
}

.back-btn .material-symbols-outlined {
  font-size: 1.1rem;
}

.adv-loading {
  color: var(--on-surface-variant);
  padding: 3rem;
  text-align: center;
}

.adv-grid {
  display: grid;
  gap: 1.25rem;
  align-items: start;
}

@media (min-width: 768px) {
  .adv-grid {
    grid-template-columns: 260px 1fr;
  }
}

.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 183, 125, 0.15);
}

.candidate-card {
  padding: 1.5rem;
  border-radius: 1.1rem;
  display: grid;
  gap: 0.75rem;
  place-items: center;
  text-align: center;
}

.candidate-card__avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  display: grid;
  place-items: center;
  font-family: var(--font-display), serif;
  font-size: 1.5rem;
  color: var(--on-surface);
  overflow: hidden;
}

.candidate-card__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.candidate-card__name {
  margin: 0;
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--on-surface);
}

.candidate-card__level {
  margin: 0;
  font-size: 0.83rem;
  color: var(--on-surface-variant);
}

.candidate-card__skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-content: center;
}

.skill-chip {
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--on-surface-variant);
  font-size: 0.73rem;
}

.adv-main {
  display: grid;
  gap: 1rem;
}

.adv-meta,
.adv-actions,
.adv-cover {
  padding: 1.25rem 1.5rem;
  border-radius: 1.1rem;
  display: grid;
  gap: 0.75rem;
}

.adv-meta__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.adv-meta__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  min-width: 5rem;
}

.adv-meta__value {
  font-size: 0.88rem;
  color: var(--on-surface);
}

.adv-actions__label,
.adv-cover__label {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.adv-actions__terminal {
  margin: 0;
  font-size: 0.85rem;
  color: var(--on-surface-variant);
  font-style: italic;
}

.adv-cover__text {
  margin: 0;
  font: inherit;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--on-surface);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
