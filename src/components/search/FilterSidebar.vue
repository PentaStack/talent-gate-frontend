<template>
  <aside class="filter-sidebar glass-panel">
    <div class="filter-sidebar__header">
      <h2 class="filter-sidebar__title">Filters</h2>
      <button
        v-if="store.activeFilterCount > 0"
        type="button"
        class="clear-btn"
        @click="store.resetFilters()"
      >
        Clear all
      </button>
    </div>

    <!-- Location ─────────────────────────────────────────── -->
    <FilterSection
      title="Location"
      icon="location_on"
      v-model:open="sections.location"
    >
      <input
        v-model="store.filters.location"
        type="text"
        placeholder="e.g. Cairo, Remote…"
        class="filter-input"
        list="loc-suggestions"
        autocomplete="off"
      />
      <datalist id="loc-suggestions">
        <option
          v-for="loc in store.locations"
          :key="loc.id"
          :value="loc.name"
        />
      </datalist>
    </FilterSection>

    <!-- Work Type ────────────────────────────────────────── -->
    <FilterSection
      title="Work Type"
      icon="work"
      v-model:open="sections.workType"
    >
      <label v-for="opt in WORK_TYPES" :key="opt.value" class="filter-radio">
        <input
          type="radio"
          name="work_type"
          :value="opt.value"
          v-model="store.filters.work_type"
        />
        <span>{{ opt.label }}</span>
      </label>
      <label class="filter-radio">
        <input
          type="radio"
          name="work_type"
          value=""
          v-model="store.filters.work_type"
        />
        <span>Any</span>
      </label>
    </FilterSection>

    <!-- Experience Level ─────────────────────────────────── -->
    <FilterSection
      title="Experience Level"
      icon="school"
      v-model:open="sections.experience"
    >
      <label
        v-for="opt in EXPERIENCE_LEVELS"
        :key="opt.value"
        class="filter-radio"
      >
        <input
          type="radio"
          name="experience_level"
          :value="opt.value"
          v-model="store.filters.experience_level"
        />
        <span>{{ opt.label }}</span>
      </label>
      <label class="filter-radio">
        <input
          type="radio"
          name="experience_level"
          value=""
          v-model="store.filters.experience_level"
        />
        <span>Any</span>
      </label>
    </FilterSection>

    <!-- Category ─────────────────────────────────────────── -->
    <FilterSection
      title="Category"
      icon="category"
      v-model:open="sections.category"
    >
      <label class="filter-radio">
        <input
          type="radio"
          name="category"
          value=""
          v-model="store.filters.category"
        />
        <span>All Categories</span>
      </label>
      <label v-for="cat in store.categories" :key="cat.id" class="filter-radio">
        <input
          type="radio"
          name="category"
          :value="cat.slug"
          v-model="store.filters.category"
        />
        <span>{{ cat.name }}</span>
      </label>
    </FilterSection>

    <!-- Date Posted ──────────────────────────────────────── -->
    <FilterSection
      title="Date Posted"
      icon="calendar_today"
      v-model:open="sections.date"
    >
      <div class="date-presets">
        <button
          v-for="preset in DATE_PRESETS"
          :key="preset.label"
          type="button"
          class="date-preset-btn"
          :class="{ active: store.filters.date_from === preset.value }"
          @click="store.filters.date_from = preset.value"
        >
          {{ preset.label }}
        </button>
        <button
          v-if="store.filters.date_from"
          type="button"
          class="date-preset-btn date-preset-btn--clear"
          @click="store.filters.date_from = ''"
        >
          Clear
        </button>
      </div>
      <input
        type="date"
        class="filter-input filter-input--date"
        v-model="store.filters.date_from"
        :max="today"
      />
    </FilterSection>
  </aside>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useSearchStore } from "@/stores/search";
import FilterSection from "./FilterSection.vue";

const store = useSearchStore();

const sections = reactive({
  location: true,
  workType: true,
  experience: true,
  category: false,
  date: false,
});

const today = new Date().toISOString().slice(0, 10);

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

const DATE_PRESETS = [
  { label: "Today", value: today },
  { label: "Last 7 days", value: daysAgo(7) },
  { label: "Last 30 days", value: daysAgo(30) },
];

const WORK_TYPES = [
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
];

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];
</script>

<style scoped>
.filter-sidebar {
  border-radius: 1.25rem;
  padding: 1.25rem;
  display: grid;
  gap: 0.25rem;
}

.filter-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 183, 125, 0.1);
  margin-bottom: 0.5rem;
}

.filter-sidebar__title {
  margin: 0;
  font-size: 1rem;
  font-family: var(--font-display), serif;
  color: var(--on-surface);
}

.clear-btn {
  background: transparent;
  border: none;
  color: var(--primary-dim);
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: rgba(255, 183, 125, 0.1);
}

.filter-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 183, 125, 0.15);
  border-radius: 0.6rem;
  padding: 0.55rem 0.75rem;
  color: var(--on-surface);
  font: inherit;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.filter-input:focus {
  border-color: rgba(255, 183, 125, 0.4);
}

.filter-input--date {
  color-scheme: dark;
}

.filter-radio {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.88rem;
  color: var(--on-surface-variant);
  cursor: pointer;
  padding: 0.3rem 0;
  transition: color 0.2s;
}

.filter-radio:hover {
  color: var(--on-surface);
}

.filter-radio input[type="radio"] {
  accent-color: var(--primary-dim);
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.date-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.date-preset-btn {
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 183, 125, 0.2);
  background: transparent;
  color: var(--on-surface-variant);
  font: inherit;
  font-size: 0.78rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
}

.date-preset-btn:hover,
.date-preset-btn.active {
  background: rgba(255, 183, 125, 0.12);
  color: var(--primary-dim);
  border-color: rgba(255, 183, 125, 0.35);
}

.date-preset-btn--clear {
  border-color: rgba(255, 100, 100, 0.25);
  color: rgba(255, 120, 120, 0.7);
}

.date-preset-btn--clear:hover {
  background: rgba(255, 100, 100, 0.1);
  border-color: rgba(255, 100, 100, 0.5);
  color: rgb(255, 140, 140);
}
</style>
