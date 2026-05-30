<template>
  <div class="filter-section">
    <button type="button" class="filter-section__toggle" @click="toggle">
      <span class="filter-section__icon material-symbols-outlined">{{
        icon
      }}</span>
      <span class="filter-section__title">{{ title }}</span>
      <span class="filter-section__chevron material-symbols-outlined">
        {{ open ? "expand_less" : "expand_more" }}
      </span>
    </button>
    <div v-if="open" class="filter-section__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  icon: string;
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

function toggle() {
  emit("update:open", !open);
}
</script>

<style scoped>
.filter-section {
  border-top: 1px solid rgba(255, 183, 125, 0.07);
}

.filter-section__toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  background: transparent;
  border: none;
  padding: 0.7rem 0.25rem;
  color: var(--on-surface);
  cursor: pointer;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 500;
  text-align: left;
  transition: color 0.2s;
}

.filter-section__toggle:hover {
  color: var(--primary-dim);
}

.filter-section__icon {
  font-size: 1rem;
  color: var(--on-surface-variant);
}

.filter-section__title {
  flex: 1;
}

.filter-section__chevron {
  font-size: 1.1rem;
  color: var(--on-surface-variant);
}

.filter-section__body {
  display: grid;
  gap: 0.25rem;
  padding: 0.25rem 0 0.75rem 0.25rem;
}
</style>
