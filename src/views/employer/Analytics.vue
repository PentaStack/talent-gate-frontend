<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale,
} from 'chart.js'
import AppLayout from '@/layouts/AppLayout.vue'
import { fetchEmployerAnalytics } from '@/api/admin'
import type { EmployerAnalytics, JobAnalytics } from '@/types'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const analytics = ref<EmployerAnalytics | null>(null)
const loading = ref(true)
const selectedJobId = ref<number | null>(null)

onMounted(async () => {
  analytics.value = await fetchEmployerAnalytics()
  if (analytics.value.jobs.length > 0) {
    selectedJobId.value = analytics.value.jobs[0].job_id
  }
  loading.value = false
})

const selectedJob = computed<JobAnalytics | null>(() => {
  if (!analytics.value || selectedJobId.value === null) return null
  return analytics.value.jobs.find((j) => j.job_id === selectedJobId.value) ?? null
})

const chartColors = { primary: '#ffb77d', tertiary: '#85cfff', text: '#d7c3b6', grid: '#2e2e32' }

const allJobsChartData = computed(() => {
  if (!analytics.value) return null
  return {
    labels: analytics.value.jobs.map((j) => j.title),
    datasets: [
      { label: 'Applications', data: analytics.value.jobs.map((j) => j.applications), backgroundColor: chartColors.primary },
      { label: 'Views', data: analytics.value.jobs.map((j) => j.views), backgroundColor: chartColors.tertiary },
    ],
  }
})

const chartData = computed(() => {
  const job = selectedJob.value
  if (!job) return null
  return {
    labels: ['Views', 'Applications'],
    datasets: [{ label: job.title, data: [job.views, job.applications], backgroundColor: [chartColors.tertiary, chartColors.primary] }],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: chartColors.text } } },
  scales: {
    x: { ticks: { color: chartColors.text, maxRotation: 45 }, grid: { color: chartColors.grid } },
    y: { ticks: { color: chartColors.text }, grid: { color: chartColors.grid } },
  },
}
</script>

<template>
  <AppLayout>
    <header class="page-header">
      <h1 class="page-title">Employer Analytics</h1>
      <p class="page-subtitle">Real-time recruitment performance metrics.</p>
    </header>

    <p v-if="loading" class="muted">Loading analytics…</p>

    <template v-else-if="analytics">
      <section class="metrics-row">
        <div class="glass-panel stat-card">
          <div class="stat-card__icon"><span class="material-symbols-outlined">visibility</span></div>
          <p class="stat-card__label">Total views</p>
          <p class="stat-card__value">{{ analytics.totals.views.toLocaleString() }}</p>
        </div>
        <div class="glass-panel stat-card glass-panel--glow">
          <div class="stat-card__icon"><span class="material-symbols-outlined">group</span></div>
          <p class="stat-card__label">Total applications</p>
          <p class="stat-card__value">{{ analytics.totals.applications.toLocaleString() }}</p>
        </div>
      </section>

      <section class="glass-panel chart-section">
        <h3 class="chart-section__title">All listings overview</h3>
        <div class="chart-section__canvas">
          <Bar v-if="allJobsChartData" :data="allJobsChartData" :options="chartOptions" />
        </div>
      </section>

      <section class="glass-panel chart-section">
        <h3 class="chart-section__title">Per listing</h3>
        <select v-model="selectedJobId" class="select-field job-select">
          <option v-for="job in analytics.jobs" :key="job.job_id" :value="job.job_id">{{ job.title }}</option>
        </select>
        <div v-if="selectedJob" class="job-meta">
          <span><span class="material-symbols-outlined">visibility</span> {{ selectedJob.views }} views</span>
          <span><span class="material-symbols-outlined">description</span> {{ selectedJob.applications }} applications</span>
          <span v-if="selectedJob.views > 0" class="job-meta__conv">
            {{ ((selectedJob.applications / selectedJob.views) * 100).toFixed(1) }}% conversion
          </span>
        </div>
        <div class="chart-section__canvas">
          <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
        </div>
      </section>
    </template>
  </AppLayout>
</template>

<style scoped>
.page-header { margin-bottom: 2rem; }
.muted { color: var(--on-surface-variant); }
.metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.chart-section {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.chart-section__title {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--on-surface);
}
.chart-section__canvas { height: 280px; }
.job-select {
  width: 100%;
  max-width: 400px;
  margin-bottom: 1rem;
}
.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: var(--on-surface-variant);
  margin-bottom: 1rem;
}
.job-meta span {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.job-meta__conv { color: var(--primary-dim); }
</style>
