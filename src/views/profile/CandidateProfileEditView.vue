<template>
  <div class="profile-page">
    <div class="profile-page__ambient profile-page__ambient--primary"></div>
    <div class="profile-page__ambient profile-page__ambient--secondary"></div>

    <main class="profile-shell">
      <section class="profile-copy">
        <p class="profile-kicker">Professional Identity</p>
        <h1>Edit your profile.</h1>
        <p class="profile-summary">
          Keep your bio, experience level, skills, and resume aligned so
          engineering teams see your technical capabilities instantly.
        </p>

        <div class="profile-feature glass-panel">
          <div class="profile-feature__icon">
            <span class="material-symbols-outlined">badge</span>
          </div>
          <div>
            <p class="profile-feature__title">Focus first</p>
            <p class="profile-feature__text">
              A complete technical profile helps top engineering teams
              precision-match you with high-signal roles.
            </p>
          </div>
        </div>
      </section>

      <section class="profile-card glass-panel glass-panel--glow">
        <div class="profile-card__header">
          <h2>Candidate Profile</h2>
          <p>Update the details visible to companies across Talent-Gate.</p>
        </div>

        <div v-if="serverMessage" class="profile-alert profile-alert--success">
          {{ serverMessage }}
        </div>

        <div v-if="serverError" class="profile-alert profile-alert--error">
          {{ serverError }}
        </div>

        <!-- Avatar Upload Panel (styled like Employer Logo panel but circular) -->
        <div class="logo-panel">
          <div class="logo-preview logo-preview--circular">
            <img
              v-if="avatarPreview"
              :src="avatarPreview"
              alt="Avatar preview"
            />
            <div v-else class="logo-preview__fallback">
              <span class="material-symbols-outlined">person</span>
            </div>
          </div>
          <div class="logo-panel__copy">
            <h3>Avatar Image</h3>
            <p>Upload a square avatar in PNG, JPG, or WebP format. Max 5MB.</p>
            <input
              ref="avatarInput"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              class="sr-only"
              @change="onAvatarSelected"
            />
            <div class="logo-panel__actions">
              <button
                type="button"
                class="profile-secondary-button"
                @click="pickAvatar"
              >
                {{ uploadingAvatar ? "Uploading..." : "Change avatar" }}
              </button>
            </div>
            <p v-if="fieldErrors.avatar_url?.[0]" class="field-error">
              {{ fieldErrors.avatar_url[0] }}
            </p>
          </div>
        </div>

        <!-- Candidate Form -->
        <form class="profile-form" @submit.prevent="save">
          <!-- Full Name -->
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

          <!-- Bio -->
          <label class="profile-field profile-field--full">
            <span>Bio</span>
            <div class="profile-textarea-wrap">
              <textarea
                v-model.trim="form.bio"
                rows="5"
                placeholder="Architecting scalable systems, shipping products, and leveling up teams."
              ></textarea>
              <div class="profile-textarea-count">
                {{ form.bio.length }} / 2000
              </div>
            </div>
            <p v-if="fieldErrors.bio?.[0]" class="field-error">
              {{ fieldErrors.bio[0] }}
            </p>
          </label>

          <!-- Experience Level -->
          <label class="profile-field profile-field--full">
            <span>Experience Level</span>
            <div class="profile-input-wrap">
              <span class="material-symbols-outlined profile-input-icon"
                >work_history</span
              >
              <select v-model="form.experience_level">
                <option value="">Select experience level</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
              </select>
            </div>
            <p v-if="fieldErrors.experience_level?.[0]" class="field-error">
              {{ fieldErrors.experience_level[0] }}
            </p>
          </label>

          <!-- Skills Tag Input -->
          <div class="profile-field profile-field--full">
            <span>Skills</span>
            <p class="skills-instruction">
              Press Enter or Comma to add a skill tag.
            </p>
            <div class="skills-input-shell">
              <span
                v-for="(skill, index) in form.skills"
                :key="`${skill}-${index}`"
                class="skill-chip"
              >
                {{ skill }}
                <button
                  type="button"
                  @click="removeSkill(index)"
                  aria-label="Remove skill"
                >
                  ×
                </button>
              </span>

              <input
                v-model="skillInput"
                type="text"
                placeholder="Add a skill"
                @keydown.enter.prevent="addSkill"
                @keydown.comma.prevent="addSkill"
                @blur="commitSkillInput"
              />
            </div>
            <p v-if="fieldErrors.skills?.[0]" class="field-error">
              {{ fieldErrors.skills[0] }}
            </p>
          </div>

          <!-- Resume PDF Upload -->
          <div class="profile-field profile-field--full">
            <span>Resume</span>
            <p class="skills-instruction">
              Drag and drop a PDF or DOCX file, or browse manually.
            </p>

            <div
              class="resume-dropzone"
              :class="{ 'resume-dropzone--active': isDropzoneActive }"
              @dragenter.prevent="isDropzoneActive = true"
              @dragover.prevent="isDropzoneActive = true"
              @dragleave.prevent="isDropzoneActive = false"
              @drop.prevent="onResumeDrop"
              @click="pickResume"
            >
              <input
                ref="resumeInput"
                type="file"
                accept=".pdf,.doc,.docx"
                class="sr-only"
                @change="onResumeSelected"
              />
              <div class="resume-dropzone__icon">
                <span class="material-symbols-outlined">upload_file</span>
              </div>
              <div class="resume-dropzone__copy">
                <p>Drag and drop your CV or browse</p>
                <span>PDF, DOC, DOCX up to 25MB</span>
              </div>
            </div>

            <div v-if="resumeName" class="resume-file">
              <div class="resume-file__main">
                <span class="material-symbols-outlined">description</span>
                <div>
                  <p>{{ resumeName }}</p>
                  <span>Uploaded resume</span>
                </div>
              </div>
              <button type="button" class="resume-remove" @click="removeResume">
                Remove
              </button>
            </div>
          </div>

          <!-- Actions -->
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
  bio: "",
  skills: [] as string[],
  experience_level: "",
});
const skillInput = ref("");
const fieldErrors = reactive<Record<string, string[]>>({});
const serverMessage = ref<string | null>(null);
const serverError = ref<string | null>(null);
const loading = ref(false);
const uploadingAvatar = ref(false);
const avatarPreview = ref<string | null>(null);
const resumeName = ref<string | null>(null);
const avatarInput = ref<HTMLInputElement | null>(null);
const resumeInput = ref<HTMLInputElement | null>(null);
const isDropzoneActive = ref(false);

function clearErrors() {
  for (const key of Object.keys(fieldErrors)) {
    delete fieldErrors[key];
  }
}

function hydrateProfile(data: any) {
  profile.value = data;
  form.name = data?.name ?? "";
  form.bio = data?.bio ?? "";
  form.skills = Array.isArray(data?.skills) ? [...data.skills] : [];
  form.experience_level = data?.experience_level ?? "";
  avatarPreview.value = data?.avatar_url ?? null;
  resumeName.value = data?.resume_url
    ? (data.resume_url.split("/").pop() ?? null)
    : null;
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

function pickAvatar() {
  avatarInput.value?.click();
}

function pickResume() {
  resumeInput.value?.click();
}

function addSkill() {
  const nextSkill = skillInput.value.trim().replace(/,$/, "");
  if (!nextSkill) return;
  if (!form.skills.includes(nextSkill)) {
    form.skills.push(nextSkill);
  }
  skillInput.value = "";
}

function commitSkillInput() {
  if (skillInput.value.trim()) addSkill();
}

function removeSkill(index: number) {
  form.skills.splice(index, 1);
}

async function onAvatarSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  uploadingAvatar.value = true;
  clearErrors();
  serverMessage.value = null;
  serverError.value = null;

  try {
    const data = await profileApi.uploadAvatar(file);
    avatarPreview.value =
      data.avatar_url ?? data.logo_url ?? avatarPreview.value;
    serverMessage.value = "Avatar uploaded successfully.";
    if (avatarInput.value) avatarInput.value.value = "";
  } catch (error: any) {
    serverError.value =
      error?.response?.data?.message ??
      error?.message ??
      "Avatar upload failed.";
  } finally {
    uploadingAvatar.value = false;
  }
}

async function handleResumeFile(file: File) {
  if (
    ![
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ].includes(file.type) &&
    !/\.(pdf|doc|docx)$/i.test(file.name)
  ) {
    serverError.value = "Please upload a PDF, DOC, or DOCX file.";
    return;
  }

  if (file.size > 25 * 1024 * 1024) {
    serverError.value = "Resume files must be 25MB or smaller.";
    return;
  }

  clearErrors();
  serverMessage.value = null;
  serverError.value = null;

  try {
    const data = await profileApi.uploadResume(file);
    resumeName.value = data.resume_url?.split("/").pop() ?? file.name;
    serverMessage.value = "Resume uploaded successfully.";
    if (resumeInput.value) resumeInput.value.value = "";
  } catch (error: any) {
    serverError.value =
      error?.response?.data?.message ??
      error?.message ??
      "Resume upload failed.";
  }
}

async function onResumeSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  await handleResumeFile(file);
}

async function onResumeDrop(event: DragEvent) {
  isDropzoneActive.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  await handleResumeFile(file);
}

async function removeResume() {
  clearErrors();
  serverMessage.value = null;
  serverError.value = null;

  try {
    await profileApi.deleteResume();
    resumeName.value = null;
    serverMessage.value = "Resume removed successfully.";
  } catch (error: any) {
    serverError.value =
      error?.response?.data?.message ??
      error?.message ??
      "Unable to remove resume.";
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
      bio: form.bio,
      skills: form.skills,
      experience_level: form.experience_level,
    };
    const updatedProfile = await profileApi.updateProfile(payload);
    hydrateProfile(updatedProfile);
    serverMessage.value = "Profile saved successfully.";
  } catch (error: any) {
    const responseErrors = error?.response?.data?.errors ?? error?.errors;
    if (error?.response?.status === 422 && responseErrors) {
      Object.assign(fieldErrors, responseErrors);
      serverError.value = "Please fix the highlighted fields.";
      return;
    }

    serverError.value =
      error?.response?.data?.message ??
      error?.message ??
      "Unable to save profile.";
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

.profile-secondary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(255, 183, 125, 0.25);
  background: rgba(255, 255, 255, 0.05);
}

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

.logo-preview--circular {
  border-radius: 9999px;
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
.profile-input-wrap select,
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

.profile-input-wrap input,
.profile-input-wrap select {
  min-height: 3.35rem;
  padding: 0.95rem 1rem 0.95rem 3rem;
}

.profile-input-wrap select {
  appearance: none;
}

.profile-input-wrap input::placeholder,
.profile-textarea-wrap textarea::placeholder {
  color: rgba(229, 229, 225, 0.45);
}

.profile-input-wrap input:focus,
.profile-input-wrap select:focus,
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

.skills-instruction {
  font-size: 0.85rem;
  color: var(--on-surface-variant);
  margin-bottom: 0.25rem;
}

.skills-input-shell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  min-height: 3.5rem;
  padding: 0.35rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.skills-input-shell input {
  min-width: 11rem;
  flex: 1;
  padding: 0.8rem 1rem;
  border: 0;
  background: transparent;
  outline: none;
  color: var(--bone-white);
}

.skill-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.8rem;
  border-radius: 9999px;
  background: rgba(255, 183, 125, 0.1);
  border: 1px solid rgba(255, 183, 125, 0.22);
  color: var(--primary-fixed);
  font-size: 0.9rem;
}

.skill-chip button {
  border: 0;
  background: transparent;
  color: inherit;
  opacity: 0.8;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
}

.resume-dropzone {
  display: grid;
  place-items: center;
  gap: 0.8rem;
  min-height: 12rem;
  border-radius: 1.25rem;
  border: 1.5px dashed rgba(255, 183, 125, 0.22);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.resume-dropzone--active {
  border-color: rgba(255, 183, 125, 0.6);
  background: rgba(255, 183, 125, 0.08);
  transform: translateY(-1px);
}

.resume-dropzone__icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  background: rgba(255, 183, 125, 0.1);
  color: var(--primary-fixed-dim);
}

.resume-dropzone__copy {
  text-align: center;
}

.resume-dropzone__copy p {
  color: var(--bone-white);
  font-weight: 600;
}

.resume-dropzone__copy span {
  display: block;
  margin-top: 0.25rem;
  color: var(--on-surface-variant);
  font-size: 0.9rem;
}

.resume-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.resume-file__main {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.resume-file__main > span {
  color: var(--primary-fixed-dim);
}

.resume-file__main p {
  color: var(--bone-white);
  font-weight: 600;
}

.resume-file__main span {
  color: var(--on-surface-variant);
  font-size: 0.85rem;
}

.resume-remove {
  color: #ffd6d2;
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 9999px;
  padding: 0.65rem 0.95rem;
  background: rgba(239, 68, 68, 0.08);
  transition:
    background 0.2s ease,
    transform 0.2s ease;
  cursor: pointer;
}

.resume-remove:hover {
  background: rgba(239, 68, 68, 0.14);
  transform: translateY(-1px);
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
  cursor: pointer;
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

  .resume-file {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
