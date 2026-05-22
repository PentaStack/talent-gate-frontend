<script setup lang="ts">
import { useNotificationsStore } from '@/stores/notifications'
import BaseButton from '@/components/shared/BaseButton.vue'

const store = useNotificationsStore()

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

async function handleMarkRead(id: string | number) {
  await store.markRead(id)
}

async function handleMarkAll() {
  await store.markAllRead()
}
</script>

<template>
  <div class="notif-list">
    <div class="notif-list__header">
      <span class="notif-list__title font-display">Notifications</span>
      <BaseButton v-if="store.unreadCount > 0" variant="ghost" size="sm" @click="handleMarkAll">
        Mark all read
      </BaseButton>
    </div>
    <div v-if="store.loading" class="notif-list__empty">Loading…</div>
    <div v-else-if="store.items.length === 0" class="notif-list__empty">No notifications</div>
    <ul v-else class="notif-list__items">
      <li
        v-for="item in store.items"
        :key="item.id"
        class="notif-item"
        :class="{ 'notif-item--unread': !item.read }"
        @click="handleMarkRead(item.id)"
      >
        <div class="notif-item__title">{{ item.title }}</div>
        <div class="notif-item__body">{{ item.body }}</div>
        <div class="notif-item__meta">{{ formatTime(item.created_at) }}</div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.notif-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
}
.notif-list__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--on-surface);
}
.notif-list__empty {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--on-surface-variant);
  font-size: 0.85rem;
}
.notif-list__items {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 380px;
  overflow-y: auto;
}
.notif-item {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background 0.15s;
}
.notif-item:hover {
  background: rgba(58, 51, 47, 0.3);
}
.notif-item--unread {
  background: rgba(255, 183, 125, 0.06);
  border-left: 2px solid var(--primary-dim);
}
.notif-item__title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--on-surface);
  margin-bottom: 0.2rem;
}
.notif-item__body {
  font-size: 0.8rem;
  color: var(--on-surface-variant);
  line-height: 1.45;
}
.notif-item__meta {
  font-size: 0.7rem;
  color: var(--on-surface-variant);
  opacity: 0.7;
  margin-top: 0.35rem;
  font-family: var(--font-mono),serif;
}
</style>
