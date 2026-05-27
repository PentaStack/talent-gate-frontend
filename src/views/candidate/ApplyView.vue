<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useApplicationsStore } from '@/stores/applications'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const store = useApplicationsStore()
const { show: showToast } = useToast()

const jobId = Number(route.params.jobId)
const jobTitle = (window.history.state?.jobTitle as string) ?? `Job #${jobId}`
const jobCompany = (window.history.state?.jobCompany as string) ?? ''

const coverLetter = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const charCount = computed(() => coverLetter.value.length)
const isInvalid = computed(() => charCount.value === 0 || charCount.value > 5000)

async function handleSubmit() {
  if (isInvalid.value || isSubmitting.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    await store.submitApplication(jobId, coverLetter.value)
    showToast('Application submitted!', 'success')
    router.push('/applications')
  } catch (err: any) {
    if (err?.response?.status === 422) {
      errorMessage.value = err.response.data?.message ?? 'Validation error.'
    } else {
      errorMessage.value = 'Something went wrong. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="apply-page">
      <button type="button" class="back-btn" @click="router.push('/jobs')">
        <span class="material-symbols-outlined">arrow_back</span>
        Back to Jobs
      </button>

      <div class="apply-card glass-panel">
        <div class="apply-card__header">
          <div>
            <p class="apply-card__kicker">Applying for</p>
            <h1 class="apply-card__title">{{ jobTitle }}</h1>
            <p v-if="jobCompany" class="apply-card__company">{{ jobCompany }}</p>
          </div>
        </div>

        <form class="apply-form" @submit.prevent="handleSubmit">
          <label class="apply-form__label" for="cover-letter">Cover Letter</label>
          <textarea
            id="cover-letter"
            v-model="coverLetter"
            class="apply-form__textarea"
            placeholder="Tell the employer why you're a great fit…"
            rows="12"
            autofocus
          />
          <p class="apply-form__counter" :class="{ 'apply-form__counter--over': charCount > 5000 }">
            {{ charCount }} / 5000
          </p>

          <p v-if="errorMessage" class="apply-form__error">{{ errorMessage }}</p>

          <div class="apply-form__actions">
            <button type="button" class="btn btn--ghost" @click="router.push('/jobs')" :disabled="isSubmitting">
              Cancel
            </button>
            <button type="submit" class="btn btn--primary" :disabled="isInvalid || isSubmitting">
              <span v-if="isSubmitting" class="spinner" />
              <span v-else>Submit Application</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.apply-page {
  display: grid;
  gap: 1.5rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: none;
  color: var(--on-surface-variant);
  font: inherit;
  font-size: 0.88rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
  width: fit-content;
}

.back-btn:hover {
  color: var(--primary-dim);
}

.back-btn .material-symbols-outlined {
  font-size: 1.1rem;
}

.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 183, 125, 0.15);
}

.apply-card {
  border-radius: 1.25rem;
  overflow: hidden;
}

.apply-card__header {
  padding: 1.75rem 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.apply-card__kicker {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--primary-dim);
}

.apply-card__title {
  margin: 0;
  font-family: var(--font-display), serif;
  font-size: clamp(1.3rem, 2.5vw, 1.75rem);
  color: var(--on-surface);
}

.apply-card__company {
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
  color: var(--on-surface-variant);
}

.apply-form {
  padding: 1.75rem 2rem;
  display: grid;
  gap: 0.75rem;
}

.apply-form__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--on-surface-variant);
}

.apply-form__textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  color: var(--on-surface);
  font: inherit;
  font-size: 0.95rem;
  line-height: 1.7;
  padding: 1rem 1.1rem;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.apply-form__textarea:focus {
  border-color: rgba(255, 183, 125, 0.4);
}

.apply-form__counter {
  margin: 0;
  font-size: 0.78rem;
  color: var(--on-surface-variant);
  text-align: right;
}

.apply-form__counter--over {
  color: #f87171;
}

.apply-form__error {
  margin: 0;
  font-size: 0.85rem;
  color: #f87171;
  padding: 0.6rem 0.85rem;
  border-radius: 0.6rem;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.2);
}

.apply-form__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.6rem 1.4rem;
  border-radius: 9999px;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, opacity 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn--ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--on-surface-variant);
}

.btn--primary {
  background: rgba(255, 183, 125, 0.12);
  border: 1px solid rgba(255, 183, 125, 0.3);
  color: var(--primary-dim);
  min-width: 9rem;
  justify-content: center;
}

.btn--primary:not(:disabled):hover {
  background: rgba(255, 183, 125, 0.22);
  border-color: rgba(255, 183, 125, 0.5);
}

.spinner {
  display: inline-block;
  width: 0.9rem;
  height: 0.9rem;
  border: 2px solid rgba(255, 183, 125, 0.3);
  border-top-color: var(--primary-dim);
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
