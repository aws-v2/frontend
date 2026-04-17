import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/authStore'

const gameliftRoutes: RouteRecordRaw[] = [
    {
        path: '/gaming',
        name: 'gaming-landing',
        component: () => import('./pages/GamingLandingPage.vue'),
        meta: { requiresAuth: false },
        beforeEnter: (_to, _from, next) => {
            const auth = useAuthStore()
            if (auth.isAuthenticated) {
                next({ name: 'gaming-console' })
            } else {
                next()
            }
        }
    },
    {
        path: '/gaming/console',
        name: 'gaming-console',
        component: () => import('./pages/GamingConsolePage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/gamelift/fleets/create',
        name: 'gamelift-create-fleet',
        component: () => import('./pages/CreateFleetPage.vue'),
        meta: { requiresAuth: true }
    }
]

export default gameliftRoutes
