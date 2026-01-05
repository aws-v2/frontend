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
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router