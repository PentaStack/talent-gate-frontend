import api, { useMocks } from '@/api/client'
import {
  mapNotification,
  type BackendNotification,
} from '@/api/mappers/dev5'
import {
  getMockNotifications,
  getMockUnreadCount,
  mockMarkAllRead,
  mockMarkRead,
} from '@/api/mocks/dev5'
import type { AppNotification } from '@/types'

export async function fetchNotifications(): Promise<AppNotification[]> {
  if (useMocks()) {
    await delay(200)
    return getMockNotifications()
  }
  const { data } = await api.get<{ data: BackendNotification[] }>('/notifications')
  return (data.data ?? []).map(mapNotification)
}

export async function fetchUnreadCount(): Promise<number> {
  if (useMocks()) {
    return getMockUnreadCount()
  }
  const items = await fetchNotifications()
  return items.filter((n) => !n.read).length
}

export async function markRead(id: string | number): Promise<void> {
  if (useMocks()) {
    mockMarkRead(id)
    return
  }
  await api.patch(`/notifications/${id}/read`)
}

export async function markAllRead(): Promise<void> {
  if (useMocks()) {
    mockMarkAllRead()
    return
  }
  await api.post('/notifications/read-all')
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
