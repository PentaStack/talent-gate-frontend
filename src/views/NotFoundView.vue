<template>
  <div class="not-found-page">
    <div class="not-found-page__ambient not-found-page__ambient--primary"></div>
    <div class="not-found-page__ambient not-found-page__ambient--secondary"></div>

    <main class="not-found-shell">
      <section class="not-found-card glass-panel glass-panel--glow">
        <div class="not-found-icon">
          <span class="material-symbols-outlined">explore_off</span>
        </div>
        
        <div class="not-found-copy">
          <p class="not-found-kicker">404 Error</p>
          <h1>Page Not Found</h1>
          <p class="not-found-summary">
            The technical resource you're looking for doesn't exist, has been moved, or you don't have access.
          </p>
        </div>

        <div class="not-found-actions">
          <RouterLink to="/" class="not-found-primary-button">
            Return to Safety
          </RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<style scoped>
.not-found-page {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    radial-gradient(
      circle at top left,
      rgba(255, 183, 125, 0.12),
      transparent 28%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(201, 190, 255, 0.08),
      transparent 26%
    ),
    var(--bg-ink);
  color: var(--on-surface);
}

.not-found-page__ambient {
  position: absolute;
  width: 40rem;
  height: 40rem;
  border-radius: 9999px;
  filter: blur(140px);
  pointer-events: none;
}

.not-found-page__ambient--primary {
  top: -15rem;
  left: -15rem;
  background: rgba(255, 183, 125, 0.08);
}

.not-found-page__ambient--secondary {
  bottom: -15rem;
  right: -15rem;
  background: rgba(201, 190, 255, 0.08);
}

.not-found-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 32rem;
  padding: 1.5rem;
}

.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 220, 195, 0.15);
  border-radius: 1.5rem;
}

.glass-panel--glow {
  box-shadow: 0 0 40px rgba(255, 183, 125, 0.08);
}

.not-found-card {
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
}

.not-found-icon {
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  background: rgba(255, 183, 125, 0.1);
  display: grid;
  place-items: center;
  color: var(--primary-fixed-dim);
}

.not-found-icon span {
  font-size: 2.5rem;
}

.not-found-kicker {
  color: var(--primary-fixed-dim);
  text-transform: uppercase;
  letter-spacing: 0.24em;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.not-found-copy h1 {
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: var(--bone-white);
  line-height: 1.1;
  margin-bottom: 0.75rem;
}

.not-found-summary {
  color: var(--on-surface-variant);
  line-height: 1.6;
  font-size: 1rem;
}

.not-found-actions {
  margin-top: 1rem;
}

.not-found-primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.35rem;
  padding: 0 2rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, var(--primary-fixed), #ffd0a7);
  color: var(--on-primary);
  font-weight: 700;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.not-found-primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(255, 183, 125, 0.2);
}
</style>
