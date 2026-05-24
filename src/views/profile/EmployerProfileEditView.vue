<template>
  <div class="profile-page">
    <div class="profile-page__ambient profile-page__ambient--primary"></div>
    <div class="profile-page__ambient profile-page__ambient--secondary"></div>

    <main class="profile-shell">
      <section class="profile-copy">
        <p class="profile-kicker">Company Identity</p>
        <h1>Edit your employer profile.</h1>
        <p class="profile-summary">
          Keep your company details, website, description, and branding assets
          aligned so candidates see a clear identity.
        </p>

        <div class="profile-feature glass-panel">
          <div class="profile-feature__icon">
            <span class="material-symbols-outlined">domain</span>
          </div>
          <div>
            <p class="profile-feature__title">Brand first</p>
            <p class="profile-feature__text">
              A clean company page improves trust and helps technical candidates
              recognize your team faster.
            </p>
          </div>
        </div>
      </section>

      <section class="profile-card glass-panel glass-panel--glow">
        <div class="profile-card__header">
          <h2>Company Profile</h2>
          <p>Update the details visible to candidates across Talent-Gate.</p>
        </div>

        <div v-if="serverMessage" class="profile-alert profile-alert--success">
          {{ serverMessage }}
        </div>

        <div v-if="serverError" class="profile-alert profile-alert--error">
          {{ serverError }}
        </div>

        <div class="logo-panel">
          <div class="logo-preview">
            <img
              v-if="logoPreview"
              :src="logoPreview"
              alt="Company logo preview"
            />
            <div v-else class="logo-preview__fallback">
              <span class="material-symbols-outlined">business</span>
            </div>
          </div>
          <div class="logo-panel__copy">
            <h3>Company Logo</h3>
            <p>Upload a square logo in PNG, JPG, or WebP format. Max 2MB.</p>
            <input
              ref="logoInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="sr-only"
              @change="onLogoSelected"
            />
            <div class="logo-panel__actions">
              <button
                type="button"
                class="profile-secondary-button"
                @click="pickLogo"
              >
                {{ uploadingLogo ? "Uploading..." : "Change logo" }}
              </button>
            </div>
            <p v-if="fieldErrors.logo_url?.[0]" class="field-error">
              {{ fieldErrors.logo_url[0] }}
            </p>
          </div>
        </div>

        <form class="profile-form" @submit.prevent="save">
          <label class="profile-field profile-field--full">
            <span>Full Name</span>
            <div class="profile-input-wrap">
              <span class="material-symbols-outlined profile-input-icon"
                >person</span
              >
              <input
                v-model.trim="form.name"
                type="text"
                placeholder="Youssef Salah"
              />
            </div>
            <p v-if="fieldErrors.name?.[0]" class="field-error">
              {{ fieldErrors.name[0] }}
            </p>
          </label>

          <label class="profile-field">
            <span>Company Name</span>
            <div class="profile-input-wrap">
              <span class="material-symbols-outlined profile-input-icon"
                >corporate_fare</span
              >
              <input
                v-model.trim="form.company_name"
                type="text"
                placeholder="Talent-Gate Neural Systems"
              />
            </div>
            <p v-if="fieldErrors.company_name?.[0]" class="field-error">
              {{ fieldErrors.company_name[0] }}
            </p>
          </label>

          <label class="profile-field">
            <span>Website</span>
            <div class="profile-input-wrap">
              <span class="material-symbols-outlined profile-input-icon"
                >language</span
              >
              <input
                v-model.trim="form.website"
                type="url"
                placeholder="https://Talent-Gate.io"
              />
            </div>
            <p v-if="fieldErrors.website?.[0]" class="field-error">
              {{ fieldErrors.website[0] }}
            </p>
          </label>

          <label class="profile-field profile-field--full">
            <span>Description</span>
            <div class="profile-textarea-wrap">
              <textarea
                v-model.trim="form.description"
                rows="7"
                placeholder="Describe your company mission, hiring focus, and technical culture."
              ></textarea>
              <div class="profile-textarea-count">
                {{ form.description.length }} / 2000
              </div>
            </div>
            <p v-if="fieldErrors.description?.[0]" class="field-error">
              {{ fieldErrors.description[0] }}
            </p>
          </label>

          <div class="profile-actions">
            <button
              type="button"
              class="profile-secondary-button"
              @click="reloadProfile"
              :disabled="loading"
            >
              Reset
            </button>
            <button
              type="submit"
              class="profile-primary-button"
              :disabled="loading"
            >
              {{ loading ? "Saving..." : "Save Changes" }}
            </button>
          </div>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import * as profileApi from "@/api/profile";

const router = useRouter();

const profile = ref<any>(null);
const form = reactive({
  name: "",
  company_name: "",
  website: "",
  description: "",
});
const fieldErrors = reactive<Record<string, string[]>>({});
const serverMessage = ref<string | null>(null);
const serverError = ref<string | null>(null);
const loading = ref(false);
const uploadingLogo = ref(false);
const logoPreview = ref<string | null>(null);
const logoInput = ref<HTMLInputElement | null>(null);

function clearErrors() {
  for (const key of Object.keys(fieldErrors)) {
    delete fieldErrors[key];
  }
}

function hydrateProfile(data: any) {
  profile.value = data;
  form.name = data?.name ?? "";
  form.company_name = data?.company_name ?? "";
  form.website = data?.website ?? "";
  form.description = data?.description ?? "";
  logoPreview.value = data?.logo_url ?? null;
}

async function reloadProfile() {
  serverMessage.value = null;
  serverError.value = null;
  clearErrors();
  try {
    const data = await profileApi.getProfile();
    hydrateProfile(data);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await router.push({
        name: "login",
        query: { redirect: "/profile/edit" },
      });
      return;
    }

    serverError.value =
      error?.response?.data?.message ??
      error?.message ??
      "Unable to load profile data.";
  }
}

onMounted(async () => {
  await reloadProfile();
});

function pickLogo() {
  logoInput.value?.click();
}

async function onLogoSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  uploadingLogo.value = true;
  serverMessage.value = null;
  serverError.value = null;
  clearErrors();

  try {
    const data = await profileApi.uploadAvatar(file);
    logoPreview.value = data.logo_url ?? data.avatar_url ?? logoPreview.value;
    serverMessage.value = "Logo uploaded successfully.";
    if (logoInput.value) logoInput.value.value = "";
  } catch (error: any) {
    serverError.value =
      error?.response?.data?.message ?? error?.message ?? "Logo upload failed.";
  } finally {
    uploadingLogo.value = false;
  }
}

async function save() {
  loading.value = true;
  serverMessage.value = null;
  serverError.value = null;
  clearErrors();

  try {
    const payload = {
      name: form.name,
      company_name: form.company_name,
      website: form.website,
      description: form.description,
    };
    const updatedProfile = await profileApi.updateProfile(payload);
    hydrateProfile(updatedProfile);
    serverMessage.value = "Employer profile saved.";
  } catch (error: any) {
    const responseErrors = error?.response?.data?.errors ?? error?.errors;
    if (error?.response?.status === 422 && responseErrors) {
      Object.assign(fieldErrors, responseErrors);
      return;
    }
    serverError.value =
      error?.response?.data?.message ??
      error?.message ??
      "Unable to save employer profile.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.profile-page {
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

.profile-page__ambient {
  position: fixed;
  width: 32rem;
  height: 32rem;
  border-radius: 9999px;
  filter: blur(120px);
  pointer-events: none;
}

.profile-page__ambient--primary {
  top: -10rem;
  right: -8rem;
  background: rgba(255, 183, 125, 0.08);
}

.profile-page__ambient--secondary {
  bottom: -10rem;
  left: -8rem;
  background: rgba(201, 190, 255, 0.08);
}

.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 220, 195, 0.15);
  border-radius: 1.5rem;
}

.glass-panel--glow {
  box-shadow: 0 0 30px rgba(255, 183, 125, 0.08);
}

.profile-topbar {
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

.profile-topbar__brand {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
}

.profile-topbar__eyebrow {
  margin-top: 0.25rem;
  color: var(--on-surface-variant);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.profile-topbar__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.profile-link,
.profile-secondary-button {
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

.profile-link:hover,
.profile-secondary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(255, 183, 125, 0.25);
  background: rgba(255, 255, 255, 0.05);
}

.profile-link--accent,
.profile-primary-button {
  background: linear-gradient(135deg, var(--primary-fixed), #ffd0a7);
  color: var(--on-primary);
  border-color: transparent;
  font-weight: 700;
}

.profile-shell {
  position: relative;
  z-index: 1;
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 1.1fr);
  gap: 2rem;
  align-items: start;
}

.profile-copy {
  display: grid;
  gap: 1.25rem;
  padding-top: 2rem;
}

.profile-kicker {
  color: var(--primary-fixed-dim);
  text-transform: uppercase;
  letter-spacing: 0.24em;
  font-size: 0.75rem;
  font-weight: 700;
}

.profile-copy h1 {
  font-family: var(--font-display);
  font-size: clamp(2.6rem, 4.8vw, 4.8rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
  max-width: 12ch;
}

.profile-summary {
  color: var(--on-surface-variant);
  font-size: 1.05rem;
  line-height: 1.7;
  max-width: 38rem;
}

.profile-feature {
  max-width: 32rem;
  padding: 1.2rem;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: start;
}

.profile-feature__icon {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  background: rgba(255, 183, 125, 0.1);
  color: var(--primary-fixed-dim);
}

.profile-feature__title {
  color: var(--bone-white);
  font-weight: 600;
}

.profile-feature__text {
  margin-top: 0.25rem;
  color: var(--on-surface-variant);
  line-height: 1.6;
}

.profile-card {
  padding: 1.75rem;
}

.profile-card__header {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 1.5rem;
}

.profile-card__header h2 {
  font-family: var(--font-display);
  font-size: 1.9rem;
  color: var(--bone-white);
}

.profile-card__header p {
  color: var(--on-surface-variant);
}

.profile-alert {
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
}

.profile-alert--success {
  color: #d6f5dc;
  background: rgba(22, 163, 74, 0.12);
  border: 1px solid rgba(22, 163, 74, 0.2);
}

.profile-alert--error {
  color: #ffd6d2;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.logo-panel {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.25rem;
  align-items: center;
  padding: 1.2rem;
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 1.5rem;
}

.logo-preview {
  width: 7.5rem;
  height: 7.5rem;
  border-radius: 1.25rem;
  overflow: hidden;
  border: 1px dashed rgba(255, 183, 125, 0.3);
  background: rgba(255, 255, 255, 0.03);
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-preview__fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--primary-fixed-dim);
}

.logo-panel__copy h3 {
  color: var(--bone-white);
  font-weight: 600;
  font-size: 1.05rem;
}

.logo-panel__copy p {
  margin-top: 0.3rem;
  color: var(--on-surface-variant);
  line-height: 1.6;
}

.logo-panel__actions {
  margin-top: 0.9rem;
}

.profile-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.1rem;
}

.profile-field {
  display: grid;
  gap: 0.5rem;
}

.profile-field--full {
  grid-column: 1 / -1;
}

.profile-field > span {
  color: var(--on-surface-variant);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
}

.profile-input-wrap {
  position: relative;
}

.profile-input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--on-surface-variant);
}

.profile-input-wrap input,
.profile-textarea-wrap textarea {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  color: var(--bone-white);
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.profile-input-wrap input {
  min-height: 3.35rem;
  padding: 0.95rem 1rem 0.95rem 3rem;
}

.profile-input-wrap input::placeholder,
.profile-textarea-wrap textarea::placeholder {
  color: rgba(229, 229, 225, 0.45);
}

.profile-input-wrap input:focus,
.profile-textarea-wrap textarea:focus {
  border-color: rgba(255, 183, 125, 0.55);
  box-shadow: 0 0 0 4px rgba(255, 183, 125, 0.12);
  background: rgba(255, 255, 255, 0.07);
}

.profile-textarea-wrap {
  position: relative;
}

.profile-textarea-wrap textarea {
  min-height: 12rem;
  padding: 1rem;
  resize: vertical;
}

.profile-textarea-count {
  position: absolute;
  right: 1rem;
  bottom: 0.9rem;
  font-size: 0.75rem;
  color: var(--on-surface-variant);
  pointer-events: none;
}

.profile-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.profile-primary-button,
.profile-secondary-button {
  min-height: 3.35rem;
  padding: 0 1.35rem;
  border-radius: 9999px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.profile-primary-button:hover:not(:disabled),
.profile-secondary-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.profile-primary-button:hover:not(:disabled) {
  box-shadow: 0 0 30px rgba(255, 183, 125, 0.15);
}

.profile-primary-button:disabled,
.profile-secondary-button:disabled {
  opacity: 0.7;
  cursor: progress;
}

.field-error {
  color: #ffd6d2;
  font-size: 0.875rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 900px) {
  .profile-shell {
    grid-template-columns: 1fr;
  }

  .profile-copy {
    padding-top: 0;
  }
}

@media (max-width: 640px) {
  .profile-topbar,
  .profile-shell {
    padding-inline: 1rem;
  }

  .profile-card {
    padding: 1.15rem;
  }

  .profile-form {
    grid-template-columns: 1fr;
  }

  .logo-panel {
    grid-template-columns: 1fr;
    justify-items: start;
  }

  .profile-actions {
    flex-direction: column-reverse;
  }

  .profile-actions > * {
    width: 100%;
  }
}
</style>
