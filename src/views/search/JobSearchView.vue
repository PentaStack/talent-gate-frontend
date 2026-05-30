<template>
  <AppLayout>
    <div class="search-page">
      <!-- Header -->
      <div class="search-header">
        <div class="search-header__copy">
          <p class="search-kicker">Explore Opportunities</p>
          <h1>Search Jobs</h1>
        </div>
        <div class="search-header__stat stat-chip glass-panel">
          <span class="material-symbols-outlined">work</span>
          <div>
            <p class="stat-chip__value">{{ store.meta.total }}</p>
            <p class="stat-chip__label">Results</p>
          </div>
        </div>
      </div>

      <!-- Search bar + sort -->
      <section class="search-bar glass-panel" aria-label="Search jobs">
        <div class="search-bar__inner">
          <div class="search-bar__field">
            <span class="material-symbols-outlined">search</span>
            <input
              v-model="store.query"
              type="text"
              placeholder="Title, skill, or keyword…"
              id="search-input"
              autocomplete="off"
            />
          </div>
          <div class="search-bar__sort">
            <label for="search-sort" class="sr-only">Sort by</label>
            <select v-model="store.sort" id="search-sort">
              <option value="newest">Newest</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Active filter chips -->
      <ActiveFilters />

      <!-- Body: sidebar + list -->
      <div class="search-body">
        <!-- Sidebar toggle (mobile) -->
        <button
          type="button"
          class="sidebar-toggle glass-panel"
          @click="sidebarOpen = !sidebarOpen"
          :aria-expanded="sidebarOpen"
        >
          <span class="material-symbols-outlined">tune</span>
          Filters
          <span v-if="store.activeFilterCount > 0" class="filter-badge">{{
            store.activeFilterCount
          }}</span>
        </button>

        <!-- Sidebar -->
        <div
          class="search-body__sidebar"
          :class="{ 'search-body__sidebar--open': sidebarOpen }"
        >
          <FilterSidebar />
        </div>

        <!-- Job list -->
        <div class="search-body__results">
          <!-- Loading skeleton -->
          <div v-if="store.isLoading" class="search-loading">
            <div v-for="n in 5" :key="n" class="skeleton-card glass-panel" />
          </div>

          <!-- Results -->
          <template v-else>
            <div class="job-list">
              <div
                v-for="job in store.jobs"
                :key="job.id"
                class="job-card glass-panel"
                @click="
                  router.push({ name: 'job-detail', params: { jobId: job.id } })
                "
                style="cursor: pointer"
              >
                <!-- Logo -->
                <div class="job-card__logo">
                  <img
                    v-if="job.employer.logo_url"
                    :src="job.employer.logo_url"
                    :alt="job.employer.company_name"
                    class="job-card__logo-img"
                  />
                  <span v-else>{{ job.employer.company_name.charAt(0) }}</span>
                </div>

                <!-- Body -->
                <div class="job-card__body">
                  <div class="job-card__top">
                    <div>
                      <h2 class="job-card__title">{{ job.title }}</h2>
                      <p class="job-card__company">
                        {{ job.employer.company_name }}
                      </p>
                    </div>
                    <!-- Badges -->
                    <div class="job-card__badges">
                      <span v-if="job.work_type" class="badge badge--work">
                        {{ job.work_type }}
                      </span>
                      <span
                        v-if="job.experience_level"
                        class="badge badge--exp"
                      >
                        {{ job.experience_level }}
                      </span>
                    </div>
                  </div>

                  <div class="job-card__footer">
                    <div class="job-card__meta-row">
                      <span v-if="job.location" class="job-card__meta-item">
                        <span class="material-symbols-outlined"
                          >location_on</span
                        >
                        {{ job.location }}
                      </span>
                      <span
                        v-if="job.application_deadline"
                        class="job-card__meta-item"
                      >
                        <span class="material-symbols-outlined">event</span>
                        {{ job.application_deadline }}
                      </span>
                      <span v-if="job.category" class="job-card__meta-item">
                        <span class="material-symbols-outlined">category</span>
                        {{ job.category.name }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div
              v-if="store.jobs.length === 0"
              class="search-empty glass-panel"
            >
              <span class="material-symbols-outlined">search_off</span>
              <h3>No matching roles</h3>
              <p>Try adjusting your filters or search term.</p>
              <button
                v-if="store.hasActiveFilters"
                type="button"
                class="reset-btn"
                @click="store.resetFilters()"
              >
                Clear filters
              </button>
            </div>

            <!-- Pagination -->
            <div
              v-if="store.meta.last_page > 1"
              class="search-pagination"
              aria-label="Pagination"
            >
              <button
                class="page-btn"
                :disabled="store.meta.current_page === 1"
                @click="goToPage(store.meta.current_page - 1)"
                aria-label="Previous page"
              >
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <span class="page-indicator">
                {{ store.meta.current_page }} / {{ store.meta.last_page }}
              </span>
              <button
                class="page-btn"
                :disabled="store.meta.current_page === store.meta.last_page"
                @click="goToPage(store.meta.current_page + 1)"
                aria-label="Next page"
              >
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppLayout from "@/layouts/AppLayout.vue";
import FilterSidebar from "@/components/search/FilterSidebar.vue";
import ActiveFilters from "@/components/search/ActiveFilters.vue";
import { useJobSearch } from "@/composables/useJobSearch";

const router = useRouter();
const sidebarOpen = ref(true);
const { store, goToPage } = useJobSearch();
</script>

<style scoped>
.search-page {
  display: grid;
  gap: 1.25rem;
}

/* ── Header ──────────────────────────────────────────────────────────── */
.search-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-kicker {
  margin: 0 0 0.3rem;
  color: var(--primary-dim);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.search-header h1 {
  margin: 0;
  font-family: var(--font-display), serif;
  font-size: clamp(1.6rem, 2.8vw, 2.2rem);
  color: var(--on-surface);
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-radius: 1rem;
}

.stat-chip .material-symbols-outlined {
  font-size: 1.5rem;
  color: var(--primary-dim);
}

.stat-chip__value {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--on-surface);
  font-family: var(--font-display), serif;
}

.stat-chip__label {
  margin: 0;
  font-size: 0.72rem;
  color: var(--on-surface-variant);
}

/* ── Search bar ──────────────────────────────────────────────────────── */
.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 183, 125, 0.15);
}

.search-bar {
  border-radius: 9999px;
  padding: 0.4rem;
}

.search-bar__inner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-bar__field {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
}

.search-bar__field .material-symbols-outlined {
  color: var(--on-surface-variant);
  font-size: 1.2rem;
  flex-shrink: 0;
}

.search-bar__field input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--on-surface);
  outline: none;
  font: inherit;
  font-size: 0.95rem;
}

.search-bar__field input::placeholder {
  color: rgba(221, 193, 174, 0.45);
}

.search-bar__sort {
  flex-shrink: 0;
  padding: 0 1rem;
  border-left: 1px solid rgba(255, 183, 125, 0.12);
}

.search-bar__sort select {
  background: transparent;
  border: none;
  color: var(--on-surface-variant);
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;
  padding: 0.5rem 0;
}

.search-bar__sort select option {
  background: #1a1a1c;
  color: var(--on-surface);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ── Body layout ─────────────────────────────────────────────────────── */
.search-body {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: auto 1fr;
  gap: 1.25rem;
  align-items: start;
}

.sidebar-toggle {
  display: none;
}

.search-body__sidebar {
  position: sticky;
  top: 1rem;
}

.search-body__results {
  min-width: 0;
  display: grid;
  gap: 1.25rem;
}

/* ── Loading skeleton ────────────────────────────────────────────────── */
.search-loading {
  display: grid;
  gap: 0.75rem;
}

.skeleton-card {
  height: 100px;
  border-radius: 1.25rem;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.2;
  }
}

/* ── Job card ────────────────────────────────────────────────────────── */
.job-list {
  display: grid;
  gap: 0.85rem;
}

.job-card {
  display: flex;
  gap: 1.25rem;
  padding: 1.35rem;
  border-radius: 1.25rem;
  align-items: flex-start;
  transition:
    border-color 0.25s ease,
    transform 0.2s ease,
    box-shadow 0.25s ease;
}

.job-card:hover {
  border-color: rgba(255, 183, 125, 0.3);
  transform: translateY(-2px);
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(255, 183, 125, 0.08);
}

.job-card__logo {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  border-radius: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  display: grid;
  place-items: center;
  font-family: var(--font-display), serif;
  font-size: 1.3rem;
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
  gap: 0.6rem;
}

.job-card__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.job-card__title {
  margin: 0;
  font-family: var(--font-display), serif;
  font-size: 1.05rem;
  color: var(--on-surface);
}

.job-card__company {
  margin: 0.15rem 0 0;
  font-size: 0.85rem;
  color: var(--on-surface-variant);
}

.job-card__badges {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.badge {
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: capitalize;
}

.badge--work {
  background: rgba(100, 200, 255, 0.1);
  color: rgba(140, 210, 255, 0.9);
  border: 1px solid rgba(100, 200, 255, 0.2);
}

.badge--exp {
  background: rgba(255, 183, 125, 0.1);
  color: var(--primary-dim);
  border: 1px solid rgba(255, 183, 125, 0.2);
}

.job-card__footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.job-card__meta-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.job-card__meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.78rem;
  color: var(--on-surface-variant);
}

.job-card__meta-item .material-symbols-outlined {
  font-size: 0.9rem;
}

/* ── Empty state ─────────────────────────────────────────────────────── */
.search-empty {
  display: grid;
  place-items: center;
  gap: 0.5rem;
  padding: 3rem 2rem;
  border-radius: 1.25rem;
  text-align: center;
}

.search-empty .material-symbols-outlined {
  font-size: 3rem;
  color: var(--on-surface-variant);
  opacity: 0.5;
}

.search-empty h3 {
  margin: 0;
  color: var(--on-surface);
}

.search-empty p {
  margin: 0;
  color: var(--on-surface-variant);
  font-size: 0.9rem;
}

.reset-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 183, 125, 0.3);
  background: rgba(255, 183, 125, 0.08);
  color: var(--primary-dim);
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.reset-btn:hover {
  background: rgba(255, 183, 125, 0.18);
}

/* ── Pagination ──────────────────────────────────────────────────────── */
.search-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
}

.page-btn {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 183, 125, 0.2);
  background: rgba(255, 183, 125, 0.06);
  color: var(--primary-dim);
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    opacity 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: rgba(255, 183, 125, 0.15);
  border-color: rgba(255, 183, 125, 0.4);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.page-indicator {
  font-size: 0.9rem;
  color: var(--on-surface-variant);
  min-width: 4rem;
  text-align: center;
}

/* ── Mobile ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .search-body {
    grid-template-columns: 1fr;
  }

  .sidebar-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 1rem;
    border-radius: 9999px;
    border: 1px solid rgba(255, 183, 125, 0.2);
    background: rgba(255, 183, 125, 0.06);
    color: var(--on-surface);
    font: inherit;
    font-size: 0.88rem;
    cursor: pointer;
    width: fit-content;
  }

  .sidebar-toggle .material-symbols-outlined {
    font-size: 1.1rem;
  }

  .filter-badge {
    background: var(--primary-dim);
    color: #1a1a1c;
    font-size: 0.72rem;
    font-weight: 700;
    border-radius: 9999px;
    padding: 0 0.45rem;
    line-height: 1.5;
  }

  .search-body__sidebar {
    display: none;
  }

  .search-body__sidebar--open {
    display: block;
  }
}
</style>
