import type { RouteRecordRaw } from 'vue-router'

const gameliftRoutes: RouteRecordRaw[] = [
    {
        path: '/gaming',
        name: 'gaming-landing',
        component: () => import('./pages/GamingLandingPage.vue'),
        meta: { requiresAuth: true }
    }
]

export default gameliftRoutes
