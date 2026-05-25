<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import AppLayout from '@/layouts/AppLayout.vue'
import { fetchAdminStats } from '@/api/admin'
import type { AdminStats } from '@/types'

ChartJS.register(
  Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale,
  ArcElement, PointElement, LineElement,
)

const stats = ref<AdminStats | null>(null)
const loading = ref(true)

onMounted(async () => {
  stats.value = await fetchAdminStats()
  loading.value = false
})

const statCards = computed(() => {
  if (!stats.value) return []
  return [
    { label: 'Total Users', value: stats.value.users_count, icon: 'group', accent: 'primary' },
    { label: 'Active Jobs', value: stats.value.jobs_count, icon: 'work', accent: 'secondary' },
    { label: 'Applications', value: stats.value.applications_count, icon: 'description', accent: 'tertiary' },
    { label: 'Revenue', value: stats.value.revenue_total ? `$${stats.value.revenue_total.toLocaleString()}` : '—', icon: 'payments', accent: 'primary', glow: !!stats.value.revenue_total },
  ]
})

const hasCharts = computed(() =>
  stats.value &&
  (stats.value.jobs_by_month.length > 0 || stats.value.users_by_role.length > 0 || stats.value.revenue_by_month.length > 0),
)

const chartColors = {
  primary: '#ffb77d',
  secondary: '#c9beff',
  tertiary: '#85cfff',
  grid: '#2e2e32',
  text: '#d7c3b6',
}

const jobsChartData = computed(() => {
  if (!stats.value?.jobs_by_month.length) return null
  return {
    labels: stats.value.jobs_by_month.map((m) => m.month),
    datasets: [{ label: 'Jobs', data: stats.value.jobs_by_month.map((m) => m.count), backgroundColor: chartColors.primary }],
  }
})

const usersChartData = computed(() => {
  if (!stats.value?.users_by_role.length) return null
  return {
    labels: stats.value.users_by_role.map((r) => r.role),
    datasets: [{ data: stats.value.users_by_role.map((r) => r.count), backgroundColor: [chartColors.tertiary, chartColors.primary, chartColors.secondary] }],
  }
})

const revenueChartData = computed(() => {
  if (!stats.value?.revenue_by_month.length) return null
  return {
    labels: stats.value.revenue_by_month.map((m) => m.month),
    datasets: [{
      label: 'Revenue',
      data: stats.value.revenue_by_month.map((m) => m.amount),
      borderColor: chartColors.primary,
      backgroundColor: 'rgba(255, 183, 125, 0.1)',
      fill: true,
      tension: 0.35,
    }],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: chartColors.text, font: { family: 'Inter' } } } },
  scales: {
    x: { ticks: { color: chartColors.text }, grid: { color: chartColors.grid } },
    y: { ticks: { color: chartColors.text }, grid: { color: chartColors.grid } },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const, labels: { color: chartColors.text } } },
}
</script>

<template>
  <AppLayout>
    <header class="page-header">
      <h1 class="page-title">Platform Overview</h1>
      <p class="page-subtitle">Real-time metrics and system health monitoring.</p>
    </header>

    <p v-if="loading" class="muted">Loading stats…</p>

    <template v-else-if="stats">
      <section class="stats-grid">
        <div
          v-for="(card, i) in statCards"
          :key="i"
          class="glass-panel stat-card"
          :class="{ 'glass-panel--glow': card.glow }"
        >
          <div class="stat-card__icon">
            <span class="material-symbols-outlined">{{ card.icon }}</span>
          </div>
          <p class="stat-card__label">{{ card.label }}</p>
          <p class="stat-card__value">{{ typeof card.value === 'number' ? card.value.toLocaleString() : card.value }}</p>
        </div>
      </section>

      <section v-if="hasCharts" class="charts-grid">
        <div v-if="jobsChartData" class="glass-panel chart-panel">
          <h3 class="chart-panel__title">Jobs by month</h3>
          <div class="chart-panel__canvas"><Bar :data="jobsChartData" :options="chartOptions" /></div>
        </div>
        <div v-if="usersChartData" class="glass-panel chart-panel">
          <h3 class="chart-panel__title">Users by role</h3>
          <div class="chart-panel__canvas"><Doughnut :data="usersChartData" :options="doughnutOptions" /></div>
        </div>
        <div v-if="revenueChartData" class="glass-panel chart-panel chart-panel--wide">
          <h3 class="chart-panel__title">Revenue trend</h3>
          <div class="chart-panel__canvas"><Line :data="revenueChartData" :options="chartOptions" /></div>
        </div>
      </section>
      <p v-else class="glass-panel note-panel">
        <span class="material-symbols-outlined">info</span>
        Live API returns counts only. Chart series appear when the backend adds time-series data.
      </p>
    </template>
  </AppLayout>
</template>

<style scoped>
.page-header { margin-bottom: 2rem; }
.muted { color: var(--on-surface-variant); }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}
.chart-panel { padding: 1.25rem; }
.chart-panel--wide { grid-column: 1 / -1; }
.chart-panel__title {
  margin: 0 0 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--on-surface);
}
.chart-panel__canvas { height: 240px; }
.note-panel {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  color: var(--on-surface-variant);
  font-size: 0.9rem;
}
@media (max-width: 768px) {
  .charts-grid { grid-template-columns: 1fr; }
}
</style>
