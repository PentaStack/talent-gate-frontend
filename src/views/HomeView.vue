<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMocks } from '@/api/client'
import AppLayout from '@/layouts/AppLayout.vue'
import BaseButton from '@/components/shared/BaseButton.vue'
import { useToast } from '@/composables/useToast'
import type { UserRole } from '@/types'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { show: toast } = useToast()
const mocks = useMocks()

const email = ref('admin@talentgate.test')
const password = ref('password')
const loggingIn = ref(false)

const demoAccounts = [
  { role: 'admin' as UserRole, email: 'admin@talentgate.test', label: 'Admin', icon: 'admin_panel_settings' },
  { role: 'employer' as UserRole, email: 'employer@talentgate.test', label: 'Employer', icon: 'business_center' },
  { role: 'candidate' as UserRole, email: 'candidate@talentgate.test', label: 'Candidate', icon: 'person' },
]

function defaultRoute(role: UserRole): string {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'employer') return '/employer/analytics'
  return '/'
}

async function handleLogin() {
  loggingIn.value = true
  try {
    await auth.login(email.value, password.value)
    router.push((route.query.redirect as string) || defaultRoute(auth.user!.role))
    toast('Welcome back', 'success')
  } catch {
    toast('Login failed. Run: php artisan db:seed', 'error')
  } finally {
    loggingIn.value = false
  }
}

function quickFill(account: (typeof demoAccounts)[0]) {
  email.value = account.email
  password.value = 'password'
}

function loginAsMock(role: UserRole) {
  auth.loginAs(role)
  router.push(defaultRoute(role))
}
</script>

<template>
  <AppLayout>
    <div class="login-page">
      <div class="login-hero">
        <h1 class="login-hero__title font-display">Talent Gate</h1>
        <p class="login-hero__subtitle">
          Midnight Obsidian job board — connect talent with opportunity.
        </p>
      </div>

      <div v-if="!auth.isAuthenticated" class="login-card glass-panel">
        <h2 class="login-card__heading font-display">Sign in</h2>
        <p class="login-card__hint">
          {{ mocks ? 'Mock mode enabled' : 'Use seeded accounts (password: password)' }}
        </p>

        <template v-if="mocks">
          <div class="role-grid">
            <button
              v-for="account in demoAccounts"
              :key="account.role"
              type="button"
              class="role-card"
              @click="loginAsMock(account.role)"
            >
              <span class="material-symbols-outlined role-card__icon">{{ account.icon }}</span>
              <span class="role-card__label">{{ account.label }}</span>
            </button>
          </div>
        </template>
        <template v-else>
          <form class="login-form" @submit.prevent="handleLogin">
            <label class="login-form__field">
              <span>Email</span>
              <input v-model="email" type="email" class="input-field" required autocomplete="username" />
            </label>
            <label class="login-form__field">
              <span>Password</span>
              <input v-model="password" type="password" class="input-field" required autocomplete="current-password" />
            </label>
            <div class="login-form__quick">
              <span class="label-caps">Quick fill</span>
              <div class="quick-btns">
                <button
                  v-for="account in demoAccounts"
                  :key="account.email"
                  type="button"
                  class="quick-btn"
                  @click="quickFill(account)"
                >
                  {{ account.label }}
                </button>
              </div>
            </div>
            <BaseButton type="submit" size="lg" :disabled="loggingIn" class="login-form__submit">
              {{ loggingIn ? 'Signing in…' : 'Sign in' }}
            </BaseButton>
          </form>
        </template>
      </div>

      <div v-else class="login-welcome glass-panel">
        <p>Logged in as <strong>{{ auth.user?.name }}</strong></p>
        <p class="login-welcome__role">{{ auth.user?.role }}</p>
        <BaseButton v-if="auth.hasRole('admin')" @click="router.push('/admin/dashboard')">Admin Dashboard</BaseButton>
        <BaseButton v-if="auth.hasRole('employer')" @click="router.push('/employer/analytics')">Analytics</BaseButton>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.login-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 2rem 0 4rem;
}
.login-hero {
  text-align: center;
  margin-bottom: 2.5rem;
}
.login-hero__title {
  font-size: clamp(2.5rem, 6vw, 3.5rem);
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 0.75rem;
  text-shadow: 0 0 30px rgba(255, 183, 125, 0.2);
}
.login-hero__subtitle {
  color: var(--on-surface-variant);
  font-size: 1rem;
  margin: 0;
  line-height: 1.6;
}
.login-card {
  padding: 2rem;
}
.login-card__heading {
  font-size: 1.5rem;
  margin: 0 0 0.35rem;
  color: var(--on-surface);
}
.login-card__hint {
  font-size: 0.85rem;
  color: var(--on-surface-variant);
  margin: 0 0 1.5rem;
}
.role-grid {
  display: grid;
  gap: 0.75rem;
}
.role-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--on-surface);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  font-size: 1rem;
  font-weight: 600;
}
.role-card:hover {
  border-color: rgba(255, 183, 125, 0.4);
  background: rgba(255, 183, 125, 0.08);
}
.role-card__icon {
  color: var(--primary-dim);
  font-size: 1.5rem;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.login-form__field span {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  margin-bottom: 0.4rem;
}
.login-form__quick {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.quick-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.quick-btn {
  padding: 0.35rem 0.75rem;
  background: var(--surface-variant);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  color: var(--on-surface-variant);
  font-size: 0.75rem;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}
.quick-btn:hover {
  color: var(--primary);
  border-color: rgba(255, 183, 125, 0.35);
}
.login-form__submit {
  width: 100%;
  margin-top: 0.5rem;
}
.login-welcome {
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.login-welcome__role {
  text-transform: capitalize;
  color: var(--primary-dim);
  margin: 0;
}
</style>
