import type { RouteRecordRaw } from 'vue-router'

const computeRoutes: RouteRecordRaw[] = [
    {
        path: '/compute',
        name: 'compute-landing',
        component: () => import('./pages/ComputeLandingPage.vue'),
        meta: { requiresAuth: false }
    }
]

export default computeRoutes
