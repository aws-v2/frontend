import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import authRoutes from '@/modules/auth/routes'
import dashboardRoutes from '@/modules/dashboard/routes'
import landingRoutes from '@/modules/landing/routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...landingRoutes,
    ...authRoutes,
    ...dashboardRoutes,
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isPublicOnly = to.matched.some(record => record.meta.publicOnly)

  if (requiresAuth && !authStore.isAuthenticated) {
    // Protected route + Not logged in -> Login
    next({ name: 'login' })
  } else if (isPublicOnly && authStore.isAuthenticated) {
    // Public route (Login/Register) + Logged in -> Dashboard
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router