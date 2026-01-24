import type { RouteRecordRaw } from 'vue-router'

const computeRoutes: RouteRecordRaw[] = [
    {
        path: '/compute',
        name: 'compute-landing',
        component: () => import('./pages/ComputeLandingPage.vue'),
        meta: { requiresAuth: true }
    }
]

export default computeRoutes
