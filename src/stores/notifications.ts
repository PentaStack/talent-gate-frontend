import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as notificationsApi from '@/api/notifications'
import type { AppNotification } from '@/types'

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<AppNotification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  let pollTimer: ReturnType<typeof setInterval> | null = null

  async function load() {
    loading.value = true
    try {
      items.value = await notificationsApi.fetchNotifications()
      unreadCount.value = await notificationsApi.fetchUnreadCount()
    } finally {
      loading.value = false
    }
  }

  async function refreshUnreadCount() {
    unreadCount.value = await notificationsApi.fetchUnreadCount()
  }

  async function markRead(id: string | number) {
    await notificationsApi.markRead(id)
    const item = items.value.find((n) => n.id === id)
    if (item && !item.read) {
      item.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  async function markAllRead() {
    await notificationsApi.markAllRead()
    items.value.forEach((n) => {
      n.read = true
    })
    unreadCount.value = 0
  }

  function startPolling(intervalMs = 60000) {
    stopPolling()
    pollTimer = setInterval(refreshUnreadCount, intervalMs)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  return {
    items,
    unreadCount,
    loading,
    load,
    refreshUnreadCount,
    markRead,
    markAllRead,
    startPolling,
    stopPolling,
  }
})
