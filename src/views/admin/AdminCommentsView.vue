<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { fetchAdminComments, hideComment, deleteAdminComment } from '@/api/admin'
import type { AdminComment } from '@/types'

const comments = ref<AdminComment[]>([])
const isLoading = ref(true)
const currentFilter = ref<'all' | 'hidden'>('all')

onMounted(async () => {
  await loadComments()
})

async function loadComments() {
  isLoading.value = true
  try {
    const filterValue = currentFilter.value === 'hidden' ? 'hidden' : undefined
    const res = await fetchAdminComments(1, filterValue)
    comments.value = res.data
  } finally {
    isLoading.value = false
  }
}

async function setFilter(filter: 'all' | 'hidden') {
  currentFilter.value = filter
  await loadComments()
}

async function toggleHide(comment: AdminComment) {
  try {
    const updated = await hideComment(comment.id)
    comment.is_hidden = updated.is_hidden
  } catch (e) {
    //
  }
}

async function remove(id: number) {
  if (!confirm('Permanently delete this comment?')) return
  await deleteAdminComment(id)
  comments.value = comments.value.filter((c) => c.id !== id)
}
</script>

<template>
  <AppLayout>
    <div class="admin-comments-page">
      <header class="page-header">
        <div>
          <p class="kicker">Admin Console</p>
          <h1 class="page-title">Comment Moderation</h1>
          <p class="page-subtitle">Manage discussions across all job listings.</p>
        </div>
      </header>

      <div class="glass-panel main-panel">
        <div class="panel-header">
          <div class="tabs">
            <button
              class="tab"
              :class="{ 'tab--active': currentFilter === 'all' }"
              @click="setFilter('all')"
            >
              All Comments
            </button>
            <button
              class="tab"
              :class="{ 'tab--active': currentFilter === 'hidden' }"
              @click="setFilter('hidden')"
            >
              Hidden
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="loading-state">Loading comments...</div>
        <div v-else-if="comments.length === 0" class="empty-state">
          <span class="material-symbols-outlined">forum</span>
          <p>No comments found.</p>
        </div>
        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Author</th>
                <th>Job</th>
                <th>Comment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="comment in comments" :key="comment.id">
                <td class="cell-date">{{ new Date(comment.created_at).toLocaleDateString() }}</td>
                <td class="cell-author">{{ comment.user.name }}</td>
                <td class="cell-job">
                  <router-link :to="{ name: 'job-detail', params: { jobId: comment.job.id } }">
                    {{ comment.job.title }}
                  </router-link>
                </td>
                <td class="cell-body">{{ comment.body }}</td>
                <td>
                  <span class="status-chip" :class="comment.is_hidden ? 'status--hidden' : 'status--visible'">
                    {{ comment.is_hidden ? 'Hidden' : 'Visible' }}
                  </span>
                </td>
                <td class="cell-actions">
                  <button
                    class="btn-action"
                    :title="comment.is_hidden ? 'Unhide' : 'Hide'"
                    @click="toggleHide(comment)"
                  >
                    <span class="material-symbols-outlined">
                      {{ comment.is_hidden ? 'visibility' : 'visibility_off' }}
                    </span>
                  </button>
                  <button class="btn-action btn-danger" title="Delete permanently" @click="remove(comment.id)">
                    <span class="material-symbols-outlined">delete_forever</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.admin-comments-page {
  display: grid;
  gap: 1.75rem;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.kicker {
  margin: 0 0 0.25rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--primary-dim);
}
.page-title {
  margin: 0 0 0.25rem;
  font-family: var(--font-display), serif;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  color: var(--on-surface);
}
.page-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: var(--on-surface-variant);
}

.glass-panel {
  background: rgba(26, 26, 28, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 183, 125, 0.15);
  border-radius: 1rem;
  overflow: hidden;
}

.panel-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(18, 18, 20, 0.4);
}

.tabs {
  display: flex;
  gap: 1rem;
}

.tab {
  background: none;
  border: none;
  color: var(--on-surface-variant);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 0;
  position: relative;
}

.tab:hover {
  color: var(--on-surface);
}

.tab--active {
  color: var(--primary-dim);
}

.tab--active::after {
  content: '';
  position: absolute;
  bottom: -1rem;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-dim);
}

.loading-state,
.empty-state {
  padding: 4rem;
  text-align: center;
  color: var(--on-surface-variant);
}

.empty-state .material-symbols-outlined {
  font-size: 3rem;
  color: var(--primary-dim);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0;
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.9rem;
}

.data-table th {
  color: var(--on-surface-variant);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.02);
}

.cell-date {
  color: var(--on-surface-variant);
  white-space: nowrap;
}

.cell-author {
  font-weight: 600;
  color: var(--on-surface);
  white-space: nowrap;
}

.cell-job a {
  color: var(--primary-dim);
  text-decoration: none;
  display: block;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-job a:hover {
  text-decoration: underline;
}

.cell-body {
  color: var(--on-surface-variant);
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-chip {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status--visible {
  background: rgba(134, 239, 172, 0.1);
  color: #86efac;
}

.status--hidden {
  background: rgba(248, 113, 113, 0.1);
  color: #f87171;
}

.cell-actions {
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;
}

.btn-action {
  background: none;
  border: none;
  color: var(--on-surface-variant);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 0.5rem;
  display: grid;
  place-items: center;
  transition: background 0.2s, color 0.2s;
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--on-surface);
}

.btn-danger:hover {
  background: rgba(248, 113, 113, 0.1);
  color: #f87171;
}

.btn-action .material-symbols-outlined {
  font-size: 1.25rem;
}
</style>
