import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Talent Gate' },
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('@/views/admin/Dashboard.vue'),
      meta: { requiresAuth: true, role: 'admin' as UserRole, title: 'Admin Dashboard' },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/UserTable.vue'),
      meta: { requiresAuth: true, role: 'admin' as UserRole, title: 'User Management' },
    },
    {
      path: '/employer/analytics',
      name: 'employer-analytics',
      component: () => import('@/views/employer/Analytics.vue'),
      meta: { requiresAuth: true, role: 'employer' as UserRole, title: 'Analytics' },
    },
    {
      path: '/payments/checkout',
      name: 'checkout',
      component: () => import('@/views/payments/Checkout.vue'),
      meta: { requiresAuth: true, role: 'employer' as UserRole, title: 'Checkout' },
    },
    {
      path: '/payments/history',
      name: 'payment-history',
      component: () => import('@/views/payments/PaymentHistory.vue'),
      meta: { requiresAuth: true, role: 'employer' as UserRole, title: 'Payment History' },
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: () => import('@/views/UnauthorizedView.vue'),
      meta: { title: 'Unauthorized' },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  document.title = `${to.meta.title ?? 'Page'} | Talent Gate`

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'home', query: { redirect: to.fullPath } }
  }

  const requiredRole = to.meta.role as UserRole | undefined
  if (requiredRole && auth.isAuthenticated && !auth.hasRole(requiredRole)) {
    return { name: 'unauthorized' }
  }
})

export default router
