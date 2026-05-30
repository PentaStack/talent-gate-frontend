<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { createJob, type JobPayload } from '@/api/employer'
import { fetchCategories, fetchTechnologies, type Category, type Technology } from '@/api/jobs'

const router = useRouter()

const step = ref(1)
const isSubmitting = ref(false)
const error = ref<string | null>(null)

const categories = ref<Category[]>([])
const technologies = ref<Technology[]>([])
const techSearch = ref('')

const form = ref<JobPayload>({
  title: '',
  description: '',
  requirements: '',
  salary_range: '',
  work_type: 'onsite',
  location: '',
  category_id: null,
  application_deadline: '',
  technology_ids: [],
  status: 'pending',
})

onMounted(async () => {
  ;[categories.value, technologies.value] = await Promise.all([fetchCategories(), fetchTechnologies()])
})

const filteredTechs = computed(() => {
  const q = techSearch.value.toLowerCase()
  if (!q) return technologies.value
  return technologies.value.filter((t) => t.name.toLowerCase().includes(q))
})

function toggleTech(id: number) {
  const ids = form.value.technology_ids!
  const idx = ids.indexOf(id)
  idx === -1 ? ids.push(id) : ids.splice(idx, 1)
}

function isTechSelected(id: number) {
  return form.value.technology_ids!.includes(id)
}

const selectedTechNames = computed(() =>
  technologies.value.filter((t) => form.value.technology_ids!.includes(t.id)).map((t) => t.name),
)

function nextStep() {
  if (step.value < 3) step.value++
}
function prevStep() {
  if (step.value > 1) step.value--
}

async function submit(asDraft = false) {
  isSubmitting.value = true
  error.value = null
  try {
    const payload = { ...form.value, status: asDraft ? 'draft' : 'pending' }
    await createJob(payload)
    router.push({ name: 'employer-jobs' })
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Something went wrong.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="create-job-page">
      <header class="page-header">
        <p class="kicker">Employer Portal</p>
        <h1>Post New Position</h1>
        <p class="subtitle">Define the role, requirements, and attract top-tier talent.</p>
      </header>

      <!-- Step indicator -->
      <div class="step-bar glass-panel">
        <div
          v-for="n in 3"
          :key="n"
          class="step-item"
          :class="{ active: step === n, done: step > n }"
        >
          <div class="step-bubble">
            <span v-if="step > n" class="material-symbols-outlined">check</span>
            <span v-else>{{ n }}</span>
          </div>
          <span class="step-label">{{ ['Basics', 'Requirements', 'Review'][n - 1] }}</span>
        </div>
        <div class="step-line" />
      </div>

      <form class="job-form glass-panel" @submit.prevent>
        <!-- STEP 1: Basics -->
        <section v-if="step === 1" class="form-step">
          <div class="field-grid-2">
            <div class="field">
              <label for="title">Job Title</label>
              <input id="title" v-model="form.title" type="text" placeholder="e.g. Senior Rust Engineer" required />
            </div>
            <div class="field">
              <label for="category">Category</label>
              <div class="select-wrap">
                <select id="category" v-model="form.category_id">
                  <option :value="null">Select category…</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
                <span class="material-symbols-outlined select-icon">expand_more</span>
              </div>
            </div>
            <div class="field">
              <label for="work_type">Work Type</label>
              <div class="select-wrap">
                <select id="work_type" v-model="form.work_type">
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <span class="material-symbols-outlined select-icon">public</span>
              </div>
            </div>
            <div class="field">
              <label for="location">Location</label>
              <input id="location" v-model="form.location" type="text" placeholder="e.g. San Francisco, CA" />
            </div>
            <div class="field">
              <label for="salary">Salary Range</label>
              <input id="salary" v-model="form.salary_range" type="text" placeholder="e.g. $140k – $180k" />
            </div>
            <div class="field">
              <label for="deadline">Application Deadline</label>
              <input id="deadline" v-model="form.application_deadline" type="date" required />
            </div>
          </div>
          <div class="step-actions">
            <button type="button" class="btn-primary" @click="nextStep">Next <span class="material-symbols-outlined">arrow_forward</span></button>
          </div>
        </section>

        <!-- STEP 2: Requirements -->
        <section v-if="step === 2" class="form-step">
          <div class="field">
            <label for="description">Role Description</label>
            <textarea id="description" v-model="form.description" rows="7" placeholder="Outline responsibilities, expectations, and the impact of this role…" required />
          </div>
          <div class="field">
            <label for="requirements">Requirements</label>
            <textarea id="requirements" v-model="form.requirements" rows="5" placeholder="List key qualifications, experience, and must-have skills…" />
          </div>

          <div class="field">
            <label>Technologies</label>
            <div class="tech-search-wrap">
              <span class="material-symbols-outlined">search</span>
              <input v-model="techSearch" type="text" placeholder="Filter technologies…" />
            </div>
            <div class="tech-grid">
              <button
                v-for="tech in filteredTechs"
                :key="tech.id"
                type="button"
                class="tech-chip"
                :class="{ selected: isTechSelected(tech.id) }"
                @click="toggleTech(tech.id)"
              >
                {{ tech.name }}
              </button>
            </div>
            <p class="field-hint">{{ form.technology_ids!.length }} selected</p>
          </div>

          <div class="step-actions">
            <button type="button" class="btn-ghost" @click="prevStep"><span class="material-symbols-outlined">arrow_back</span> Back</button>
            <button type="button" class="btn-primary" @click="nextStep">Review <span class="material-symbols-outlined">arrow_forward</span></button>
          </div>
        </section>

        <!-- STEP 3: Review -->
        <section v-if="step === 3" class="form-step">
          <div class="review-grid">
            <div class="review-card glass-panel">
              <p class="review-label">Job Title</p>
              <p class="review-value">{{ form.title || '—' }}</p>
            </div>
            <div class="review-card glass-panel">
              <p class="review-label">Work Type</p>
              <p class="review-value capitalize">{{ form.work_type }}</p>
            </div>
            <div class="review-card glass-panel">
              <p class="review-label">Location</p>
              <p class="review-value">{{ form.location || 'Not specified' }}</p>
            </div>
            <div class="review-card glass-panel">
              <p class="review-label">Salary Range</p>
              <p class="review-value">{{ form.salary_range || 'Not specified' }}</p>
            </div>
            <div class="review-card glass-panel">
              <p class="review-label">Deadline</p>
              <p class="review-value">{{ form.application_deadline || '—' }}</p>
            </div>
            <div class="review-card glass-panel">
              <p class="review-label">Technologies</p>
              <p class="review-value">{{ selectedTechNames.join(', ') || 'None' }}</p>
            </div>
          </div>

          <div class="review-description glass-panel">
            <p class="review-label">Description</p>
            <p class="review-body">{{ form.description }}</p>
          </div>

          <p v-if="error" class="form-error">{{ error }}</p>

          <div class="step-actions">
            <button type="button" class="btn-ghost" @click="prevStep"><span class="material-symbols-outlined">arrow_back</span> Back</button>
            <button type="button" class="btn-ghost" :disabled="isSubmitting" @click="submit(true)">
              <span class="material-symbols-outlined">draft</span> Save Draft
            </button>
            <button type="button" class="btn-primary" :disabled="isSubmitting" @click="submit(false)">
              <span>{{ isSubmitting ? 'Submitting…' : 'Submit for Review' }}</span>
              <span class="material-symbols-outlined">send</span>
            </button>
          </div>
        </section>
      </form>
    </div>
  </AppLayout>
</template>

<style scoped>
.create-job-page {
  display: grid;
  gap: 2rem;
  max-width: 860px;
  margin: 0 auto;
}

.page-header { display: grid; gap: 0.35rem; }

.kicker {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--primary-dim);
}

h1 {
  margin: 0;
  font-family: var(--font-display), serif;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  color: var(--on-surface);
}

.subtitle { margin: 0; color: var(--on-surface-variant); font-size: 1rem; }

/* Step bar */
.step-bar {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 1rem 2rem;
  border-radius: 9999px;
  position: relative;
  overflow: hidden;
}

.step-line {
  position: absolute;
  top: 50%;
  left: 15%;
  right: 15%;
  height: 1px;
  background: rgba(255, 183, 125, 0.15);
  z-index: 0;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.step-bubble {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: 2px solid rgba(255, 183, 125, 0.2);
  background: rgba(255, 255, 255, 0.03);
  display: grid;
  place-items: center;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--on-surface-variant);
  transition: all 0.25s;
}

.step-bubble .material-symbols-outlined { font-size: 1rem; }

.step-item.active .step-bubble {
  border-color: var(--primary-dim);
  background: rgba(255, 183, 125, 0.12);
  color: var(--primary-dim);
  box-shadow: 0 0 12px rgba(255, 183, 125, 0.25);
}

.step-item.done .step-bubble {
  border-color: #86efac;
  background: rgba(134, 239, 172, 0.1);
  color: #86efac;
}

.step-label { font-size: 0.82rem; font-weight: 600; color: var(--on-surface-variant); }
.step-item.active .step-label { color: var(--on-surface); }

/* Form */
.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 183, 125, 0.15);
}

.job-form {
  border-radius: 1.25rem;
  padding: 2.5rem;
}

.form-step { display: grid; gap: 1.75rem; }

.field-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }

@media (max-width: 600px) { .field-grid-2 { grid-template-columns: 1fr; } }

.field { display: grid; gap: 0.45rem; }

label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--on-surface-variant);
}

input, textarea, select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 0.85rem 1.25rem;
  color: var(--on-surface);
  font: inherit;
  font-size: 0.95rem;
  width: 100%;
  outline: none;
  transition: border-color 0.25s, box-shadow 0.25s;
  color-scheme: dark;
}

textarea { border-radius: 1rem; resize: vertical; }

input:focus, textarea:focus, select:focus {
  border-color: rgba(255, 183, 125, 0.5);
  box-shadow: 0 0 16px rgba(255, 183, 125, 0.15);
}

.select-wrap { position: relative; }
.select-wrap select { appearance: none; cursor: pointer; }
.select-icon {
  position: absolute;
  right: 1.1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--on-surface-variant);
  pointer-events: none;
  font-size: 1.1rem;
}

/* Tech chips */
.tech-search-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  padding: 0.6rem 1rem;
  margin-bottom: 0.85rem;
}

.tech-search-wrap .material-symbols-outlined { font-size: 1.1rem; color: var(--on-surface-variant); }

.tech-search-wrap input {
  background: transparent;
  border: none;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
  font-size: 0.9rem;
}

.tech-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.tech-chip {
  padding: 0.35rem 0.9rem;
  border-radius: 9999px;
  border: 1px solid rgba(201, 190, 255, 0.2);
  background: transparent;
  color: var(--on-surface-variant);
  font: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tech-chip:hover { border-color: rgba(201, 190, 255, 0.45); color: var(--on-surface); }

.tech-chip.selected {
  background: rgba(201, 190, 255, 0.12);
  border-color: rgba(201, 190, 255, 0.5);
  color: #c9beff;
}

.field-hint { margin: 0; font-size: 0.78rem; color: var(--on-surface-variant); opacity: 0.7; }

/* Review */
.review-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }

.review-card { padding: 1rem 1.25rem; border-radius: 1rem; }

.review-label { margin: 0 0 0.3rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--on-surface-variant); }
.review-value { margin: 0; font-size: 0.95rem; color: var(--on-surface); }
.capitalize { text-transform: capitalize; }

.review-description { padding: 1.25rem; border-radius: 1rem; }
.review-body { margin: 0.5rem 0 0; font-size: 0.92rem; color: var(--on-surface-variant); line-height: 1.65; white-space: pre-wrap; }

/* Actions */
.step-actions { display: flex; gap: 0.85rem; justify-content: flex-end; flex-wrap: wrap; padding-top: 0.5rem; border-top: 1px solid rgba(255, 183, 125, 0.1); }

.btn-primary, .btn-ghost {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.7rem 1.6rem;
  border-radius: 9999px;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-dim);
  color: #0A0A0B;
  border: none;
}

.btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--on-surface);
}

.btn-ghost:hover:not(:disabled) { border-color: rgba(255, 255, 255, 0.28); background: rgba(255, 255, 255, 0.05); }
.btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary .material-symbols-outlined,
.btn-ghost .material-symbols-outlined { font-size: 1.05rem; }

.form-error {
  padding: 0.75rem 1.1rem;
  border-radius: 0.75rem;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.25);
  color: #f87171;
  font-size: 0.88rem;
  margin: 0;
}
</style>
