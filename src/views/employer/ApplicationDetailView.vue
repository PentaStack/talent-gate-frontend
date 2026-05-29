<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppLayout from "@/layouts/AppLayout.vue";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge.vue";
import EmployerStatusActions from "@/components/applications/EmployerStatusActions.vue";
import {
    getApplication,
    updateApplicationStatus,
    updateApplicationNotes,
    fetchApplicationResume,
} from "@/api/applications";
import { useToast } from "@/composables/useToast";
import type { ApplicationStatus, EmployerApplicationListItem } from "@/types";

const route = useRoute();
const router = useRouter();
const { show: showToast } = useToast();

const applicationId = Number(route.params.applicationId);
const jobId = route.query.jobId ? Number(route.query.jobId) : null;

const application = ref<EmployerApplicationListItem | null>(null);
const isLoading = ref(true);
const actionsRef = ref<InstanceType<typeof EmployerStatusActions> | null>(null);
const notesValue = ref<string>("");
const isSavingNotes = ref(false);

type ResumeState = "loading" | "pdf" | "unsupported" | "error";
const resumeState = ref<ResumeState>("loading");
const resumeUrl = ref<string | null>(null);

async function loadResume() {
    resumeState.value = "loading";
    try {
        const blob = await fetchApplicationResume(applicationId);
        if (resumeUrl.value) URL.revokeObjectURL(resumeUrl.value);
        resumeUrl.value = URL.createObjectURL(blob);
        resumeState.value =
            blob.type === "application/pdf" ? "pdf" : "unsupported";
    } catch {
        resumeState.value = "error";
    }
}

function openResumeInTab() {
    if (resumeUrl.value) window.open(resumeUrl.value, "_blank", "noopener");
}

onMounted(async () => {
    try {
        application.value = await getApplication(applicationId);
        notesValue.value = application.value.notes ?? "";
        if (application.value.candidate.has_resume) {
            loadResume();
        }
    } finally {
        isLoading.value = false;
    }
});

onBeforeUnmount(() => {
    if (resumeUrl.value) URL.revokeObjectURL(resumeUrl.value);
});

async function handleStatusUpdate(newStatus: ApplicationStatus) {
    try {
        const updated = await updateApplicationStatus(applicationId, newStatus);
        application.value = updated;
        showToast(`Status updated to ${newStatus}.`, "success");
    } catch {
        showToast("Failed to update status.", "error");
    } finally {
        actionsRef.value?.done();
    }
}

async function saveNotes() {
    if (isSavingNotes.value) return;
    isSavingNotes.value = true;
    try {
        const updated = await updateApplicationNotes(
            applicationId,
            notesValue.value || null,
        );
        application.value = updated;
        showToast("Notes saved.", "success");
    } catch {
        showToast("Failed to save notes.", "error");
    } finally {
        isSavingNotes.value = false;
    }
}

function goBack() {
    if (jobId) {
        router.push(`/employer/jobs/${jobId}/applications`);
    } else {
        router.back();
    }
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
</script>

<template>
    <AppLayout>
        <div class="adv-page">
            <button type="button" class="back-btn" @click="goBack">
                <span class="material-symbols-outlined">arrow_back</span>
                Back to Applications
            </button>

            <div v-if="isLoading" class="adv-loading">Loading…</div>

            <template v-else-if="application">
                <!-- ── Hero ─────────────────────────────────────────────────────────── -->
                <div class="hero glass-panel">
                    <div class="hero__left">
                        <div class="hero__avatar">
                            <img
                                v-if="application.candidate.avatar_url"
                                :src="application.candidate.avatar_url"
                                :alt="application.candidate.name"
                                class="hero__avatar-img"
                            />
                            <span v-else>{{
                                application.candidate.name.charAt(0)
                            }}</span>
                        </div>
                        <div class="hero__identity">
                            <div class="hero__name-row">
                                <h1 class="hero__name">
                                    {{ application.candidate.name }}
                                </h1>
                                <ApplicationStatusBadge
                                    :status="application.status"
                                />
                            </div>
                            <p class="hero__subtitle">
                                <span
                                    v-if="
                                        application.candidate.experience_level
                                    "
                                >
                                    {{ application.candidate.experience_level }}
                                    <span class="hero__dot">•</span>
                                </span>
                                Applied
                                {{ formatDate(application.submitted_at) }}
                            </p>
                        </div>
                    </div>
                    <div class="hero__actions">
                        <EmployerStatusActions
                            ref="actionsRef"
                            :current-status="application.status"
                            @update="handleStatusUpdate"
                        />
                        <p
                            v-if="
                                !['pending', 'shortlisted'].includes(
                                    application.status,
                                )
                            "
                            class="hero__terminal"
                        >
                            No further actions available.
                        </p>
                    </div>
                </div>

                <hr class="adv-divider" />

                <!-- ── Body ──────────────────────────────────────────────────────────── -->
                <div class="adv-body">
                    <!-- Left column -->
                    <div class="adv-main">
                        <div
                            v-if="application.candidate.bio"
                            class="bio-panel glass-panel"
                        >
                            <p class="panel-label">About</p>
                            <p class="bio-text">
                                {{ application.candidate.bio }}
                            </p>
                        </div>

                        <div class="cover-panel glass-panel">
                            <p class="panel-label">Cover Letter</p>
                            <pre class="cover-text">{{
                                application.cover_letter
                            }}</pre>
                        </div>

                        <div
                            v-if="application.candidate.has_resume"
                            class="resume-panel glass-panel"
                        >
                            <div class="resume-panel__head">
                                <p class="panel-label">Resume</p>
                                <button
                                    v-if="resumeState === 'pdf'"
                                    type="button"
                                    class="resume-open-btn"
                                    @click="openResumeInTab"
                                >
                                    <span class="material-symbols-outlined">open_in_new</span>
                                    Open in new tab
                                </button>
                            </div>

                            <div v-if="resumeState === 'loading'" class="resume-status">
                                <span class="spinner" />
                                <span>Loading resume…</span>
                            </div>

                            <iframe
                                v-else-if="resumeState === 'pdf'"
                                :src="resumeUrl!"
                                class="resume-frame"
                                title="Candidate resume"
                            />

                            <div v-else-if="resumeState === 'unsupported'" class="resume-status">
                                <span class="material-symbols-outlined">description</span>
                                <span>This resume can’t be previewed here.</span>
                                <button type="button" class="resume-open-btn" @click="openResumeInTab">
                                    <span class="material-symbols-outlined">open_in_new</span>
                                    Open in new tab
                                </button>
                            </div>

                            <div v-else class="resume-status">
                                <span class="material-symbols-outlined">error</span>
                                <span>Couldn’t load the resume.</span>
                                <button type="button" class="resume-open-btn" @click="loadResume">
                                    <span class="material-symbols-outlined">refresh</span>
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <aside class="adv-sidebar">
                        <!-- Contact -->
                        <div class="sidebar-panel glass-panel">
                            <p class="panel-label">Contact</p>
                            <a
                                :href="`mailto:${application.candidate.email}`"
                                class="contact-link"
                            >
                                <span class="material-symbols-outlined"
                                    >mail</span
                                >
                                {{ application.candidate.email }}
                            </a>
                            <p v-if="!application.candidate.has_resume" class="no-resume">
                                No resume uploaded.
                            </p>
                        </div>

                        <!-- Technical Skills -->
                        <div
                            v-if="application.candidate.skills?.length"
                            class="sidebar-panel glass-panel"
                        >
                            <p class="panel-label">Technical Skills</p>
                            <div class="skills-grid">
                                <span
                                    v-for="skill in application.candidate
                                        .skills"
                                    :key="skill"
                                    class="skill-chip"
                                    >{{ skill }}</span
                                >
                            </div>
                        </div>

                        <!-- Recruiter Notes -->
                        <div class="sidebar-panel glass-panel">
                            <p class="panel-label">Recruiter Notes</p>
                            <textarea
                                v-model="notesValue"
                                class="notes-area"
                                placeholder="Add private evaluation notes here…"
                                rows="5"
                                maxlength="5000"
                            />
                            <button
                                type="button"
                                class="save-btn"
                                :disabled="isSavingNotes"
                                @click="saveNotes"
                            >
                                {{ isSavingNotes ? "Saving…" : "Save Note" }}
                            </button>
                        </div>
                    </aside>
                </div>
            </template>
        </div>
    </AppLayout>
</template>

<style scoped>
.adv-page {
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

.adv-loading {
    color: var(--on-surface-variant);
    padding: 3rem;
    text-align: center;
}

/* ── Hero ─────────────────────────────────────────────────────────────── */
.glass-panel {
    background: rgba(26, 26, 28, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 183, 125, 0.15);
}

.hero {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.75rem 2rem;
    border-radius: 1.25rem;
    flex-wrap: wrap;
}

.hero__left {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    min-width: 0;
}

.hero__avatar {
    flex-shrink: 0;
    width: 4.5rem;
    height: 4.5rem;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
    display: grid;
    place-items: center;
    font-family: var(--font-display), serif;
    font-size: 1.6rem;
    color: var(--on-surface);
    overflow: hidden;
}

.hero__avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hero__identity {
    min-width: 0;
}

.hero__name-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.hero__name {
    margin: 0;
    font-family: var(--font-display), serif;
    font-size: clamp(1.4rem, 2.5vw, 1.9rem);
    font-weight: 700;
    color: var(--on-surface);
    line-height: 1.2;
}

.hero__subtitle {
    margin: 0.4rem 0 0;
    font-size: 0.88rem;
    color: var(--on-surface-variant);
}

.hero__dot {
    margin: 0 0.25rem;
    opacity: 0.5;
}

.hero__actions {
    flex-shrink: 0;
}

.hero__terminal {
    margin: 0.5rem 0 0;
    font-size: 0.82rem;
    color: var(--on-surface-variant);
    font-style: italic;
}

/* ── Divider ──────────────────────────────────────────────────────────── */
.adv-divider {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    margin: 0;
}

/* ── Body layout ──────────────────────────────────────────────────────── */
.adv-body {
    display: grid;
    gap: 1.25rem;
    align-items: start;
}

@media (min-width: 768px) {
    .adv-body {
        grid-template-columns: 1fr 280px;
    }
}

/* ── Left column ──────────────────────────────────────────────────────── */
.adv-main {
    display: grid;
    gap: 1rem;
}

.bio-panel,
.cover-panel,
.resume-panel {
    padding: 1.5rem;
    border-radius: 1.1rem;
}

.panel-label {
    margin: 0 0 0.85rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--on-surface-variant);
}

.bio-text {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.7;
    color: var(--on-surface);
}

.cover-text {
    margin: 0;
    font: inherit;
    font-size: 0.9rem;
    line-height: 1.7;
    color: var(--on-surface);
    white-space: pre-wrap;
    word-break: break-word;
}

/* ── Sidebar ──────────────────────────────────────────────────────────── */
.adv-sidebar {
    display: grid;
    gap: 1rem;
}

.sidebar-panel {
    padding: 1.25rem;
    border-radius: 1.1rem;
    display: grid;
    gap: 0.65rem;
}

.contact-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--primary-dim);
    font-size: 0.88rem;
    text-decoration: none;
    word-break: break-all;
    transition: opacity 0.2s;
}

.contact-link:hover {
    opacity: 0.75;
}
.contact-link .material-symbols-outlined {
    font-size: 1rem;
    flex-shrink: 0;
}

.resume-panel__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}

.resume-frame {
    width: 100%;
    height: 85vh;
    min-height: 700px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.65rem;
    background: #fff;
}

.resume-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    min-height: 220px;
    color: var(--on-surface-variant);
    font-size: 0.88rem;
    text-align: center;
}

.resume-status .material-symbols-outlined {
    font-size: 2rem;
}

.spinner {
    display: inline-block;
    width: 1.4rem;
    height: 1.4rem;
    border: 2px solid rgba(255, 183, 125, 0.3);
    border-top-color: var(--primary-dim);
    border-radius: 50%;
    animation: spin 0.65s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.resume-open-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.9rem;
    margin-bottom: 0.75rem;
    border-radius: 9999px;
    background: rgba(255, 183, 125, 0.08);
    border: 1px solid rgba(255, 183, 125, 0.25);
    color: var(--primary-dim);
    font: inherit;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition:
        background 0.2s,
        border-color 0.2s;
    width: fit-content;
}

.resume-open-btn:hover {
    background: rgba(255, 183, 125, 0.16);
    border-color: rgba(255, 183, 125, 0.4);
}

.resume-open-btn .material-symbols-outlined {
    font-size: 1rem;
}

.no-resume {
    margin: 0;
    font-size: 0.82rem;
    color: var(--on-surface-variant);
    font-style: italic;
}

.skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.skill-chip {
    padding: 0.25rem 0.65rem;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
    color: var(--on-surface-variant);
    font-size: 0.78rem;
    font-weight: 500;
}

.notes-area {
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.65rem;
    color: var(--on-surface);
    font: inherit;
    font-size: 0.88rem;
    line-height: 1.6;
    padding: 0.65rem 0.85rem;
    resize: vertical;
    transition: border-color 0.2s;
    box-sizing: border-box;
}

.notes-area:focus {
    outline: none;
    border-color: rgba(255, 183, 125, 0.35);
}

.notes-area::placeholder {
    color: var(--on-surface-variant);
    opacity: 0.6;
}

.save-btn {
    padding: 0.45rem 1.1rem;
    border-radius: 9999px;
    background: rgba(255, 183, 125, 0.1);
    border: 1px solid rgba(255, 183, 125, 0.25);
    color: var(--primary-dim);
    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition:
        background 0.2s,
        border-color 0.2s,
        opacity 0.2s;
    width: fit-content;
}

.save-btn:not(:disabled):hover {
    background: rgba(255, 183, 125, 0.2);
    border-color: rgba(255, 183, 125, 0.45);
}

.save-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}
</style>
