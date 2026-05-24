<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const primaryCta = computed(() => {
  if (!auth.isAuthenticated) return { to: '/register', label: 'Find Your Next Role' }
  if (auth.hasRole('employer')) return { to: '/profile/edit', label: 'Manage Company Profile' }
  return { to: '/profile/edit', label: 'Complete Your Profile' }
})

const secondaryCta = computed(() => {
  if (!auth.isAuthenticated) return { to: '/login', label: 'Sign In' }
  if (auth.hasRole('employer')) return { to: '/payments/checkout', label: 'Post a Job' }
  return { to: { path: '/', hash: '#jobs' }, label: 'Browse Jobs' }
})
</script>

<template>
  <div class="landing-shell">
    <div class="ambient ambient--top"></div>
    <div class="ambient ambient--bottom"></div>

    <nav class="top-nav glass-panel">
      <div class="nav-brand">
        <RouterLink to="/" class="brand-mark">Talent-Gate</RouterLink>
        <div class="nav-links">
          <a href="#jobs">Jobs</a>
          <a href="#companies">Companies</a>
          <a href="#salaries">Salaries</a>
        </div>
      </div>
      <div class="nav-actions">
        <RouterLink v-if="!auth.isAuthenticated" to="/login" class="nav-ghost">Sign In</RouterLink>
        <RouterLink v-else to="/profile/edit" class="nav-ghost">Profile</RouterLink>
        <RouterLink v-if="!auth.isAuthenticated || auth.isEmployer" :to="auth.isEmployer ? '/payments/checkout' : '/register'" class="nav-primary">Post a Job</RouterLink>      </div>
    </nav>

    <main class="page-wrap">
      <section class="hero-section">
        <div class="hero-copy">
          <div class="eyebrow glass-panel">
            <span class="eyebrow-dot"></span>
            <span>Premium Network</span>
          </div>
          <h1>The Future of Technical Recruitment</h1>
          <p>
            Precision-matched opportunities for the world&apos;s elite engineers.
            Experience a deep-focus hiring platform designed for technical minds.
          </p>
          <div class="hero-actions">
            <RouterLink :to="primaryCta.to" class="cta-primary">{{ primaryCta.label }}</RouterLink>
            <RouterLink :to="secondaryCta.to" class="cta-secondary">{{ secondaryCta.label }}</RouterLink>
          </div>
        </div>

        <div class="hero-visual">
          <div class="hero-map"></div>
          <div class="floating-card floating-card--top glass-panel glow-amber">
            <div class="floating-card__row">
              <div class="floating-icon"><span class="material-symbols-outlined">terminal</span></div>
              <div>
                <p class="card-title">Senior Rust Dev</p>
                <p class="card-subtitle">Neural Systems</p>
              </div>
            </div>
            <div class="match-bar"><span></span></div>
            <p class="match-label">98% Match</p>
          </div>
          <div class="floating-card floating-card--bottom glass-panel">
            <div class="floating-card__row">
              <span class="material-symbols-outlined floating-globe">public</span>
              <div>
                <p class="card-title">Remote Setup</p>
                <p class="card-subtitle">Verified Location</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="search-section glass-panel" aria-label="Search jobs">
        <div class="search-field">
          <span class="material-symbols-outlined">search</span>
          <input type="text" placeholder="Keywords (e.g. Rust, Go, React)" />
        </div>
        <div class="search-field search-field--split">
          <span class="material-symbols-outlined">location_on</span>
          <input type="text" placeholder="Location or Remote" />
        </div>
        <button type="button" class="search-button">Search</button>
      </section>

      <section class="section-block">
        <div class="section-heading">
          <h2>Engineered for Focus</h2>
          <p>
            A specialized environment eliminating noise, surfacing only the most
            relevant technical opportunities.
          </p>
        </div>

        <div class="feature-grid" id="companies">
          <article class="feature-card glass-panel">
            <div class="feature-icon feature-icon--amber">
              <span class="material-symbols-outlined">memory</span>
            </div>
            <h3>AI-Driven Matching</h3>
            <p>
              Our models analyze technical stacks and experience signals to surface highly
              relevant role recommendations.
            </p>
          </article>

          <article class="feature-card glass-panel">
            <div class="feature-icon feature-icon--violet">
              <span class="material-symbols-outlined">verified_user</span>
            </div>
            <h3>Verified Profiles</h3>
            <p>
              Pre-verified technical capabilities instantly signal seniority to top-tier
              engineering teams.
            </p>
          </article>

          <article class="feature-card glass-panel">
            <div class="feature-icon feature-icon--cyan">
              <span class="material-symbols-outlined">dark_mode</span>
            </div>
            <h3>Deep-Focus Workspace</h3>
            <p>
              A cyber-noir interface designed to reduce cognitive load and keep hiring work
              organized.
            </p>
          </article>
        </div>
      </section>

      <section class="section-block" id="jobs">
        <div class="section-header-row">
          <div>
            <h2>Featured Opportunities</h2>
            <p>Exclusive roles actively recruiting this week.</p>
          </div>
          <a href="#" class="section-link">View All Roles <span class="material-symbols-outlined">arrow_forward</span></a>
        </div>

        <div class="job-list">
          <article class="job-card glass-panel">
            <div class="job-card__main">
              <div class="company-mark">N</div>
              <div>
                <h3>Senior Rust Engineer</h3>
                <p>Neural Systems</p>
                <div class="tag-row">
                  <span>Remote</span>
                  <span>$180k - $240k</span>
                  <span class="tag--amber">Rust</span>
                  <span class="tag--violet">WebAssembly</span>
                </div>
              </div>
            </div>
            <div class="job-card__aside">
              <p>Posted 2d ago</p>
              <RouterLink to="/register" class="apply-btn">Apply</RouterLink>
            </div>
          </article>

          <article class="job-card glass-panel">
            <div class="job-card__main">
              <div class="company-mark">O</div>
              <div>
                <h3>Lead Designer</h3>
                <p>Obsidian Labs</p>
                <div class="tag-row">
                  <span>New York / Hybrid</span>
                  <span>$160k - $210k</span>
                  <span class="tag--amber">Figma</span>
                  <span class="tag--violet">Design Systems</span>
                </div>
              </div>
            </div>
            <div class="job-card__aside">
              <p>Posted 3d ago</p>
              <RouterLink to="/register" class="apply-btn">Apply</RouterLink>
            </div>
          </article>

          <article class="job-card glass-panel">
            <div class="job-card__main">
              <div class="company-mark">C</div>
              <div>
                <h3>Backend Architect</h3>
                <p>CyberCore</p>
                <div class="tag-row">
                  <span>San Francisco</span>
                  <span>$200k - $280k</span>
                  <span class="tag--amber">Go</span>
                  <span class="tag--violet">Kubernetes</span>
                </div>
              </div>
            </div>
            <div class="job-card__aside">
              <p>Posted 1w ago</p>
              <RouterLink to="/register" class="apply-btn">Apply</RouterLink>
            </div>
          </article>
        </div>
      </section>

      <section class="section-block footer-cta">
        <div>
          <h2>Ready to hire smarter?</h2>
          <p>
            Create a profile, post a job, and keep the full workflow inside one focused
            platform.
          </p>
        </div>
        <div class="hero-actions">
          <RouterLink to="/register" class="cta-primary">Get Started</RouterLink>
          <RouterLink to="/login" class="cta-secondary">Sign In</RouterLink>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div>
        <strong>Talent-Gate</strong>
        <span>© 2026 Talent-Gate Neural Systems</span>
      </div>
      <div class="footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">API Documentation</a>
        <a href="#">Contact Support</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing-shell {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(circle at top left, rgba(255, 183, 125, 0.12), transparent 30%),
    radial-gradient(circle at bottom right, rgba(201, 190, 255, 0.09), transparent 28%),
    var(--bg-ink);
}

.ambient {
  position: fixed;
  z-index: 0;
  width: 50vw;
  height: 50vw;
  pointer-events: none;
  filter: blur(120px);
  opacity: 0.55;
}
.ambient--top {
  top: -20%;
  left: -10%;
  background: rgba(255, 183, 125, 0.12);
}
.ambient--bottom {
  right: -10%;
  bottom: -20%;
  background: rgba(201, 190, 255, 0.1);
}

.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 183, 125, 0.15);
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}

.glass-panel:hover {
  border-color: rgba(255, 183, 125, 0.3);
  box-shadow: 0 0 20px rgba(255, 183, 125, 0.15);
}

.glow-amber {
  box-shadow: 0 0 30px rgba(255, 183, 125, 0.2);
}

.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1rem 2rem;
  margin: 0;
  border-left: 0;
  border-right: 0;
  border-top: 0;
  border-radius: 0;
  background: rgba(18, 18, 20, 0.72);
}

.nav-brand,
.nav-actions,
.hero-actions,
.floating-card__row,
.job-card__main,
.job-card__aside,
.section-header-row,
.site-footer,
.footer-links,
.tag-row {
  display: flex;
  align-items: center;
}

.nav-brand {
  gap: 3rem;
}

.brand-mark {
  color: var(--primary-dim);
  font-family: var(--font-display), serif;
  font-size: clamp(1.35rem, 2vw, 1.75rem);
  letter-spacing: -0.03em;
}

.nav-links {
  display: none;
  gap: 1.75rem;
}

.nav-links a,
.section-link,
.footer-links a {
  color: var(--on-surface-variant);
  transition: color 0.2s ease;
}

.nav-links a:hover,
.section-link:hover,
.footer-links a:hover {
  color: var(--primary);
}

.nav-actions {
  gap: 0.75rem;
}

.nav-ghost,
.nav-primary,
.cta-primary,
.cta-secondary,
.search-button,
.apply-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  font-weight: 600;
  letter-spacing: 0.04em;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.nav-ghost,
.cta-secondary {
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--on-surface);
  background: transparent;
}

.nav-ghost {
  padding: 0.6rem 1.2rem;
}

.nav-primary,
.cta-primary,
.search-button {
  background: var(--primary-dim);
  color: var(--on-primary);
  box-shadow: 0 0 15px rgba(255, 183, 125, 0.18);
}

.nav-primary {
  padding: 0.6rem 1.2rem;
}

.page-wrap {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 8.5rem 1rem 4.5rem;
}

.hero-section {
  display: grid;
  gap: 3rem;
  align-items: center;
}

.hero-copy h1 {
  margin: 1rem 0 1rem;
  font-family: var(--font-display), serif;
  font-size: clamp(3rem, 8vw, 6rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
  color: var(--on-surface);
  background-image: linear-gradient(to right, var(--on-surface), var(--on-surface-variant));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-copy p,
.section-heading p,
.job-card__aside p,
.footer-cta p,
.card-subtitle,
.feature-card p,
.site-footer span {
  color: var(--on-surface-variant);
}

.hero-copy p {
  max-width: 42rem;
  font-size: clamp(1rem, 1.6vw, 1.25rem);
  line-height: 1.6;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  border-radius: 9999px;
  width: fit-content;
}

.eyebrow-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: var(--primary-dim);
  box-shadow: 0 0 10px rgba(255, 183, 125, 0.45);
}

.hero-actions {
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cta-primary,
.cta-secondary,
.search-button,
.apply-btn {
  padding: 0.95rem 1.5rem;
}

.cta-secondary {
  padding: 0.95rem 1.5rem;
}

.hero-visual {
  position: relative;
  min-height: 32rem;
  display: none;
  perspective: 1000px;
}

.hero-map {
  position: absolute;
  inset: 0;
  border-radius: 2rem;
  background:
    linear-gradient(rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02)),
    url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070') center/cover;
  opacity: 0.12;
}

.floating-card {
  position: absolute;
  width: 16rem;
  padding: 1.25rem;
  border-radius: 1.25rem;
}

.floating-card--top {
  top: 20%;
  right: 18%;
  transform: rotateY(-10deg) rotateX(5deg);
  animation: float 6s ease-in-out infinite;
}

.floating-card--bottom {
  bottom: 18%;
  left: 18%;
  width: 14rem;
  animation: float-delayed 7s ease-in-out infinite 1s;
}

.floating-card__row {
  gap: 0.9rem;
  margin-bottom: 1rem;
}

.floating-icon,
.floating-globe {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: rgba(255, 183, 125, 0.1);
  color: var(--primary-dim);
}

.floating-globe {
  background: transparent;
  width: auto;
  height: auto;
}

.card-title {
  margin: 0;
  color: var(--on-surface);
  font-weight: 600;
}

.card-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
}

.match-bar {
  width: 100%;
  height: 0.35rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.match-bar span {
  display: block;
  width: 75%;
  height: 100%;
  background: var(--primary-dim);
}

.match-label {
  margin: 0.5rem 0 0;
  text-align: right;
  color: var(--primary-dim);
  font-size: 0.8rem;
  font-weight: 600;
}

.search-section {
  margin: 2rem auto 0;
  padding: 0.5rem;
  border-radius: 9999px;
  display: grid;
  gap: 0.5rem;
}

.search-field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.search-field--split {
  border-bottom: 0;
}

.search-field input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--on-surface);
  outline: none;
}

.search-field input::placeholder {
  color: rgba(221, 193, 174, 0.5);
}

.search-button {
  width: 100%;
  border: none;
}

.section-block {
  margin-top: 5rem;
}

.section-heading {
  text-align: center;
  max-width: 52rem;
  margin: 0 auto 2rem;
}

.section-heading h2,
.section-header-row h2,
.footer-cta h2,
.feature-card h3,
.job-card h3 {
  margin: 0;
  font-family: var(--font-display), serif;
  color: var(--on-surface);
}

.section-heading h2,
.footer-cta h2 {
  font-size: clamp(2rem, 4vw, 3.25rem);
}

.feature-grid {
  display: grid;
  gap: 1rem;
}

.feature-card {
  position: relative;
  overflow: hidden;
  padding: 2rem;
  border-radius: 1.5rem;
}

.feature-icon {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
}

.feature-icon--amber {
  background: rgba(255, 183, 125, 0.1);
  color: var(--primary-dim);
}

.feature-icon--violet {
  background: rgba(201, 190, 255, 0.1);
  color: var(--secondary);
}

.feature-icon--cyan {
  background: rgba(133, 207, 255, 0.1);
  color: var(--tertiary);
}

.feature-card h3 {
  font-size: 1.35rem;
  margin-bottom: 0.75rem;
}

.section-header-row {
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.section-header-row p {
  margin: 0.35rem 0 0;
  color: var(--on-surface-variant);
}

.section-link {
  display: none;
  gap: 0.35rem;
  align-items: center;
  white-space: nowrap;
}

.job-list {
  display: grid;
  gap: 1rem;
}

.job-card {
  flex-direction: column;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1.4rem;
  border-radius: 1.25rem;
}

.job-card__main {
  gap: 1rem;
  align-items: flex-start;
}

.company-mark {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--on-surface);
  font-family: var(--font-display), serif;
  font-size: 1.5rem;
}

.job-card p {
  margin: 0.25rem 0 0;
  color: var(--on-surface-variant);
}

.tag-row {
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.9rem;
}

.tag-row span {
  padding: 0.35rem 0.7rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--on-surface-variant);
  font-size: 0.78rem;
}

.tag--amber {
  color: var(--primary-dim) !important;
  background: rgba(255, 183, 125, 0.08) !important;
}

.tag--violet {
  color: var(--secondary) !important;
  background: rgba(201, 190, 255, 0.08) !important;
}

.job-card__aside {
  justify-content: space-between;
  gap: 1rem;
}

.apply-btn {
  border: 1px solid rgba(255, 183, 125, 0.2);
  color: var(--primary-dim);
  background: rgba(255, 183, 125, 0.06);
}

.footer-cta {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 1.5rem;
}

.footer-cta p {
  max-width: 42rem;
  margin-bottom: 0;
}

.site-footer {
  position: relative;
  z-index: 1;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  padding: 2.5rem 1rem 3.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--bg-ink);
}

.site-footer strong {
  display: block;
  font-family: var(--font-display), serif;
  font-size: 1.35rem;
  color: var(--primary-dim);
  margin-bottom: 0.25rem;
}

.footer-links {
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.nav-ghost:hover,
.cta-secondary:hover,
.apply-btn:hover {
  border-color: rgba(255, 183, 125, 0.35);
  background: rgba(255, 183, 125, 0.1);
}

.nav-primary:hover,
.cta-primary:hover,
.search-button:hover {
  transform: translateY(-1px);
  background: var(--primary);
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

@keyframes float-delayed {
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
}

@media (min-width: 768px) {
  .top-nav {
    padding-inline: 2.5rem;
  }

  .nav-links {
    display: flex;
  }

  .page-wrap {
    padding-inline: 2rem;
  }

  .hero-section {
    grid-template-columns: 1.1fr 0.9fr;
    gap: 2rem;
  }

  .hero-visual {
    display: block;
  }

  .search-section {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
    align-items: stretch;
    padding: 0.5rem;
  }

  .search-field {
    border-bottom: 0;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
  }

  .search-button {
    width: auto;
    margin: 0;
  }

  .feature-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .job-card {
    flex-direction: row;
    align-items: center;
  }

  .section-link {
    display: inline-flex;
  }

  .footer-cta,
  .site-footer {
    flex-direction: row;
    align-items: center;
  }
}

@media (min-width: 1024px) {
  .page-wrap {
    padding-top: 9rem;
  }

  .footer-cta {
    padding: 2.5rem;
  }
}
</style>
