<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'primary', size: 'md', disabled: false, type: 'button' },
)
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: var(--radius-full);
  font-family: var(--font-body),serif;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform 0.15s, filter 0.2s, background 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}
.btn:active:not(:disabled) {
  transform: scale(0.97);
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn--sm { padding: 0.4rem 1rem; font-size: 0.8rem; }
.btn--md { padding: 0.6rem 1.25rem; font-size: 0.9rem; }
.btn--lg { padding: 0.75rem 1.5rem; font-size: 1rem; }

.btn--primary {
  background: var(--primary);
  color: var(--on-primary);
  box-shadow: 0 4px 14px rgba(255, 220, 195, 0.25);
}
.btn--primary:hover:not(:disabled) {
  filter: brightness(1.08);
  box-shadow: 0 4px 20px rgba(255, 220, 195, 0.35);
}

.btn--secondary {
  background: rgba(72, 63, 119, 0.6);
  color: var(--secondary);
  border: 1px solid rgba(201, 190, 255, 0.25);
}
.btn--secondary:hover:not(:disabled) {
  background: rgba(72, 63, 119, 0.85);
}

.btn--danger {
  background: rgba(147, 0, 10, 0.5);
  color: var(--error);
  border: 1px solid rgba(255, 180, 171, 0.3);
}
.btn--danger:hover:not(:disabled) {
  background: rgba(147, 0, 10, 0.75);
}

.btn--ghost {
  background: transparent;
  color: var(--on-surface-variant);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn--ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--on-surface);
  border-color: rgba(255, 183, 125, 0.25);
}
</style>
