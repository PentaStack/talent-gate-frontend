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

      <!-- Search & Filter -->
      <section class="jobs-search glass-panel" aria-label="Search and filter jobs">
        <div class="jobs-search__field">
          <span class="material-symbols-outlined">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by title, skill, or company…"
            id="jobs-search-input"
          />
        </div>
        <div class="jobs-search__field jobs-search__field--split">
          <span class="material-symbols-outlined">location_on</span>
          <input
            v-model="locationFilter"
            type="text"
            placeholder="Location or Remote"
            id="jobs-location-input"
          />
        </div>
        <div class="jobs-search__filter">
          <span class="material-symbols-outlined">filter_list</span>
          <select v-model="typeFilter" id="jobs-type-filter">
            <option value="">All Types</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>
      </section>

      <!-- Job list -->
      <section class="jobs-list" aria-label="Job listings">
        <div
          v-for="job in filteredJobs"
          :key="job.id"
          class="job-card glass-panel"
        >
          <div class="job-card__logo">{{ job.company.charAt(0) }}</div>

          <div class="job-card__body">
            <div class="job-card__top">
              <div>
                <h2 class="job-card__title">{{ job.title }}</h2>
                <p class="job-card__company">{{ job.company }}</p>
              </div>
              <span class="job-card__type" :class="`job-card__type--${job.type.toLowerCase().replace('/', '-')}`">
                {{ job.type }}
              </span>
            </div>

            <p class="job-card__description">{{ job.description }}</p>

            <div class="job-card__footer">
              <div class="job-card__tags">
                <span
                  v-for="skill in job.skills"
                  :key="skill"
                  class="skill-tag"
                >{{ skill }}</span>
              </div>
              <div class="job-card__meta">
                <span class="job-card__salary">{{ job.salary }}</span>
                <span class="job-card__date">{{ job.posted }}</span>
                <button
                  type="button"
                  class="apply-btn"
                  :id="`apply-job-${job.id}`"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredJobs.length === 0" class="jobs-empty glass-panel">
          <span class="material-symbols-outlined">search_off</span>
          <h3>No matching roles found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'

const searchQuery = ref('')
const locationFilter = ref('')
const typeFilter = ref('')

// Static job data – replace with real API call when backend is ready
const jobs = ref([
  {
    id: 1,
    title: 'Senior Rust Engineer',
    company: 'Neural Systems',
    type: 'Remote',
    salary: '$180k \u2013 $240k',
    posted: '2 days ago',
    description: `Build blazing-fast, memory-safe systems in Rust. You will own critical infrastructure components and shape our WebAssembly runtime.`,
    skills: ['Rust', 'WebAssembly', 'Linux'],
  },
  {
    id: 2,
    title: 'Lead Product Designer',
    company: 'Obsidian Labs',
    type: 'Hybrid',
    salary: '$160k \u2013 $210k',
    posted: '3 days ago',
    description: `Drive end-to-end product design across our suite of developer tools. Own the design system and lead a small, focused team.`,
    skills: ['Figma', 'Design Systems', 'Prototyping'],
  },
  {
    id: 3,
    title: 'Backend Architect',
    company: 'CyberCore',
    type: 'On-site',
    salary: '$200k \u2013 $280k',
    posted: '1 week ago',
    description: `Architect and scale distributed backend services serving millions of requests. Deep expertise in Go and Kubernetes preferred.`,
    skills: ['Go', 'Kubernetes', 'Distributed Systems'],
  },
  {
    id: 4,
    title: 'Full-Stack Engineer (Vue + Laravel)',
    company: 'DevForge',
    type: 'Remote',
    salary: '$120k \u2013 $160k',
    posted: '5 days ago',
    description: `Build and ship product features across the full stack. Comfortable moving between Vue 3 on the frontend and Laravel APIs on the backend.`,
    skills: ['Vue', 'Laravel', 'TypeScript'],
  },
  {
    id: 5,
    title: 'Machine Learning Engineer',
    company: 'Axiom AI',
    type: 'Remote',
    salary: '$200k \u2013 $260k',
    posted: '1 day ago',
    description: `Design and deploy ML pipelines at scale. Work closely with applied research to bring models from experiment to production.`,
    skills: ['Python', 'PyTorch', 'MLOps'],
  },
  {
    id: 6,
    title: 'DevOps / Platform Engineer',
    company: 'Stackline',
    type: 'Hybrid',
    salary: '$140k \u2013 $185k',
    posted: '4 days ago',
    description: `Own our cloud infrastructure on AWS. Build reliable CI/CD pipelines and help engineering teams ship faster and safer.`,
    skills: ['AWS', 'Terraform', 'GitHub Actions'],
  },
])

const filteredJobs = computed(() => {
  return jobs.value.filter((job) => {
    const q = searchQuery.value.toLowerCase()
    const loc = locationFilter.value.toLowerCase()
    const type = typeFilter.value.toLowerCase()

    const matchesQuery =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.skills.some((s) => s.toLowerCase().includes(q)) ||
      job.description.toLowerCase().includes(q)

    const matchesLocation =
      !loc ||
      job.type.toLowerCase().includes(loc) ||
      job.company.toLowerCase().includes(loc)

    const matchesType = !type || job.type.toLowerCase() === type

    return matchesQuery && matchesLocation && matchesType
  })
})
</script>

<style scoped>
.jobs-page {
  display: grid;
  gap: 1.75rem;
}

/* Header */
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

/* Search */
.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 183, 125, 0.15);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.jobs-search {
  display: grid;
  gap: 0;
  border-radius: 9999px;
  padding: 0.4rem;
}

.jobs-search__field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.jobs-search__field--split {
  border-bottom: 0;
}

.jobs-search__field .material-symbols-outlined {
  color: var(--on-surface-variant);
  font-size: 1.2rem;
  flex-shrink: 0;
}

.jobs-search__field input,
.jobs-search__filter select {
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

.jobs-search__filter {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
}

.jobs-search__filter .material-symbols-outlined {
  color: var(--on-surface-variant);
  font-size: 1.2rem;
  flex-shrink: 0;
}

.jobs-search__filter select {
  cursor: pointer;
  appearance: none;
  color: var(--on-surface-variant);
}

.jobs-search__filter select option {
  background: #1a1a1c;
}

/* Job list */
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

.job-card__type {
  flex-shrink: 0;
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.job-card__type--remote {
  background: rgba(134, 239, 172, 0.1);
  color: #86efac;
  border: 1px solid rgba(134, 239, 172, 0.2);
}

.job-card__type--hybrid {
  background: rgba(255, 183, 125, 0.1);
  color: var(--primary-dim);
  border: 1px solid rgba(255, 183, 125, 0.2);
}

.job-card__type--on-site {
  background: rgba(201, 190, 255, 0.1);
  color: var(--secondary);
  border: 1px solid rgba(201, 190, 255, 0.2);
}

.job-card__description {
  margin: 0;
  font-size: 0.9rem;
  color: var(--on-surface-variant);
  line-height: 1.6;
}

.job-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.job-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.skill-tag {
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--on-surface-variant);
  font-size: 0.75rem;
}

.job-card__meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.job-card__salary {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--primary-dim);
}

.job-card__date {
  font-size: 0.8rem;
  color: var(--on-surface-variant);
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

/* Empty state */
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

/* Responsive */
@media (min-width: 768px) {
  .jobs-search {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
    align-items: stretch;
  }

  .jobs-search__field {
    border-bottom: 0;
    border-right: 1px solid rgba(255, 255, 255, 0.07);
  }

  .jobs-search__filter {
    border-left: 1px solid rgba(255, 255, 255, 0.07);
  }
}
</style>
