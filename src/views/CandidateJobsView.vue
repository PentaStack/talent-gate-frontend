<template>
  <AppLayout>
    <div class="jobs-page">
      <!-- Page header -->
      <div class="jobs-header">
        <div class="jobs-header__copy">
          <p class="jobs-kicker">Matched for you</p>
          <h1>Find Your Next Role</h1>
          <p class="jobs-subtitle">
            Explore technical opportunities tailored to your profile and skills.
          </p>
        </div>
        <div class="jobs-header__stats">
          <div class="stat-chip glass-panel">
            <span class="material-symbols-outlined">work</span>
            <div>
              <p class="stat-chip__value">{{ jobs.length }}</p>
              <p class="stat-chip__label">Open Roles</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search -->
      <section class="jobs-search glass-panel" aria-label="Search jobs">
        <div class="jobs-search__field">
          <span class="material-symbols-outlined">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by title or company…"
            id="jobs-search-input"
          />
        </div>
      </section>

      <!-- Loading -->
      <div v-if="isLoading" class="jobs-loading">Loading…</div>

      <!-- Job list -->
      <section v-else class="jobs-list" aria-label="Job listings">
        <div
          v-for="job in filteredJobs"
          :key="job.id"
          class="job-card glass-panel"
        >
          <div class="job-card__logo">
            <img
              v-if="job.employer.logo_url"
              :src="job.employer.logo_url"
              :alt="job.employer.company_name"
              class="job-card__logo-img"
            />
            <span v-else>{{ job.employer.company_name.charAt(0) }}</span>
          </div>

          <div class="job-card__body">
            <div class="job-card__top">
              <div>
                <h2 class="job-card__title">{{ job.title }}</h2>
                <p class="job-card__company">{{ job.employer.company_name }}</p>
              </div>
            </div>

            <div class="job-card__footer">
              <span v-if="job.application_deadline" class="job-card__date">
                Deadline: {{ job.application_deadline }}
              </span>
              <div class="job-card__meta">
                <button
                  v-if="!applicationsStore.appliedJobIds.has(job.id)"
                  type="button"
                  class="apply-btn"
                  :id="`apply-job-${job.id}`"
                  @click="openApplyPage(job)"
                >
                  Apply Now
                </button>
                <span v-else class="applied-label">Applied</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredJobs.length === 0" class="jobs-empty glass-panel">
          <span class="material-symbols-outlined">search_off</span>
          <h3>No matching roles found</h3>
          <p>Try adjusting your search criteria.</p>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useApplicationsStore } from '@/stores/applications'
import { fetchJobs } from '@/api/jobs'
import type { JobListing } from '@/api/jobs'

const router = useRouter()
const applicationsStore = useApplicationsStore()

const searchQuery = ref('')
const jobs = ref<JobListing[]>([])
const isLoading = ref(true)

function openApplyPage(job: JobListing) {
  router.push({ path: `/jobs/${job.id}/apply`, state: { jobTitle: job.title, jobCompany: job.employer.company_name } })
}

onMounted(async () => {
  await Promise.all([
    fetchJobs().then((res) => { jobs.value = res.data }),
    applicationsStore.fetchMyApplications(),
  ])
  isLoading.value = false
})

const filteredJobs = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return jobs.value
  return jobs.value.filter(
    (job) =>
      job.title.toLowerCase().includes(q) ||
      job.employer.company_name.toLowerCase().includes(q),
  )
})
</script>

<style scoped>
.jobs-page {
  display: grid;
  gap: 1.75rem;
}

.jobs-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.jobs-kicker {
  margin: 0 0 0.4rem;
  color: var(--primary-dim);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.jobs-header h1 {
  margin: 0 0 0.5rem;
  font-family: var(--font-display), serif;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  color: var(--on-surface);
}

.jobs-subtitle {
  margin: 0;
  color: var(--on-surface-variant);
  font-size: 1rem;
  line-height: 1.6;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-radius: 1rem;
}

.stat-chip .material-symbols-outlined {
  font-size: 1.6rem;
  color: var(--primary-dim);
}

.stat-chip__value {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--on-surface);
  font-family: var(--font-display), serif;
}

.stat-chip__label {
  margin: 0;
  font-size: 0.75rem;
  color: var(--on-surface-variant);
}

.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 183, 125, 0.15);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.jobs-search {
  border-radius: 9999px;
  padding: 0.4rem;
}

.jobs-search__field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
}

.jobs-search__field .material-symbols-outlined {
  color: var(--on-surface-variant);
  font-size: 1.2rem;
  flex-shrink: 0;
}

.jobs-search__field input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--on-surface);
  outline: none;
  font: inherit;
  font-size: 0.95rem;
}

.jobs-search__field input::placeholder {
  color: rgba(221, 193, 174, 0.45);
}

.jobs-loading {
  color: var(--on-surface-variant);
  text-align: center;
  padding: 3rem;
}

.jobs-list {
  display: grid;
  gap: 1rem;
}

.job-card {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: 1.25rem;
  align-items: flex-start;
  transition: border-color 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
}

.job-card:hover {
  border-color: rgba(255, 183, 125, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 183, 125, 0.08);
}

.job-card__logo {
  flex-shrink: 0;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  display: grid;
  place-items: center;
  font-family: var(--font-display), serif;
  font-size: 1.35rem;
  color: var(--on-surface);
  overflow: hidden;
}

.job-card__logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.job-card__body {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.75rem;
}

.job-card__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.job-card__title {
  margin: 0;
  font-family: var(--font-display), serif;
  font-size: 1.1rem;
  color: var(--on-surface);
}

.job-card__company {
  margin: 0.2rem 0 0;
  font-size: 0.88rem;
  color: var(--on-surface-variant);
}

.job-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.job-card__date {
  font-size: 0.8rem;
  color: var(--on-surface-variant);
}

.job-card__meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.apply-btn {
  padding: 0.55rem 1.2rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 183, 125, 0.25);
  background: rgba(255, 183, 125, 0.08);
  color: var(--primary-dim);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.apply-btn:hover {
  background: rgba(255, 183, 125, 0.18);
  border-color: rgba(255, 183, 125, 0.45);
  transform: translateY(-1px);
}

.applied-label {
  padding: 0.55rem 1.2rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--on-surface-variant);
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.6;
  cursor: default;
}

.jobs-empty {
  display: grid;
  place-items: center;
  gap: 0.75rem;
  padding: 4rem 2rem;
  border-radius: 1.25rem;
  text-align: center;
}

.jobs-empty .material-symbols-outlined {
  font-size: 3rem;
  color: var(--on-surface-variant);
}

.jobs-empty h3 {
  margin: 0;
  font-family: var(--font-display), serif;
  color: var(--on-surface);
}

.jobs-empty p {
  margin: 0;
  color: var(--on-surface-variant);
}
</style>
