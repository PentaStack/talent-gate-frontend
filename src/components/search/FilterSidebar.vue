<template>
  <aside class="filter-sidebar glass-panel">
    <!-- ── Header ─────────────────────────────────────────── -->
    <div class="sidebar-header">
      <h2 class="sidebar-title">
        <span class="material-symbols-outlined material-filled">tune</span>
        Advanced Filters
      </h2>
      <button
        type="button"
        class="sidebar-close-btn"
        @click="$emit('close')"
        aria-label="Collapse filters"
        title="Collapse sidebar"
      >
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
    </div>

    <!-- ── Keywords ──────────────────────────────────────── -->
    <div class="filter-group">
      <label class="filter-label">Keywords</label>
      <div class="icon-field">
        <span class="material-symbols-outlined icon-field__icon">search</span>
        <input
          v-model="store.query"
          type="text"
          placeholder="e.g. Vue, Laravel, React"
          class="icon-field__input"
          autocomplete="off"
        />
      </div>
    </div>

    <!-- ── Location ───────────────────────────────────────── -->
    <div class="filter-group">
      <label class="filter-label">Location</label>
      <div class="icon-field">
        <span class="material-symbols-outlined icon-field__icon"
          >location_on</span
        >
        <input
          v-model="store.filters.location"
          type="text"
          placeholder="City, State, or Remote"
          class="icon-field__input"
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
      </div>
    </div>

    <!-- ── Work Type (checkbox-style radios) ──────────────── -->
    <div class="filter-group">
      <label class="filter-label">Work Type</label>
      <div class="check-list">
        <label
          v-for="opt in WORK_TYPES"
          :key="opt.value"
          class="check-item"
          :class="{
            'check-item--active': store.filters.work_type === opt.value,
          }"
        >
          <input
            type="radio"
            :name="'work_type'"
            :value="opt.value"
            v-model="store.filters.work_type"
            class="check-input"
          />
          <span>{{ opt.label }}</span>
        </label>
        <label
          class="check-item"
          :class="{ 'check-item--active': !store.filters.work_type }"
        >
          <input
            type="radio"
            name="work_type"
            value=""
            v-model="store.filters.work_type"
            class="check-input"
          />
          <span>Any</span>
        </label>
      </div>
    </div>

    <!-- ── Experience Level (pill chips) ──────────────────── -->
    <div class="filter-group">
      <label class="filter-label">Experience Level</label>
      <div class="pill-list">
        <button
          v-for="opt in EXPERIENCE_LEVELS"
          :key="opt.value"
          type="button"
          class="pill"
          :class="{
            'pill--active': store.filters.experience_level === opt.value,
          }"
          @click="
            store.filters.experience_level =
              store.filters.experience_level === opt.value ? '' : opt.value
          "
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- ── Date Posted (preset chips + date input) ─────────── -->
    <div class="filter-group">
      <label class="filter-label">Date Posted</label>
      <div class="pill-list">
        <button
          v-for="preset in DATE_PRESETS"
          :key="preset.label"
          type="button"
          class="pill"
          :class="{ 'pill--active': store.filters.date_from === preset.value }"
          @click="
            store.filters.date_from =
              store.filters.date_from === preset.value ? '' : preset.value
          "
        >
          {{ preset.label }}
        </button>
      </div>
      <input
        type="date"
        class="date-input"
        v-model="store.filters.date_from"
        :max="today"
        title="Pick a date"
      />
    </div>

    <!-- ── Category ───────────────────────────────────────── -->
    <div v-if="store.categories.length > 0" class="filter-group">
      <label class="filter-label">Category</label>
      <div class="pill-list pill-list--wrap">
        <button
          v-for="cat in store.categories"
          :key="cat.id"
          type="button"
          class="pill pill--mono"
          :class="{ 'pill--active': store.filters.category === cat.slug }"
          @click="
            store.filters.category =
              store.filters.category === cat.slug ? '' : cat.slug
          "
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- ── Reset button ───────────────────────────────────── -->
    <button type="button" class="reset-btn" @click="store.resetFilters()">
      Reset Filters
    </button>
  </aside>
</template>

<script setup lang="ts">
import { useSearchStore } from "@/stores/search";

defineEmits<{ close: [] }>();

const store = useSearchStore();

type WorkTypeValue = "" | "remote" | "hybrid" | "onsite";
type ExperienceValue = "" | "entry" | "mid" | "senior" | "lead";

const today = new Date().toISOString().slice(0, 10);

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

const DATE_PRESETS = [
  { label: "Today", value: today },
  { label: "Last 7d", value: daysAgo(7) },
  { label: "Last 30d", value: daysAgo(30) },
];

const WORK_TYPES: Array<{ value: WorkTypeValue; label: string }> = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

const EXPERIENCE_LEVELS: Array<{ value: ExperienceValue; label: string }> = [
  { value: "entry", label: "Entry" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead/Staff" },
];
</script>

<style scoped>
/* ── Shell ────────────────────────────────────────────────── */
.filter-sidebar {
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  max-height: calc(100vh - 6rem);
}

.filter-sidebar::-webkit-scrollbar {
  width: 4px;
}
.filter-sidebar::-webkit-scrollbar-track {
  background: transparent;
}
.filter-sidebar::-webkit-scrollbar-thumb {
  background: #2e2e32;
  border-radius: 4px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.1rem;
  font-family: var(--font-display), serif;
  color: var(--primary-dim);
  font-weight: 600;
}

.sidebar-title .material-symbols-outlined {
  font-size: 1.2rem;
}

.material-filled {
  font-variation-settings: "FILL" 1;
}

.sidebar-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  width: 1.75rem;
  height: 1.75rem;
  color: var(--on-surface-variant);
  cursor: pointer;
  opacity: 0.55;
  transition:
    opacity 0.2s,
    color 0.2s,
    background 0.2s;
  flex-shrink: 0;
}

.sidebar-close-btn:hover {
  opacity: 1;
  color: var(--primary-dim);
  background: rgba(255, 183, 125, 0.08);
}

.sidebar-close-btn .material-symbols-outlined {
  font-size: 1.3rem;
}

/* ── Groups ───────────────────────────────────────────────── */
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.filter-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--on-surface-variant);
}

/* ── Icon fields (keywords + location) ───────────────────── */
.icon-field {
  position: relative;
}

.icon-field__icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: var(--on-surface-variant);
  pointer-events: none;
}

.icon-field__input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 0.5rem 1rem 0.5rem 2.25rem;
  color: var(--on-surface);
  font: inherit;
  font-size: 0.875rem;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
}

.icon-field__input:focus {
  border-color: rgba(255, 220, 195, 0.5);
  box-shadow: 0 0 0 2px rgba(255, 220, 195, 0.12);
}

.icon-field__input::placeholder {
  color: rgba(221, 193, 174, 0.35);
}

/* ── Checkbox-style radio list ────────────────────────────── */
.check-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--on-surface-variant);
  transition: color 0.2s;
}

.check-item:hover {
  color: var(--on-surface);
}
.check-item--active {
  color: var(--on-surface);
}

.check-input {
  appearance: none;
  -webkit-appearance: none;
  width: 1rem;
  height: 1rem;
  border: 1.5px solid rgba(255, 183, 125, 0.3);
  border-radius: 3px;
  background: rgba(18, 18, 20, 0.8);
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.check-input:checked {
  background: var(--primary-dim);
  border-color: var(--primary-dim);
}

.check-input:checked::after {
  content: "";
  position: absolute;
  top: 1px;
  left: 4px;
  width: 4px;
  height: 7px;
  border: 2px solid #2f1500;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}

/* ── Pill chips ───────────────────────────────────────────── */
.pill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.pill {
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  border: 1px solid rgba(46, 46, 50, 0.8);
  background: rgba(18, 18, 20, 0.6);
  color: var(--on-surface-variant);
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s,
    background 0.2s;
}

.pill:hover {
  border-color: rgba(255, 183, 125, 0.4);
  color: var(--primary-dim);
}

.pill--active {
  background: rgba(255, 183, 125, 0.12);
  border-color: rgba(255, 183, 125, 0.35);
  color: var(--primary-dim);
}

.pill--mono {
  font-size: 0.72rem;
}

/* ── Date input ───────────────────────────────────────────── */
.date-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.5rem;
  padding: 0.4rem 0.7rem;
  color: var(--on-surface);
  font: inherit;
  font-size: 0.8rem;
  outline: none;
  color-scheme: dark;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.date-input:focus {
  border-color: rgba(255, 183, 125, 0.4);
}

/* ── Reset button ─────────────────────────────────────────── */
.reset-btn {
  width: 100%;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  padding: 0.55rem 1rem;
  color: var(--on-surface);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  margin-top: 0.25rem;
  transition: background 0.2s;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.13);
}
</style>
