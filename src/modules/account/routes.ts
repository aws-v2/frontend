import type { RouteRecordRaw } from 'vue-router'

const accountRoutes: RouteRecordRaw[] = [
    {
        path: '/account',
        name: 'account',
        component: () => import('./pages/AccountPage.vue'),
        meta: {
            requiresAuth: true,
            title: 'My Account - Serwin Systems'
        }
    },
    {
        path: '/settings',
        name: 'settings',
        component: () => import('./pages/SettingsPage.vue'),
        meta: {
            requiresAuth: true,
            title: 'Account Settings - Serwin Systems'
        }
    }
]

export default accountRoutes
