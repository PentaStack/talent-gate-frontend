<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NotificationBell from '@/components/notifications/NotificationBell.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

interface NavItem {
  to: string
  label: string
  icon: string
}

const navLinks = computed<NavItem[]>(() => {
  if (!auth.user) return []
  if (auth.user.role === 'admin') {
    return [
      { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/admin/users', label: 'Users', icon: 'group' },
    ]
  }
  if (auth.user.role === 'employer') {
    return [
      { to: '/employer/jobs', label: 'My Jobs', icon: 'work' },
      { to: '/employer/analytics', label: 'Analytics', icon: 'analytics' },
      { to: '/profile/edit', label: 'Company Profile', icon: 'corporate_fare' },
      { to: '/payments/history', label: 'Payments', icon: 'payments' },
    ]
  }
  if (auth.user.role === 'candidate') {
    return [
      { to: '/jobs', label: 'Find Jobs', icon: 'work_history' },
      { to: '/applications', label: 'My Applications', icon: 'description' },
      { to: '/profile/edit', label: 'My Profile', icon: 'person' },
    ]
  }
  return []
})

const consoleLabel = computed(() => {
  if (auth.user?.role === 'admin') return 'Admin Console'
  if (auth.user?.role === 'employer') return 'Employer Portal'
  return 'Talent Gate'
})

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

async function logout() {
  await auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="app-shell">
    <!-- Sidebar (desktop) -->
    <nav v-if="auth.isAuthenticated" class="sidebar">
      <div class="sidebar__brand">
        <router-link to="/" class="sidebar__logo font-display">Talent Gate</router-link>
        <p class="sidebar__tag">{{ consoleLabel }}</p>
      </div>

      <div class="sidebar__nav">
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="sidebar__link"
          :class="{ 'sidebar__link--active': isActive(link.to) }"
        >
          <span class="material-symbols-outlined" :class="{ filled: isActive(link.to) }">{{ link.icon }}</span>
          <span>{{ link.label }}</span>
        </router-link>
      </div>

      <div class="sidebar__footer">
        <router-link
          v-if="auth.user"
          :to="`/profile/${auth.user.id}`"
          class="sidebar__user"
        >
          <div class="sidebar__avatar">{{ auth.user.name.charAt(0) }}</div>
          <div>
            <p class="sidebar__user-name">{{ auth.user.name }}</p>
            <p class="sidebar__user-role">{{ auth.user.role }}</p>
          </div>
        </router-link>
        <button type="button" class="sidebar__logout" @click="logout">
          <span class="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </nav>

    <!-- Main column -->
    <div class="main-col" :class="{ 'main-col--full': !auth.isAuthenticated }">
      <header v-if="auth.isAuthenticated" class="topbar">
        <h2 class="topbar__title font-display">{{ consoleLabel }}</h2>
        <div class="topbar__actions">
          <NotificationBell />
        </div>
      </header>

      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  background: var(--bg-ink);
}

.sidebar {
  display: none;
  width: var(--sidebar-width);
  flex-shrink: 0;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 50;
  padding: 1.5rem 1rem;
  background: rgba(18, 18, 20, 0.85);
  backdrop-filter: blur(16px);
  border-right: 1px solid var(--border-subtle);
  box-shadow: 0 0 20px rgba(255, 183, 125, 0.05);
}

@media (min-width: 768px) {
  .sidebar {
    display: flex;
  }
}

.sidebar__brand {
  padding: 0 0.5rem 1.5rem;
}
.sidebar__logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  text-decoration: none;
  display: block;
}
.sidebar__tag {
  margin: 0.35rem 0 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--on-surface-variant);
}

.sidebar__nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0 0.25rem;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  color: var(--on-surface-variant);
  text-decoration: none;
  font-size: 0.95rem;
  transition: background 0.2s, color 0.2s;
}
.sidebar__link:hover {
  background: rgba(58, 51, 47, 0.4);
  color: var(--on-surface);
}
.sidebar__link--active {
  color: var(--primary);
  background: rgba(255, 183, 125, 0.1);
  border-right: 2px solid var(--primary-dim);
}

.sidebar__footer {
  border-top: 1px solid var(--border-subtle);
  padding-top: 1rem;
  margin-top: auto;
}
.sidebar__user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.5rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  margin-bottom: 0.5rem;
}
.sidebar__user:hover {
  background: rgba(255, 183, 125, 0.08);
}
.sidebar__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--surface-variant);
  border: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--primary);
}
.sidebar__user-name {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--on-surface);
}
.sidebar__user-role {
  margin: 0;
  font-size: 0.7rem;
  text-transform: capitalize;
  color: var(--primary-dim);
}
.sidebar__logout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem 1rem;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--on-surface-variant);
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.sidebar__logout:hover {
  background: rgba(58, 51, 47, 0.4);
  color: var(--on-surface);
}

.main-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
@media (min-width: 768px) {
  .main-col {
    margin-left: var(--sidebar-width);
  }
}
.main-col--full {
  margin-left: 0;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--gutter);
  background: rgba(18, 18, 20, 0.75);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle);
}
.topbar__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary);
  margin: 0;
}
.topbar__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.main-content {
  flex: 1;
  padding: var(--gutter);
  max-width: 1280px;
  width: 100%;
}
@media (min-width: 768px) {
  .main-content {
    padding: var(--margin-desktop) var(--gutter);
  }
}
</style>
