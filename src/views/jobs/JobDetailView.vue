<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import JobComments from '@/components/jobs/JobComments.vue'
import { fetchJob, type JobDetail } from '@/api/jobs'
import { useApplicationsStore } from '@/stores/applications'

const route  = useRoute()
const router = useRouter()
const jobId  = Number(route.params.jobId)

const job = ref<JobDetail | null>(null)
const isLoading = ref(true)
const applicationsStore = useApplicationsStore()

const workTypeLabel: Record<string, string> = {
  remote: 'Remote',
  onsite: 'On-site',
  hybrid: 'Hybrid',
}

onMounted(async () => {
  try {
    await applicationsStore.fetchMyApplications()
    job.value = await fetchJob(jobId)
  } finally {
    isLoading.value = false
  }
})

function applyNow() {
  router.push({
    path: `/jobs/${jobId}/apply`,
    state: { jobTitle: job.value?.title, jobCompany: job.value?.employer.company_name },
  })
}

const requirementLines = (req: string | null) =>
  req
    ? req.split(/\n|•/).map((l) => l.trim()).filter(Boolean)
    : []
</script>

<template>
  <AppLayout>
    <div v-if="isLoading" class="detail-loading">Loading…</div>

    <div v-else-if="!job" class="detail-loading">Job not found.</div>

    <div v-else class="job-detail-page">
      <!-- Hero card -->
      <section class="hero-card glass-panel">
        <div class="hero-glow hero-glow--primary" />
        <div class="hero-glow hero-glow--secondary" />

        <div class="hero-inner">
          <div class="hero-left">
            <div class="company-logo">
              <img v-if="job.employer.logo_url" :src="job.employer.logo_url" :alt="job.employer.company_name" />
              <span v-else>{{ job.employer.company_name.charAt(0) }}</span>
            </div>
            <div>
              <div class="hero-meta-row">
                <p class="company-name">{{ job.employer.company_name }}</p>
                <span class="hiring-badge">Hiring Actively</span>
              </div>
              <h1>{{ job.title }}</h1>
              <div class="hero-chips">
                <span class="hero-chip" v-if="job.location">
                  <span class="material-symbols-outlined">location_on</span>{{ job.location }}
                </span>
                <span class="hero-chip" v-if="job.salary_range">
                  <span class="material-symbols-outlined">payments</span>{{ job.salary_range }}
                </span>
                <span class="hero-chip" v-if="job.work_type">
                  <span class="material-symbols-outlined">schedule</span>{{ workTypeLabel[job.work_type] ?? job.work_type }}
                </span>
                <span class="hero-chip" v-if="job.category">
                  <span class="material-symbols-outlined">category</span>{{ job.category.name }}
                </span>
              </div>
            </div>
          </div>

          <div class="hero-actions">
            <button
              v-if="!applicationsStore.appliedJobIds.has(jobId)"
              type="button"
              class="btn-apply"
              :id="`apply-job-detail-${jobId}`"
              @click="applyNow"
            >
              Apply Now <span class="material-symbols-outlined">arrow_forward</span>
            </button>
            <span v-else class="applied-badge">
              <span class="material-symbols-outlined">check_circle</span> Applied
            </span>
          </div>
        </div>
      </section>

      <!-- Two-column layout -->
      <div class="detail-grid">
        <!-- Left: content -->
        <div class="detail-main">
          <section v-if="job.description">
            <h2 class="section-title">
              <span class="material-symbols-outlined">description</span> About the Role
            </h2>
            <p class="body-text">{{ job.description }}</p>
          </section>

          <section v-if="requirementLines(job.requirements).length">
            <div class="req-card glass-panel">
              <h2 class="section-title-light">Key Requirements</h2>
              <ul class="req-list">
                <li v-for="(line, i) in requirementLines(job.requirements)" :key="i">
                  <span class="material-symbols-outlined req-icon">check_circle</span>
                  <span>{{ line }}</span>
                </li>
              </ul>
            </div>
          </section>

          <section v-if="job.technologies.length">
            <h2 class="section-title">
              <span class="material-symbols-outlined">code</span> Technologies
            </h2>
            <div class="tech-chips">
              <span v-for="tech in job.technologies" :key="tech.id" class="tech-chip">{{ tech.name }}</span>
            </div>
          </section>

          <!-- Bottom CTA -->
          <div class="bottom-cta">
            <div>
              <p class="bottom-cta__sub">Ready to join {{ job.employer.company_name }}?</p>
              <p class="bottom-cta__main">Take the next step in your career</p>
            </div>
            <button
              v-if="!applicationsStore.appliedJobIds.has(jobId)"
              type="button"
              class="btn-apply"
              @click="applyNow"
            >Apply Now</button>
            <span v-else class="applied-badge">
              <span class="material-symbols-outlined">check_circle</span> Applied
            </span>
          </div>
        </div>

        <!-- Right: sidebar -->
        <aside class="detail-sidebar">
          <!-- Company info -->
          <div class="sidebar-card glass-panel">
            <h3 class="sidebar-title">About the Company</h3>
            <div class="company-mini">
              <div class="company-logo company-logo--sm">
                <img v-if="job.employer.logo_url" :src="job.employer.logo_url" :alt="job.employer.company_name" />
                <span v-else>{{ job.employer.company_name.charAt(0) }}</span>
              </div>
              <div>
                <p class="company-mini__name">{{ job.employer.company_name }}</p>
                <a v-if="job.employer.website" :href="job.employer.website" target="_blank" rel="noopener" class="company-mini__link">
                  Visit Website <span class="material-symbols-outlined" style="font-size:12px">open_in_new</span>
                </a>
              </div>
            </div>
            <p v-if="job.employer.bio" class="company-bio">{{ job.employer.bio }}</p>
          </div>

          <!-- Job meta -->
          <div class="sidebar-card glass-panel">
            <h3 class="sidebar-title">Job Details</h3>
            <div class="meta-list">
              <div class="meta-row" v-if="job.application_deadline">
                <span class="meta-row__label"><span class="material-symbols-outlined">event</span> Deadline</span>
                <span class="meta-row__value">{{ job.application_deadline }}</span>
              </div>
              <div class="meta-row" v-if="job.work_type">
                <span class="meta-row__label"><span class="material-symbols-outlined">public</span> Work Mode</span>
                <span class="meta-row__value capitalize">{{ workTypeLabel[job.work_type] ?? job.work_type }}</span>
              </div>
              <div class="meta-row" v-if="job.salary_range">
                <span class="meta-row__label"><span class="material-symbols-outlined">payments</span> Salary</span>
                <span class="meta-row__value">{{ job.salary_range }}</span>
              </div>
              <div class="meta-row" v-if="job.category">
                <span class="meta-row__label"><span class="material-symbols-outlined">category</span> Category</span>
                <span class="meta-row__value">{{ job.category.name }}</span>
              </div>
              <div class="meta-row" v-if="job.views_count !== undefined">
                <span class="meta-row__label"><span class="material-symbols-outlined">visibility</span> Views</span>
                <span class="meta-row__value">{{ job.views_count }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <JobComments :job-id="jobId" />
    </div>
  </AppLayout>
</template>

<style scoped>
.detail-loading { text-align: center; padding: 4rem; color: var(--on-surface-variant); }

.job-detail-page { display: grid; gap: 2rem; }

/* Hero */
.hero-card {
  border-radius: 1.25rem;
  padding: 2rem 2.5rem;
  position: relative;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(60px);
  pointer-events: none;
}

.hero-glow--primary { width: 24rem; height: 24rem; background: rgba(255,183,125,0.1); top: -6rem; right: -6rem; }
.hero-glow--secondary { width: 16rem; height: 16rem; background: rgba(201,190,255,0.08); bottom: -4rem; left: -4rem; }

.hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
}

.hero-left { display: flex; gap: 1.5rem; align-items: flex-start; flex: 1; min-width: 0; }

.company-logo {
  flex-shrink: 0;
  width: 5rem;
  height: 5rem;
  border-radius: 1rem;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  display: grid;
  place-items: center;
  font-family: var(--font-display), serif;
  font-size: 1.5rem;
  color: var(--on-surface);
  overflow: hidden;
}

.company-logo--sm { width: 3rem; height: 3rem; font-size: 1rem; border-radius: 0.6rem; }
.company-logo img { width: 100%; height: 100%; object-fit: cover; }

.hero-meta-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem; }
.company-name { margin: 0; font-size: 0.9rem; color: var(--on-surface-variant); }
.hiring-badge { padding: 0.2rem 0.75rem; border-radius: 9999px; background: rgba(255,183,125,0.1); color: var(--primary-dim); font-size: 0.72rem; font-weight: 700; }

h1 { margin: 0 0 0.75rem; font-family: var(--font-display), serif; font-size: clamp(1.4rem, 3vw, 2rem); color: var(--on-surface); }

.hero-chips { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.hero-chip { display: flex; align-items: center; gap: 0.35rem; font-size: 0.85rem; color: var(--on-surface-variant); }
.hero-chip .material-symbols-outlined { font-size: 1rem; }

.hero-actions { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; flex-wrap: wrap; }

.btn-apply {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.75rem 1.75rem;
  border-radius: 9999px;
  border: none;
  background: var(--primary-dim);
  color: #0A0A0B;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 0 24px rgba(255,183,125,0.2);
}

.btn-apply:hover { opacity: 0.88; transform: translateY(-1px); }
.btn-apply .material-symbols-outlined { font-size: 1rem; }

.applied-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid rgba(134,239,172,0.3);
  color: #86efac;
  font-size: 0.85rem;
  font-weight: 600;
}
.applied-badge .material-symbols-outlined { font-size: 1rem; }

/* Detail grid */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 900px) { .detail-grid { grid-template-columns: 1fr; } }

.detail-main { display: grid; gap: 2rem; }

.section-title {
  margin: 0 0 1rem;
  font-family: var(--font-display), serif;
  font-size: 1.3rem;
  color: var(--primary-dim);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.section-title .material-symbols-outlined { font-size: 1.3rem; }

.section-title-light {
  margin: 0 0 1rem;
  font-family: var(--font-display), serif;
  font-size: 1.2rem;
  color: var(--on-surface);
}

.body-text { margin: 0; font-size: 1rem; line-height: 1.75; color: var(--on-surface-variant); white-space: pre-wrap; }

.req-card {
  border-radius: 1rem;
  padding: 1.5rem;
  border-left: 4px solid rgba(201,190,255,0.4);
}

.req-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.85rem; }
.req-list li { display: flex; gap: 0.6rem; align-items: flex-start; font-size: 0.95rem; color: var(--on-surface-variant); line-height: 1.55; }
.req-icon { color: #c9beff; font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }

.tech-chips { display: flex; flex-wrap: wrap; gap: 0.55rem; }
.tech-chip { padding: 0.35rem 0.9rem; border-radius: 9999px; border: 1px solid rgba(201,190,255,0.25); background: rgba(201,190,255,0.08); color: #c9beff; font-size: 0.82rem; font-weight: 600; }

.bottom-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255,183,125,0.12);
}

.bottom-cta__sub { margin: 0 0 0.2rem; font-size: 0.85rem; color: var(--on-surface-variant); }
.bottom-cta__main { margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--primary-dim); }

/* Sidebar */
.detail-sidebar { display: grid; gap: 1.25rem; }

.sidebar-card {
  border-radius: 1rem;
  padding: 1.25rem;
}

.sidebar-title {
  margin: 0 0 1rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--primary-dim);
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(255,183,125,0.12);
}

.company-mini { display: flex; gap: 0.85rem; align-items: center; margin-bottom: 0.85rem; }
.company-mini__name { margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--on-surface); }
.company-mini__link { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.78rem; color: #c9beff; text-decoration: none; }
.company-mini__link:hover { text-decoration: underline; }
.company-bio { margin: 0; font-size: 0.85rem; color: var(--on-surface-variant); line-height: 1.6; }

.meta-list { display: grid; gap: 0; }
.meta-row { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0; border-bottom: 1px solid rgba(255,183,125,0.08); }
.meta-row:last-child { border-bottom: none; }
.meta-row__label { display: flex; align-items: center; gap: 0.35rem; font-size: 0.82rem; color: var(--on-surface-variant); }
.meta-row__label .material-symbols-outlined { font-size: 0.95rem; }
.meta-row__value { font-size: 0.85rem; font-weight: 600; color: var(--on-surface); }
.capitalize { text-transform: capitalize; }

.glass-panel { background: rgba(26,26,28,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,183,125,0.15); }
</style>
