import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'
import authRoutes from '@/modules/auth/routes'
import dashboardRoutes from '@/modules/dashboard/routes'
import landingRoutes from '@/modules/landing/routes'
import s3Routes from '@/modules/s3/routes'
import renderRoutes from '@/modules/render/routes'
import lambdaRoutes from '@/modules/lambda/routes'
import rdsRoutes from '@/modules/rds/routes'
import sagemakerRoutes from '@/modules/sagemaker/routes'
import computeRoutes from '@/modules/compute/routes'
import gameliftRoutes from '@/modules/gamelift/routes'
import servicesRoutes from '@/modules/services/routes'
import docsRoutes from '@/modules/docs/routes'
import accountRoutes from '@/modules/account/routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...landingRoutes,
    ...authRoutes,
    ...dashboardRoutes,
    ...s3Routes,
    ...renderRoutes,
    ...lambdaRoutes,
    ...rdsRoutes,
    ...sagemakerRoutes,
    ...computeRoutes,
    ...gameliftRoutes,
    ...servicesRoutes,
    ...docsRoutes,
    ...accountRoutes
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth to initialize if it hasn't yet
  if (authStore.isAuthenticated === null) {
    await authStore.initAuth()
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isPublicOnly = to.matched.some((record) => record.meta.publicOnly)
  const isMfaPage = to.name === 'mfa'

  if (isMfaPage && authStore.mfaRequired) {
    // Allow access to MFA page if challenge is pending
    next()
  } else if (requiresAuth && !authStore.isAuthenticated) {
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
