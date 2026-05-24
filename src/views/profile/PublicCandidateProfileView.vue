<template>
  <div class="public-candidate-page">
    <div
      class="public-candidate-page__ambient public-candidate-page__ambient--primary"
    ></div>
    <div
      class="public-candidate-page__ambient public-candidate-page__ambient--secondary"
    ></div>

    <header class="public-candidate-topbar glass-card">
      <div>
        <p class="public-candidate-topbar__brand">Talent-Gate</p>
        <p class="public-candidate-topbar__eyebrow">Public Candidate Profile</p>
      </div>
      <div class="public-candidate-topbar__actions">
        <RouterLink to="/" class="public-candidate-link"
          >Landing page</RouterLink
        >
        <RouterLink
          v-if="!auth.isAuthenticated"
          to="/login"
          class="public-candidate-link public-candidate-link--accent"
          >Sign In</RouterLink
        >
      </div>
    </header>

    <main class="public-candidate-shell">
      <section class="public-candidate-hero glass-card premium-glow">
        <div class="public-candidate-avatar-wrap">
          <div class="public-candidate-avatar">
            <img
              v-if="profile?.avatar_url"
              :src="profile.avatar_url"
              :alt="profile?.name ?? 'Candidate avatar'"
            />
            <div v-else class="public-candidate-avatar__fallback">
              {{ initials }}
            </div>
          </div>
        </div>

        <div class="public-candidate-meta">
          <div class="public-candidate-badges">
            <span
              class="public-candidate-badge public-candidate-badge--primary"
            >
              {{ experienceLabel }}
            </span>
            <span
              class="public-candidate-badge public-candidate-badge--secondary"
              >Open to opportunities</span
            >
          </div>

          <h1>{{ profile?.name ?? "Candidate Profile" }}</h1>
          <p class="public-candidate-handle">Public candidate profile</p>
        </div>
      </section>

      <section class="public-candidate-grid">
        <article class="public-candidate-card glass-card">
          <div class="section-heading">
            <p>About</p>
            <h2>Bio</h2>
          </div>
          <p class="public-candidate-bio">
            {{ profile?.bio || "This candidate has not added a bio yet." }}
          </p>
        </article>

        <article class="public-candidate-card glass-card">
          <div class="section-heading">
            <p>Skills</p>
            <h2>Skill Chips</h2>
          </div>
          <div class="skill-chip-list">
            <span
              v-for="skill in profile?.skills ?? []"
              :key="skill"
              class="skill-chip"
            >
              {{ skill }}
            </span>
            <p v-if="!profile?.skills?.length" class="public-candidate-empty">
              No skills listed yet.
            </p>
          </div>
        </article>
      </section>

      <aside class="public-candidate-aside glass-card premium-glow">
        <div class="public-candidate-aside__heading">
          <p>Resume Access</p>
          <h2>View Resume</h2>
        </div>

        <p class="public-candidate-aside__text">
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

        <div class="candidate-details">
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
const resumeLoading = ref(false);
const resumeMessage = ref<string | null>(null);
const resumeMessageKind = ref<"success" | "error" | null>(null);

const userId = computed(() => String(route.params.userId ?? ""));
const initials = computed(() => {
  const name = profile.value?.name?.trim();
  if (!name) return "C";
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
  resumeMessage.value = null;
  resumeMessageKind.value = null;
  profile.value = await profileApi.getPublicCandidate(userId.value);
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
  } catch (error: any) {
    resumeMessageKind.value = "error";
    resumeMessage.value =
      error?.response?.data?.message ??
      error?.message ??
      "Unable to load resume.";
  } finally {
    resumeLoading.value = false;
  }
}

watch(userId, loadProfile, { immediate: true });
</script>

<style scoped>
.public-candidate-page {
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

.public-candidate-page__ambient {
  position: fixed;
  width: 32rem;
  height: 32rem;
  border-radius: 9999px;
  filter: blur(120px);
  pointer-events: none;
}

.public-candidate-page__ambient--primary {
  top: -10rem;
  right: -8rem;
  background: rgba(255, 183, 125, 0.08);
}

.public-candidate-page__ambient--secondary {
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

.public-candidate-topbar {
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

.public-candidate-topbar__brand {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.public-candidate-topbar__eyebrow {
  margin-top: 0.25rem;
  color: var(--on-surface-variant);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.public-candidate-topbar__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.public-candidate-link {
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

.public-candidate-link:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 183, 125, 0.25);
  background: rgba(255, 255, 255, 0.05);
}

.public-candidate-link--accent {
  background: linear-gradient(135deg, var(--primary-fixed), #ffd0a7);
  color: var(--on-primary);
  border-color: transparent;
  font-weight: 700;
}

.public-candidate-shell {
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

.public-candidate-hero {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.25rem;
  align-items: center;
  padding: 1.4rem;
}

.public-candidate-avatar {
  width: 8.5rem;
  height: 8.5rem;
  border-radius: 1.75rem;
  overflow: hidden;
  border: 1px solid rgba(255, 183, 125, 0.22);
  background: rgba(255, 255, 255, 0.03);
}

.public-candidate-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.public-candidate-avatar__fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--primary-fixed-dim);
}

.public-candidate-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.public-candidate-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.45rem 0.8rem;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
}

.public-candidate-badge--primary {
  background: rgba(255, 183, 125, 0.1);
  border: 1px solid rgba(255, 183, 125, 0.2);
  color: var(--primary-fixed-dim);
}

.public-candidate-badge--secondary {
  background: rgba(201, 190, 255, 0.1);
  border: 1px solid rgba(201, 190, 255, 0.2);
  color: var(--secondary);
}

.public-candidate-meta h1 {
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 5vw, 4.5rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
  color: var(--bone-white);
}

.public-candidate-handle {
  margin-top: 0.5rem;
  color: var(--on-surface-variant);
}

.public-candidate-grid {
  display: grid;
  gap: 1.25rem;
}

.public-candidate-card,
.public-candidate-aside {
  padding: 1.4rem;
}

.section-heading {
  margin-bottom: 1rem;
}

.section-heading p,
.public-candidate-aside__heading p {
  color: var(--primary-fixed-dim);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  font-weight: 700;
}

.section-heading h2,
.public-candidate-aside__heading h2 {
  margin-top: 0.3rem;
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--bone-white);
}

.public-candidate-bio {
  color: var(--on-surface-variant);
  line-height: 1.8;
  font-size: 1rem;
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

.public-candidate-empty {
  color: var(--on-surface-variant);
}

.public-candidate-aside {
  display: grid;
  gap: 1rem;
  align-content: start;
}

.public-candidate-aside__text {
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

.candidate-details {
  display: grid;
  gap: 0.9rem;
  padding-top: 0.2rem;
}

.candidate-details div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--on-surface-variant);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 0.9rem;
}

.candidate-details span {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.candidate-details strong {
  color: var(--bone-white);
}

@media (max-width: 960px) {
  .public-candidate-shell {
    grid-template-columns: 1fr;
  }

  .public-candidate-aside {
    order: 3;
  }
}

@media (max-width: 640px) {
  .public-candidate-topbar,
  .public-candidate-shell {
    padding-inline: 1rem;
  }

  .public-candidate-hero {
    grid-template-columns: 1fr;
    justify-items: start;
  }

  .public-candidate-avatar {
    width: 7rem;
    height: 7rem;
  }

  .candidate-details div {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
