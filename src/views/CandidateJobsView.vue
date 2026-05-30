<template>
  <AppLayout>
    <div class="jobs-page">
      <!-- ── Page header ───────────────────────────────────────── -->
      <div class="jobs-header">
        <div>
          <p class="jobs-kicker">Explore Opportunities</p>
          <h1>Job Search</h1>
        </div>
        <div class="jobs-header__right">
          <p class="jobs-count">
            Showing
            <strong>{{ store.meta.total }}</strong> result{{
              store.meta.total !== 1 ? "s" : ""
            }}
            <template v-if="store.query.trim()">
              for <em>"{{ store.query.trim() }}"</em>
            </template>
          </p>
          <div class="jobs-sort">
            <span class="sort-label">Sort by:</span>
            <select v-model="store.sort" aria-label="Sort results">
              <option value="newest">Newest</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
        </div>
      </div>

      <!-- ── Active filter chips ───────────────────────────────── -->
      <ActiveFilters />

      <!-- ── Body: sidebar + results ──────────────────────────── -->
      <div class="jobs-body">
        <!-- ── Sidebar rail (desktop collapsible) ─────────────── -->
        <div
          class="sidebar-rail"
          :class="{
            'sidebar-rail--closed': !sidebarOpen,
            'sidebar-rail--mobile-open': sidebarOpen,
          }"
        >
          <aside class="jobs-sidebar" aria-label="Filter sidebar">
            <FilterSidebar @close="sidebarOpen = false" />
          </aside>
        </div>

        <!-- ── Mobile toggle (shown only on mobile) ─────────────── -->
        <button
          type="button"
          class="sidebar-toggle glass-panel"
          :class="{ 'sidebar-toggle--open': sidebarOpen }"
          @click="sidebarOpen = !sidebarOpen"
          :aria-expanded="sidebarOpen"
        >
          <span class="material-symbols-outlined">tune</span>
          Filters
          <span
            v-if="store.activeFilterCount > 0 || store.query"
            class="filter-badge"
            >{{ store.activeFilterCount + (store.query ? 1 : 0) }}</span
          >
        </button>

        <!-- Results -->
        <section class="jobs-results" aria-label="Job listings">
          <!-- Desktop: show-filters button when sidebar is closed -->
          <button
            type="button"
            class="show-filters-btn"
            :class="{ 'show-filters-btn--visible': !sidebarOpen }"
            @click="sidebarOpen = true"
            aria-label="Show filters"
            title="Expand sidebar"
          >
            <span class="material-symbols-outlined">tune</span>
            <span>Filters</span>
            <span
              v-if="store.activeFilterCount > 0 || store.query"
              class="filter-badge"
              >{{ store.activeFilterCount + (store.query ? 1 : 0) }}</span
            >
          </button>
          <!-- Loading skeleton -->
          <div v-if="store.isLoading" class="jobs-skeletons">
            <div v-for="n in 5" :key="n" class="skeleton-card glass-panel" />
          </div>

          <template v-else>
            <!-- Job cards -->
            <div v-if="store.jobs.length > 0" class="job-list">
              <div
                v-for="job in store.jobs"
                :key="job.id"
                class="job-card glass-panel"
              >
                <!-- Top row: logo + info + bookmark placeholder -->
                <div class="job-card__top">
                  <div
                    class="job-card__logo"
                    @click="goToDetail(job.id)"
                    style="cursor: pointer"
                  >
                    <img
                      v-if="job.employer.logo_url"
                      :src="job.employer.logo_url"
                      :alt="job.employer.company_name"
                      class="job-card__logo-img"
                    />
                    <span v-else class="job-card__logo-initial">{{
                      job.employer.company_name.charAt(0)
                    }}</span>
                  </div>

                  <div
                    class="job-card__info"
                    @click="goToDetail(job.id)"
                    style="cursor: pointer"
                  >
                    <h3 class="job-card__title">{{ job.title }}</h3>
                    <div class="job-card__meta-row">
                      <span class="job-card__company">{{
                        job.employer.company_name
                      }}</span>
                      <span v-if="job.location" class="job-card__meta-item">
                        <span class="material-symbols-outlined"
                          >location_on</span
                        >
                        {{ job.location }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Badges row -->
                <div class="job-card__badges">
                  <span
                    v-if="job.work_type"
                    class="badge badge--work"
                    :class="`badge--${job.work_type}`"
                  >
                    {{ job.work_type }}
                  </span>
                  <span v-if="job.experience_level" class="badge badge--exp">
                    {{ job.experience_level }}
                  </span>
                  <span v-if="job.salary_range" class="badge badge--salary">
                    <span class="material-symbols-outlined">payments</span>
                    {{ job.salary_range }}
                  </span>
                </div>

                <!-- Description snippet -->
                <p
                  v-if="job.description"
                  class="job-card__desc"
                  @click="goToDetail(job.id)"
                  style="cursor: pointer"
                >
                  {{ job.description }}
                </p>

                <!-- Bottom row: tags + action -->
                <div class="job-card__footer">
                  <div class="job-card__tags">
                    <span v-if="job.category" class="tag">{{
                      job.category.name
                    }}</span>
                    <span
                      v-if="job.application_deadline"
                      class="tag tag--deadline"
                    >
                      <span class="material-symbols-outlined">event</span>
                      {{ job.application_deadline }}
                    </span>
                  </div>
                  <div class="job-card__action">
                    <button
                      v-if="!applicationsStore.appliedJobIds.has(job.id)"
                      type="button"
                      class="apply-btn"
                      @click.stop="openApply(job)"
                    >
                      Apply Now
                    </button>
                    <span v-else class="applied-label">Applied ✓</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="jobs-empty glass-panel">
              <span class="material-symbols-outlined">search_off</span>
              <h3>No matching roles found</h3>
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
            <nav
              v-if="store.meta.last_page > 1"
              class="jobs-pagination"
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

              <template v-for="item in visiblePages" :key="item">
                <span v-if="item === '...'" class="page-ellipsis">…</span>
                <button
                  v-else
                  class="page-btn page-btn--num"
                  :class="{
                    'page-btn--active': item === store.meta.current_page,
                  }"
                  @click="goToPage(item as number)"
                  :aria-current="
                    item === store.meta.current_page ? 'page' : undefined
                  "
                >
                  {{ item }}
                </button>
              </template>

              <button
                class="page-btn"
                :disabled="store.meta.current_page === store.meta.last_page"
                @click="goToPage(store.meta.current_page + 1)"
                aria-label="Next page"
              >
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </nav>
          </template>
        </section>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import AppLayout from "@/layouts/AppLayout.vue";
import FilterSidebar from "@/components/search/FilterSidebar.vue";
import ActiveFilters from "@/components/search/ActiveFilters.vue";
import { useJobSearch } from "@/composables/useJobSearch";
import { useApplicationsStore } from "@/stores/applications";
import type { JobListing } from "@/api/jobs";

const router = useRouter();
const applicationsStore = useApplicationsStore();
const sidebarOpen = ref(true);
const { store, goToPage } = useJobSearch();

function goToDetail(jobId: number) {
  router.push({ name: "job-detail", params: { jobId } });
}

function openApply(job: JobListing) {
  router.push({
    path: `/jobs/${job.id}/apply`,
    state: { jobTitle: job.title, jobCompany: job.employer.company_name },
  });
}

/** Build a smart page list: 1 2 3 ... 12  or  1 ... 4 5 6 ... 12 */
const visiblePages = computed<(number | "...")[]>(() => {
  const total = store.meta.last_page;
  const cur = store.meta.current_page;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  const add = (n: number | "...") => pages.push(n);
  add(1);
  if (cur > 3) add("...");
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) {
    add(p);
  }
  if (cur < total - 2) add("...");
  add(total);
  return pages;
});
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────── */
.jobs-page {
  display: grid;
  gap: 1.25rem;
}

.jobs-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 183, 125, 0.12);
}

.jobs-kicker {
  margin: 0 0 0.3rem;
  color: var(--primary-dim);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.jobs-header h1 {
  margin: 0;
  font-family: var(--font-display), serif;
  font-size: clamp(1.6rem, 2.8vw, 2.2rem);
  color: var(--on-surface);
}

.jobs-header__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.jobs-count {
  margin: 0;
  font-size: 0.88rem;
  color: var(--on-surface-variant);
}

.jobs-count strong {
  color: var(--primary-dim);
  font-weight: 700;
}

.jobs-count em {
  color: var(--on-surface);
  font-style: italic;
}

.jobs-sort {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-label {
  font-size: 0.78rem;
  color: var(--on-surface-variant);
}

.jobs-sort select {
  background: rgba(26, 26, 28, 0.8);
  border: 1px solid rgba(255, 183, 125, 0.18);
  border-radius: 9999px;
  color: var(--on-surface);
  font: inherit;
  font-size: 0.82rem;
  padding: 0.3rem 0.8rem;
  cursor: pointer;
  outline: none;
}

.jobs-sort select option {
  background: #1a1a1c;
}

/* ── Body two-column ────────────────────────────────────── */
.jobs-body {
  display: flex;
  align-items: start;
  gap: 1.5rem;
}

/* ── Sidebar rail: collapsible wrapper ──────────────────── */
.sidebar-rail {
  flex-shrink: 0;
  width: 272px;
  overflow: hidden;
  transition: width 0.35s ease;
  position: sticky;
  top: 5.5rem;
}

.sidebar-rail--closed {
  width: 0;
}

/* ── Show-filters button (desktop, results side) ─────────── */
.show-filters-btn {
  display: none;
  align-items: center;
  gap: 0.45rem;
  background: rgba(26, 26, 28, 0.6);
  border: 1px solid rgba(255, 183, 125, 0.18);
  border-radius: 9999px;
  color: var(--on-surface-variant);
  font: inherit;
  font-size: 0.82rem;
  padding: 0.4rem 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition:
    border-color 0.2s,
    color 0.2s;
}

.show-filters-btn:hover {
  border-color: rgba(255, 183, 125, 0.4);
  color: var(--primary-dim);
}

.show-filters-btn--visible {
  display: flex;
}

/* Mobile sidebar toggle — hidden on desktop */
.sidebar-toggle {
  display: none;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.1rem;
  border: none;
  border-radius: 9999px;
  color: var(--on-surface-variant);
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  width: fit-content;
}

.sidebar-toggle .material-symbols-outlined {
  font-size: 1.1rem;
  color: var(--primary-dim);
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: var(--primary-dim);
  color: #2f1500;
  font-size: 0.72rem;
  font-weight: 700;
}

/* .jobs-sidebar — no sticky here; the .sidebar-rail wrapper is sticky */

.jobs-results {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 1rem;
  align-content: start;
}

/* ── Skeleton loading ───────────────────────────────────── */
.jobs-skeletons {
  display: grid;
  gap: 1rem;
}

.skeleton-card {
  height: 160px;
  border-radius: 1.25rem;
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.7;
  }
}

/* ── Job cards ──────────────────────────────────────────── */
.job-list {
  display: grid;
  gap: 1rem;
}

.job-card {
  padding: 1.5rem;
  border-radius: 1.25rem;
  display: grid;
  gap: 0.85rem;
  transition:
    border-color 0.25s,
    box-shadow 0.25s,
    transform 0.2s;
  position: relative;
  overflow: hidden;
}

.job-card::before {
  content: "";
  position: absolute;
  top: -2rem;
  right: -2rem;
  width: 7rem;
  height: 7rem;
  background: rgba(255, 183, 125, 0.04);
  border-radius: 9999px;
  pointer-events: none;
  transition: background 0.25s;
}

.job-card:hover {
  border-color: rgba(255, 183, 125, 0.3);
  box-shadow: 0 0 20px rgba(255, 183, 125, 0.1);
  transform: translateY(-2px);
}

.job-card:hover::before {
  background: rgba(255, 183, 125, 0.1);
}

.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 183, 125, 0.15);
}

/* Card top row */
.job-card__top {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.job-card__logo {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  display: grid;
  place-items: center;
  overflow: hidden;
}

.job-card__logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
}

.job-card__logo-initial {
  font-family: var(--font-display), serif;
  font-size: 1.2rem;
  color: var(--on-surface);
}

.job-card__info {
  flex: 1;
  min-width: 0;
}

.job-card__title {
  margin: 0 0 0.25rem;
  font-family: var(--font-display), serif;
  font-size: 1.05rem;
  color: var(--on-surface);
  transition: color 0.2s;
}

.job-card:hover .job-card__title {
  color: var(--primary-dim);
}

.job-card__meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
}

.job-card__company {
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--on-surface-variant);
}

.job-card__meta-item {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.8rem;
  color: var(--on-surface-variant);
}

.job-card__meta-item .material-symbols-outlined {
  font-size: 0.95rem;
}

/* Badges */
.job-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid;
}

.badge--remote {
  background: rgba(134, 239, 172, 0.08);
  border-color: rgba(134, 239, 172, 0.25);
  color: #86efac;
}

.badge--onsite {
  background: rgba(147, 197, 253, 0.08);
  border-color: rgba(147, 197, 253, 0.25);
  color: #93c5fd;
}

.badge--hybrid {
  background: rgba(196, 181, 253, 0.08);
  border-color: rgba(196, 181, 253, 0.25);
  color: #c4b5fd;
}

.badge--work {
  text-transform: capitalize;
}

.badge--exp {
  background: rgba(255, 183, 125, 0.08);
  border-color: rgba(255, 183, 125, 0.2);
  color: var(--primary-dim);
  text-transform: capitalize;
}

.badge--salary {
  background: transparent;
  border-color: rgba(255, 183, 125, 0.18);
  color: var(--on-surface-variant);
  font-family: monospace;
}

.badge--salary .material-symbols-outlined {
  font-size: 0.9rem;
}

/* Description */
.job-card__desc {
  margin: 0;
  font-size: 0.85rem;
  color: var(--on-surface-variant);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer */
.job-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(255, 183, 125, 0.08);
}

.job-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag {
  padding: 0.2rem 0.6rem;
  border-radius: 0.35rem;
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--on-surface-variant);
}

.tag--deadline {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.tag--deadline .material-symbols-outlined {
  font-size: 0.8rem;
}

.job-card__action {
  flex-shrink: 0;
}

.apply-btn {
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  border: none;
  background: var(--primary-dim);
  color: #2f1500;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(255, 183, 125, 0.2);
  transition:
    background 0.2s,
    box-shadow 0.2s,
    transform 0.15s;
}

.apply-btn:hover {
  background: #ffcca0;
  box-shadow: 0 0 18px rgba(255, 183, 125, 0.35);
  transform: translateY(-1px);
}

.applied-label {
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--on-surface-variant);
  font-size: 0.82rem;
  font-weight: 600;
  opacity: 0.6;
}

/* ── Empty state ────────────────────────────────────────── */
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

.reset-btn {
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 183, 125, 0.25);
  background: rgba(255, 183, 125, 0.08);
  color: var(--primary-dim);
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.reset-btn:hover {
  background: rgba(255, 183, 125, 0.16);
  border-color: rgba(255, 183, 125, 0.4);
}

/* ── Pagination ─────────────────────────────────────────── */
.jobs-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding-top: 0.5rem;
}

.page-btn {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 183, 125, 0.2);
  background: transparent;
  color: var(--on-surface-variant);
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: rgba(255, 183, 125, 0.45);
  color: var(--primary-dim);
  background: rgba(255, 183, 125, 0.06);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.page-btn--num {
  font-family: monospace;
}

.page-btn--active {
  background: rgba(255, 183, 125, 0.15);
  border-color: rgba(255, 183, 125, 0.5);
  color: var(--primary-dim);
  font-weight: 700;
}

.page-ellipsis {
  padding: 0 0.25rem;
  color: var(--on-surface-variant);
  user-select: none;
}

/* ── Responsive ─────────────────────────────────────────── */
@media (max-width: 768px) {
  .jobs-body {
    flex-direction: column;
  }

  /* hide the desktop rail by default on mobile */
  .sidebar-rail {
    display: none;
    width: auto !important;
    overflow: visible;
    position: static;
  }

  /* show when mobile toggle opens it */
  .sidebar-rail--mobile-open {
    display: block;
  }

  .show-filters-btn {
    display: none !important;
  }

  /* show the mobile toggle button */
  .sidebar-toggle {
    display: flex;
  }

  .jobs-header__right {
    align-items: flex-start;
  }

  .jobs-header {
    flex-direction: column;
  }
}
</style>
