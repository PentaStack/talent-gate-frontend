import api, { useMocks } from '@/api/client'
import {
  mapAdminStats,
  mapEmployerAnalytics,
  type BackendAdminStats,
  type BackendEmployerAnalytics,
} from '@/api/mappers/dev5'
import {
  getMockUsers,
  mockAdminStats,
  mockBanUser,
  mockEmployerAnalytics,
  mockPromoteUser,
} from '@/api/mocks/dev5'
import type { AdminStats, AdminUser, EmployerAnalytics, UserRole } from '@/types'

export async function fetchAdminStats(): Promise<AdminStats> {
  if (useMocks()) {
    await delay(300)
    return mockAdminStats
  }
  const { data } = await api.get<BackendAdminStats>('/admin/stats')
  return mapAdminStats(data)
}

export async function fetchUsers(): Promise<AdminUser[]> {
  if (useMocks()) {
    await delay(300)
    return getMockUsers()
  }
  const { data } = await api.get<{ data: AdminUser[] }>('/admin/users')
  return data.data ?? data
}

export async function banUser(id: number): Promise<void> {
  if (useMocks()) {
    await delay(200)
    mockBanUser(id)
    return
  }
  await api.patch(`/admin/users/${id}/ban`)
}

export async function promoteUser(id: number, role: UserRole): Promise<void> {
  if (useMocks()) {
    await delay(200)
    mockPromoteUser(id, role)
    return
  }
  await api.patch(`/admin/users/${id}`, { role })
}

export async function fetchEmployerAnalytics(): Promise<EmployerAnalytics> {
  if (useMocks()) {
    await delay(300)
    return mockEmployerAnalytics
  }
  const { data } = await api.get<BackendEmployerAnalytics>('/employer/analytics')
  return mapEmployerAnalytics(data)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
