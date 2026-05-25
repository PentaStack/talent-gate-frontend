<template>
  <div class="public-profile-page">
    <div class="public-profile-page__ambient public-profile-page__ambient--primary"></div>
    <div class="public-profile-page__ambient public-profile-page__ambient--secondary"></div>

    <header class="public-profile-topbar glass-card">
      <div>
        <p class="public-profile-topbar__brand">Talent-Gate</p>
        <p class="public-profile-topbar__eyebrow">
          {{ profile?.role === 'employer' ? 'Company Profile' : 'Technical Candidate Profile' }}
        </p>
      </div>
      <div class="public-profile-topbar__actions">
        <RouterLink to="/" class="public-profile-link">Landing page</RouterLink>
        <RouterLink
          v-if="!auth.isAuthenticated"
          to="/login"
          class="public-profile-link public-profile-link--accent"
        >
          Sign In
        </RouterLink>
      </div>
    </header>

    <main class="public-profile-shell">
      <div v-if="loading" class="loading-state glass-card">
        <span class="material-symbols-outlined spin-icon">progress_activity</span>
        <p>Loading technical profile...</p>
      </div>

      <div v-else-if="error" class="error-state glass-card">
        <span class="material-symbols-outlined">error</span>
        <p>{{ error }}</p>
      </div>

      <template v-else-if="profile">
        <!-- Hero section (unified) -->
        <section class="public-profile-hero glass-card premium-glow">
          <div class="public-profile-avatar-wrap">
            <div class="public-profile-avatar" :class="{ 'public-profile-avatar--circular': profile.role === 'candidate' }">
              <img
                v-if="profile.role === 'candidate' ? profile.avatar_url : profile.logo_url"
                :src="profile.role === 'candidate' ? profile.avatar_url : profile.logo_url"
                :alt="profile.name ?? 'Avatar'"
              />
              <div v-else class="public-profile-avatar__fallback">
                {{ initials }}
              </div>
            </div>
          </div>

          <div class="public-profile-meta">
            <div class="public-profile-badges">
              <span
                v-if="profile.role === 'candidate'"
                class="public-profile-badge public-profile-badge--primary"
              >
                {{ experienceLabel }}
              </span>
              <span
                v-else
                class="public-profile-badge public-profile-badge--primary"
              >
                Verified Employer
              </span>
              <span class="public-profile-badge public-profile-badge--secondary">
                {{ profile.role === 'candidate' ? 'Open to opportunities' : 'Hiring technical talent' }}
              </span>
            </div>

            <h1>{{ profile.role === 'candidate' ? profile.name : (profile.company_name || profile.name) }}</h1>
            <p class="public-profile-handle">
              {{ profile.role === 'candidate' ? 'Technical Professional' : 'Engineering Organization' }}
            </p>
          </div>
        </section>

        <!-- Candidate layout -->
        <template v-if="profile.role === 'candidate'">
          <section class="public-profile-grid">
            <article class="public-profile-card glass-card">
              <div class="section-heading">
                <p>About</p>
                <h2>Bio</h2>
              </div>
              <p class="public-profile-bio">
                {{ profile.bio || "This candidate has not added a bio yet." }}
              </p>
            </article>

            <article class="public-profile-card glass-card">
              <div class="section-heading">
                <p>Skills</p>
                <h2>Skill Chips</h2>
              </div>
              <div class="skill-chip-list">
                <span
                  v-for="skill in profile.skills ?? []"
                  :key="skill"
                  class="skill-chip"
                >
                  {{ skill }}
                </span>
                <p v-if="!profile.skills?.length" class="public-profile-empty">
                  No skills listed yet.
                </p>
              </div>
            </article>
          </section>

          <aside class="public-profile-aside glass-card premium-glow">
            <div class="public-profile-aside__heading">
              <p>Resume Access</p>
              <h2>View Resume</h2>
            </div>

            <p class="public-profile-aside__text">
              {{
                auth.user?.role === "employer"
                  ? "Authenticated employers can open a 60-minute signed resume link."
                  : "Resume access is available to authenticated employers only."
              }}
            </p>

            <button
              v-if="auth.user?.role === 'employer'"
              type="button"
              class="resume-button button-hover-effect"
              :disabled="resumeLoading"
              @click="openResume"
            >
              <span class="material-symbols-outlined">description</span>
              <span>{{ resumeLoading ? "Preparing..." : "View Resume" }}</span>
            </button>

            <div v-else class="resume-guest-note">
              Sign in as an employer to access a temporary signed resume URL.
            </div>

            <p
              v-if="resumeMessage"
              class="resume-status"
              :class="resumeMessageKindClass"
            >
              {{ resumeMessage }}
            </p>

            <div class="profile-details">
              <div>
                <span>Experience Level</span>
                <strong>{{ experienceLabel }}</strong>
              </div>
              <div>
                <span>Profile Type</span>
                <strong>Read only</strong>
              </div>
            </div>
          </aside>
        </template>

        <!-- Employer layout -->
        <template v-else>
          <section class="public-profile-grid">
            <article class="public-profile-card glass-card">
              <div class="section-heading">
                <p>Mission & Focus</p>
                <h2>Company Description</h2>
              </div>
              <p class="public-profile-bio">
                {{ profile.description || "This company has not added a description yet." }}
              </p>
            </article>
          </section>

          <aside class="public-profile-aside glass-card premium-glow">
            <div class="public-profile-aside__heading">
              <p>Company Details</p>
              <h2>Information</h2>
            </div>

            <div class="profile-details">
              <div v-if="profile.website">
                <span>Website</span>
                <a :href="profile.website" target="_blank" rel="noopener noreferrer" class="website-link">
                  <span class="material-symbols-outlined" style="font-size: 1.1rem;">language</span>
                  <span>Visit website</span>
                </a>
              </div>
              <div>
                <span>Registered By</span>
                <strong>{{ profile.name }}</strong>
              </div>
              <div>
                <span>Organization</span>
                <strong>{{ profile.company_name || profile.name || 'Not specified' }}</strong>
              </div>
            </div>
          </aside>
        </template>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import * as profileApi from "@/api/profile";

const route = useRoute();
const auth = useAuthStore();
const profile = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const resumeLoading = ref(false);
const resumeMessage = ref<string | null>(null);
const resumeMessageKind = ref<"success" | "error" | null>(null);

const userId = computed(() => String(route.params.userId ?? ""));
const initials = computed(() => {
  const name = profile.value?.role === 'candidate'
    ? profile.value?.name?.trim()
    : (profile.value?.company_name?.trim() || profile.value?.name?.trim());
  if (!name) return "P";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join("");
});

const experienceLabel = computed(() => {
  const value = profile.value?.experience_level;
  if (!value) return "Experience not listed";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
});

const resumeMessageKindClass = computed(() => {
  return resumeMessageKind.value === "success"
    ? "resume-status--success"
    : "resume-status--error";
});

async function loadProfile() {
  loading.value = true;
  error.value = null;
  resumeMessage.value = null;
  resumeMessageKind.value = null;

  try {
    profile.value = await profileApi.getPublicCandidate(userId.value);
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? err?.message ?? "Unable to load profile data.";
  } finally {
    loading.value = false;
  }
}

async function openResume() {
  if (auth.user?.role !== "employer") return;

  resumeLoading.value = true;
  resumeMessage.value = null;
  resumeMessageKind.value = null;

  try {
    const data = await profileApi.getResumeLink(userId.value);
    const url = data?.url;
    if (!url) {
      throw new Error("Resume link unavailable");
    }

    window.open(url, "_blank", "noopener,noreferrer");
    resumeMessageKind.value = "success";
    resumeMessage.value = "Resume link opened in a new tab.";
  } catch (err: any) {
    resumeMessageKind.value = "error";
    resumeMessage.value =
      err?.response?.data?.message ??
      err?.message ??
      "Unable to load resume.";
  } finally {
    resumeLoading.value = false;
  }
}

watch(userId, loadProfile, { immediate: true });
</script>

<style scoped>
.public-profile-page {
  position: relative;
  min-height: 100vh;
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

.public-profile-page__ambient {
  position: fixed;
  width: 32rem;
  height: 32rem;
  border-radius: 9999px;
  filter: blur(120px);
  pointer-events: none;
}

.public-profile-page__ambient--primary {
  top: -10rem;
  right: -8rem;
  background: rgba(255, 183, 125, 0.08);
}

.public-profile-page__ambient--secondary {
  bottom: -10rem;
  left: -8rem;
  background: rgba(201, 190, 255, 0.08);
}

.glass-card {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 183, 125, 0.15);
  border-radius: 1.5rem;
}

.glass-card:hover {
  border-color: rgba(255, 183, 125, 0.3);
  box-shadow: 0 0 30px rgba(255, 183, 125, 0.05);
}

.premium-glow {
  box-shadow: 0 0 20px rgba(255, 183, 125, 0.1);
}

.button-hover-effect {
  position: relative;
  overflow: hidden;
}

.button-hover-effect::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease;
}

.button-hover-effect:hover::after {
  transform: translateY(-100%);
}

.public-profile-topbar {
  position: relative;
  z-index: 1;
  max-width: 80rem;
  margin: 1rem auto 0;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.public-profile-topbar__brand {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.public-profile-topbar__eyebrow {
  margin-top: 0.25rem;
  color: var(--on-surface-variant);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.public-profile-topbar__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.public-profile-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.8rem 1.1rem;
  color: var(--on-surface);
  background: rgba(255, 255, 255, 0.03);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.public-profile-link:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 183, 125, 0.25);
  background: rgba(255, 255, 255, 0.05);
}

.public-profile-link--accent {
  background: linear-gradient(135deg, var(--primary-fixed), #ffd0a7);
  color: var(--on-primary);
  border-color: transparent;
  font-weight: 700;
}

.public-profile-shell {
  position: relative;
  z-index: 1;
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.85fr);
  gap: 1.5rem;
  align-items: start;
}

.loading-state,
.error-state {
  grid-column: 1 / -1;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--on-surface-variant);
  text-align: center;
}

.spin-icon {
  animation: spin 1.5s linear infinite;
  color: var(--primary-fixed);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.public-profile-hero {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.25rem;
  align-items: center;
  padding: 1.4rem;
}

.public-profile-avatar {
  width: 8.5rem;
  height: 8.5rem;
  border-radius: 1.75rem;
  overflow: hidden;
  border: 1px solid rgba(255, 183, 125, 0.22);
  background: rgba(255, 255, 255, 0.03);
}

.public-profile-avatar--circular {
  border-radius: 9999px;
}

.public-profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.public-profile-avatar__fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--primary-fixed-dim);
}

.public-profile-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.public-profile-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.45rem 0.8rem;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
}

.public-profile-badge--primary {
  background: rgba(255, 183, 125, 0.1);
  border: 1px solid rgba(255, 183, 125, 0.2);
  color: var(--primary-fixed-dim);
}

.public-profile-badge--secondary {
  background: rgba(201, 190, 255, 0.1);
  border: 1px solid rgba(201, 190, 255, 0.2);
  color: var(--secondary);
}

.public-profile-meta h1 {
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 5vw, 4.5rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
  color: var(--bone-white);
}

.public-profile-handle {
  margin-top: 0.5rem;
  color: var(--on-surface-variant);
}

.public-profile-grid {
  display: grid;
  gap: 1.25rem;
}

.public-profile-card,
.public-profile-aside {
  padding: 1.4rem;
}

.section-heading {
  margin-bottom: 1rem;
}

.section-heading p,
.public-profile-aside__heading p {
  color: var(--primary-fixed-dim);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  font-weight: 700;
}

.section-heading h2,
.public-profile-aside__heading h2 {
  margin-top: 0.3rem;
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--bone-white);
}

.public-profile-bio {
  color: var(--on-surface-variant);
  line-height: 1.8;
  font-size: 1rem;
  white-space: pre-line;
}

.skill-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.skill-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.65rem 0.9rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 183, 125, 0.22);
  background: rgba(255, 183, 125, 0.08);
  color: var(--primary-fixed);
  font-size: 0.9rem;
}

.public-profile-empty {
  color: var(--on-surface-variant);
}

.public-profile-aside {
  display: grid;
  gap: 1rem;
  align-content: start;
}

.public-profile-aside__text {
  color: var(--on-surface-variant);
  line-height: 1.7;
}

.resume-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  min-height: 3.35rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 183, 125, 0.2);
  background: linear-gradient(135deg, var(--primary-fixed-dim), #ffc999);
  color: var(--on-primary);
  font-weight: 700;
  cursor: pointer;
}

.resume-button:disabled {
  opacity: 0.7;
  cursor: progress;
}

.resume-guest-note {
  padding: 0.95rem 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  color: var(--on-surface-variant);
}

.resume-status {
  padding: 0.9rem 1rem;
  border-radius: 1rem;
}

.resume-status--success {
  color: #d6f5dc;
  background: rgba(22, 163, 74, 0.12);
  border: 1px solid rgba(22, 163, 74, 0.2);
}

.resume-status--error {
  color: #ffd6d2;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.profile-details {
  display: grid;
  gap: 0.9rem;
  padding-top: 0.2rem;
}

.profile-details div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  color: var(--on-surface-variant);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 0.9rem;
}

.profile-details span {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.profile-details strong {
  color: var(--bone-white);
}

.website-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--primary-fixed-dim);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.website-link:hover {
  color: var(--primary-fixed);
  text-decoration: underline;
}

@media (max-width: 960px) {
  .public-profile-shell {
    grid-template-columns: 1fr;
  }

  .public-profile-aside {
    order: 3;
  }
}

@media (max-width: 640px) {
  .public-profile-topbar,
  .public-profile-shell {
    padding-inline: 1rem;
  }

  .public-profile-hero {
    grid-template-columns: 1fr;
    justify-items: start;
  }

  .public-profile-avatar {
    width: 7rem;
    height: 7rem;
  }

  .profile-details div {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
