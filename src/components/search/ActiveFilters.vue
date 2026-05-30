<template>
  <div v-if="chips.length > 0" class="active-filters" role="list">
    <span class="active-filters__label">Active:</span>
    <button
      v-for="chip in chips"
      :key="chip.key"
      type="button"
      class="filter-chip"
      :aria-label="`Remove ${chip.label} filter`"
      @click="chip.remove()"
    >
      {{ chip.label }}
      <span class="material-symbols-outlined filter-chip__x">close</span>
    </button>
    <button
      v-if="chips.length > 1"
      type="button"
      class="filter-chip filter-chip--clear-all"
      @click="store.resetFilters()"
    >
      Clear all
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSearchStore } from "@/stores/search";

const store = useSearchStore();

interface Chip {
  key: string;
  label: string;
  remove: () => void;
}

const WORK_TYPE_LABELS: Record<string, string> = {
  remote: "Remote",
  onsite: "On-site",
  hybrid: "Hybrid",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  entry: "Entry",
  mid: "Mid",
  senior: "Senior",
  lead: "Lead",
};

const chips = computed<Chip[]>(() => {
  const result: Chip[] = [];

  if (store.query.trim()) {
    result.push({
      key: "q",
      label: `"${store.query.trim()}"`,
      remove: () => (store.query = ""),
    });
  }
  if (store.filters.location) {
    result.push({
      key: "location",
      label: `📍 ${store.filters.location}`,
      remove: () => (store.filters.location = ""),
    });
  }
  if (store.filters.work_type) {
    result.push({
      key: "work_type",
      label:
        WORK_TYPE_LABELS[store.filters.work_type] ?? store.filters.work_type,
      remove: () => (store.filters.work_type = ""),
    });
  }
  if (store.filters.experience_level) {
    result.push({
      key: "experience_level",
      label:
        EXPERIENCE_LABELS[store.filters.experience_level] ??
        store.filters.experience_level,
      remove: () => (store.filters.experience_level = ""),
    });
  }
  if (store.filters.category) {
    const cat = store.categories.find((c) => c.slug === store.filters.category);
    result.push({
      key: "category",
      label: cat?.name ?? store.filters.category,
      remove: () => (store.filters.category = ""),
    });
  }
  if (store.filters.date_from) {
    result.push({
      key: "date_from",
      label: `After ${store.filters.date_from}`,
      remove: () => (store.filters.date_from = ""),
    });
  }

  return result;
});
</script>

<style scoped>
.active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.active-filters__label {
  font-size: 0.78rem;
  color: var(--on-surface-variant);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.7rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 183, 125, 0.25);
  background: rgba(255, 183, 125, 0.08);
  color: var(--primary-dim);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.filter-chip:hover {
  background: rgba(255, 183, 125, 0.18);
  border-color: rgba(255, 183, 125, 0.45);
}

.filter-chip__x {
  font-size: 0.85rem;
  opacity: 0.7;
}

.filter-chip--clear-all {
  border-color: rgba(255, 100, 100, 0.25);
  background: rgba(255, 100, 100, 0.07);
  color: rgba(255, 150, 150, 0.9);
}

.filter-chip--clear-all:hover {
  background: rgba(255, 100, 100, 0.15);
  border-color: rgba(255, 100, 100, 0.5);
}
</style>
