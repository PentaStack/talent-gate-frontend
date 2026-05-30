<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchComments, postComment, deleteComment } from '@/api/comments'
import type { JobComment, PaginatedResponse } from '@/types'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ jobId: number }>()

const auth = useAuthStore()
const comments = ref<JobComment[]>([])
const loading = ref(true)
const submitting = ref(false)
const newComment = ref('')

onMounted(async () => {
  await loadComments()
})

async function loadComments() {
  loading.value = true
  try {
    const res = await fetchComments(props.jobId)
    comments.value = res.data
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!newComment.value.trim() || submitting.value) return

  submitting.value = true
  try {
    const comment = await postComment(props.jobId, newComment.value)
    comments.value.unshift(comment)
    newComment.value = ''
  } finally {
    submitting.value = false
  }
}

async function remove(id: number) {
  if (!confirm('Delete this comment?')) return
  await deleteComment(id)
  comments.value = comments.value.filter((c) => c.id !== id)
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}
</script>

<template>
  <div class="comments-section glass-panel">
    <h3 class="section-title">
      <span class="material-symbols-outlined">forum</span> Discussion
    </h3>

    <div v-if="auth.isAuthenticated" class="comment-composer">
      <div class="avatar">
        {{ auth.user?.name.charAt(0) }}
      </div>
      <div class="composer-body">
        <textarea
          v-model="newComment"
          placeholder="Ask a question or share a thought..."
          rows="2"
          class="composer-input"
          @keydown.ctrl.enter="submit"
        />
        <div class="composer-footer">
          <span class="composer-hint">Ctrl + Enter to post</span>
          <button class="btn btn-primary" :disabled="submitting || !newComment.trim()" @click="submit">
            {{ submitting ? 'Posting...' : 'Post Comment' }}
          </button>
        </div>
      </div>
    </div>
    <div v-else class="login-prompt">
      <router-link :to="{ name: 'login', query: { redirect: $route.fullPath } }">Log in</router-link> to join the discussion.
    </div>

    <div v-if="loading" class="loading-state">Loading comments...</div>
    <div v-else-if="comments.length === 0" class="empty-state">
      No comments yet. Be the first to start the discussion!
    </div>
    <div v-else class="comments-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="avatar">
          <img v-if="comment.user.avatar_url" :src="comment.user.avatar_url" :alt="comment.user.name" />
          <span v-else>{{ comment.user.name.charAt(0) }}</span>
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">{{ comment.user.name }}</span>
            <span v-if="comment.user.role === 'employer'" class="role-badge">Employer</span>
            <span class="comment-time">{{ timeAgo(comment.created_at) }}</span>
            <button
              v-if="comment.is_owner || auth.hasRole('admin')"
              class="btn-delete"
              title="Delete comment"
              @click="remove(comment.id)"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
          <p class="comment-body">{{ comment.body }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comments-section {
  padding: 1.5rem;
  border-radius: 1rem;
  display: grid;
  gap: 1.5rem;
}

.section-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-display), serif;
  font-size: 1.2rem;
  color: var(--on-surface);
}

.comment-composer {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 183, 125, 0.1);
  color: var(--primary-dim);
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.composer-body {
  flex: 1;
  display: grid;
  gap: 0.5rem;
}

.composer-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: var(--on-surface);
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
}

.composer-input:focus {
  outline: none;
  border-color: var(--primary-dim);
}

.composer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.composer-hint {
  font-size: 0.75rem;
  color: var(--on-surface-variant);
}

.btn-primary {
  background: var(--primary-dim);
  color: #000;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-prompt {
  text-align: center;
  padding: 1rem;
  color: var(--on-surface-variant);
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
}

.login-prompt a {
  color: var(--primary-dim);
  text-decoration: none;
}

.loading-state,
.empty-state {
  text-align: center;
  color: var(--on-surface-variant);
  padding: 1rem 0;
  font-size: 0.9rem;
}

.comments-list {
  display: grid;
  gap: 1.25rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.comment-author {
  font-weight: 600;
  color: var(--on-surface);
  font-size: 0.9rem;
}

.role-badge {
  font-size: 0.65rem;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  background: rgba(134, 239, 172, 0.1);
  color: #86efac;
  text-transform: uppercase;
  font-weight: 700;
}

.comment-time {
  font-size: 0.75rem;
  color: var(--on-surface-variant);
}

.btn-delete {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--on-surface-variant);
  cursor: pointer;
  padding: 0;
  display: grid;
  place-items: center;
}

.btn-delete:hover {
  color: #f87171;
}

.btn-delete .material-symbols-outlined {
  font-size: 1rem;
}

.comment-body {
  margin: 0;
  font-size: 0.9rem;
  color: var(--on-surface-variant);
  line-height: 1.5;
  white-space: pre-wrap;
}
</style>
