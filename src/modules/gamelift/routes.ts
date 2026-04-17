import type { RouteRecordRaw } from 'vue-router'

const gameliftRoutes: RouteRecordRaw[] = [
    {
        path: '/gaming',
        name: 'gaming-landing',
        component: () => import('./pages/GamingLandingPage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/gamelift/fleets/create',
        name: 'gamelift-create-fleet',
        component: () => import('./pages/CreateFleetPage.vue'),
        meta: { requiresAuth: true }
    }
]

export default gameliftRoutes
