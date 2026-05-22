import api, { useMocks } from '@/api/client'
import type { AuthUser } from '@/types'

export async function login(email: string, password: string): Promise<AuthUser> {
  if (useMocks()) {
    throw new Error('Use mock login buttons when VITE_USE_MOCKS=true')
  }
  const { data } = await api.post<{ user: AuthUser }>('/login', { email, password })
  return data.user
}

export async function logout(): Promise<void> {
  if (useMocks()) return
  await api.post('/logout')
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  if (useMocks()) return null
  try {
    const { data } = await api.get<{ user: AuthUser }>('/user')
    return data.user
  } catch {
    return null
  }
}
