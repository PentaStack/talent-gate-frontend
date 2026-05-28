<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import ApplicationStatusBadge from '@/components/applications/ApplicationStatusBadge.vue'
import { listJobApplications } from '@/api/applications'
import type { ApplicationStatus, EmployerApplicationListItem } from '@/types'

const route = useRoute()
const router = useRouter()

const jobId = Number(route.params.jobId)

type Tab = 'all' | ApplicationStatus
const tabs: { label: string; value: Tab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Withdrawn', value: 'withdrawn' },
]

const activeTab = ref<Tab>('all')
const applications = ref<EmployerApplicationListItem[]>([])
const isLoading = ref(false)
const currentPage = ref(1)
const lastPage = ref(1)

async function load(tab: Tab, page = 1) {
  isLoading.value = true
  try {
    const status = tab === 'all' ? undefined : tab
    const res = await listJobApplications(jobId, status, page)
    if (page === 1) {
      applications.value = res.data
    } else {
      applications.value = [...applications.value, ...res.data]
    }
    currentPage.value = res.meta.current_page
    lastPage.value = res.meta.last_page
  } finally {
    isLoading.value = false
  }
}

onMounted(() => load(activeTab.value))

watch(activeTab, (tab) => load(tab))

function goToDetail(app: EmployerApplicationListItem) {
  router.push({ path: `/employer/applications/${app.id}`, query: { jobId } })
}

function loadMore() {
  load(activeTab.value, currentPage.value + 1)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <AppLayout>
    <div class="jav-page">
      <div class="jav-header">
        <h1 class="jav-title">Applications</h1>
      </div>

      <div class="jav-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="isLoading && applications.length === 0" class="jav-loading">Loading…</div>

      <template v-else-if="applications.length > 0">
        <div class="jav-list">
          <div
            v-for="app in applications"
            :key="app.id"
            class="app-row glass-panel"
            role="button"
            tabindex="0"
            @click="goToDetail(app)"
            @keydown.enter="goToDetail(app)"
          >
            <div class="app-row__avatar">
              <img
                v-if="app.candidate.avatar_url"
                :src="app.candidate.avatar_url"
                :alt="app.candidate.name"
                class="app-row__avatar-img"
              />
              <span v-else>{{ app.candidate.name.charAt(0) }}</span>
            </div>

            <div class="app-row__body">
              <div class="app-row__top">
                <div>
                  <p class="app-row__name">{{ app.candidate.name }}</p>
                  <p v-if="app.candidate.experience_level" class="app-row__level">
                    {{ app.candidate.experience_level }}
                  </p>
                </div>
                <div class="app-row__badges">
                  <span v-if="!app.viewed_at" class="new-badge">New</span>
                  <ApplicationStatusBadge :status="app.status" />
                </div>
              </div>

              <div v-if="app.candidate.skills?.length" class="app-row__skills">
                <span v-for="skill in app.candidate.skills" :key="skill" class="skill-chip">
                  {{ skill }}
                </span>
              </div>

              <p class="app-row__date">Applied {{ formatDate(app.submitted_at) }}</p>
            </div>
          </div>
        </div>

        <div v-if="currentPage < lastPage" class="jav-load-more">
          <button type="button" class="load-more-btn" :disabled="isLoading" @click="loadMore">
            {{ isLoading ? 'Loading…' : 'Load more' }}
          </button>
        </div>
      </template>

      <div v-else class="jav-empty glass-panel">
        <span class="material-symbols-outlined">inbox</span>
        <p>No applications for this filter.</p>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.jav-page {
  display: grid;
  gap: 1.5rem;
}

.jav-title {
  margin: 0;
  font-family: var(--font-display), serif;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  color: var(--on-surface);
}

.jav-tabs {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: var(--on-surface-variant);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.tab-btn--active {
  background: rgba(255, 183, 125, 0.12);
  border-color: rgba(255, 183, 125, 0.35);
  color: var(--primary-dim);
}

.tab-btn:not(.tab-btn--active):hover {
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--on-surface);
}

.jav-loading {
  color: var(--on-surface-variant);
  padding: 3rem;
  text-align: center;
}

.jav-list {
  display: grid;
  gap: 0.75rem;
}

.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 183, 125, 0.15);
}

.app-row {
  display: flex;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
  outline: none;
}

.app-row:hover,
.app-row:focus-visible {
  border-color: rgba(255, 183, 125, 0.3);
  transform: translateY(-1px);
}

.app-row__avatar {
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  display: grid;
  place-items: center;
  font-family: var(--font-display), serif;
  font-size: 1.1rem;
  color: var(--on-surface);
  overflow: hidden;
}

.app-row__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-row__body {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.45rem;
}

.app-row__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.app-row__name {
  margin: 0;
  font-weight: 600;
  color: var(--on-surface);
  font-size: 0.95rem;
}

.app-row__level {
  margin: 0.1rem 0 0;
  font-size: 0.8rem;
  color: var(--on-surface-variant);
}

.app-row__badges {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.new-badge {
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  background: rgba(133, 207, 255, 0.12);
  border: 1px solid rgba(133, 207, 255, 0.25);
  color: #85cfff;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.app-row__skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.skill-chip {
  padding: 0.18rem 0.55rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--on-surface-variant);
  font-size: 0.73rem;
}

.app-row__date {
  margin: 0;
  font-size: 0.78rem;
  color: var(--on-surface-variant);
}

.jav-load-more {
  display: flex;
  justify-content: center;
}

.load-more-btn {
  padding: 0.55rem 1.75rem;
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

.jav-empty {
  display: grid;
  place-items: center;
  gap: 0.65rem;
  padding: 4rem 2rem;
  border-radius: 1.25rem;
  text-align: center;
}

.jav-empty .material-symbols-outlined {
  font-size: 2.5rem;
  color: var(--on-surface-variant);
}

.jav-empty p {
  margin: 0;
  color: var(--on-surface-variant);
}
</style>
