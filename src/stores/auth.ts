import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '@/api/auth'
import { useMocks } from '@/api/client'
import type { AuthUser, UserRole } from '@/types'

const STUB_USERS: Record<UserRole, AuthUser> = {
  admin: { id: 1, name: 'Admin User', email: 'admin@talentgate.test', role: 'admin' },
  employer: { id: 2, name: 'Employer Co', email: 'employer@talentgate.test', role: 'employer' },
  candidate: { id: 3, name: 'Jane Candidate', email: 'candidate@talentgate.test', role: 'candidate' },
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const role = computed(() => user.value?.role ?? null)

  async function init() {
    if (useMocks()) {
      initialized.value = true
      return
    }
    user.value = await authApi.fetchCurrentUser()
    initialized.value = true
  }

  function loginAs(roleKey: UserRole) {
    user.value = STUB_USERS[roleKey]
    localStorage.setItem('tg_user', JSON.stringify(user.value))
  }

  async function login(email: string, password: string) {
    user.value = await authApi.login(email, password)
    localStorage.setItem('tg_user', JSON.stringify(user.value))
  }

  async function logout() {
    if (!useMocks()) {
      await authApi.logout()
    }
    user.value = null
    localStorage.removeItem('tg_user')
  }

  function hasRole(required: UserRole | UserRole[]): boolean {
    if (!user.value) return false
    const roles = Array.isArray(required) ? required : [required]
    return roles.includes(user.value.role)
  }

  return {
    user,
    initialized,
    isAuthenticated,
    role,
    init,
    loginAs,
    login,
    logout,
    hasRole,
  }
})
