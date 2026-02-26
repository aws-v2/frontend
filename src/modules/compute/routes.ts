import type { RouteRecordRaw } from 'vue-router'

const computeRoutes: RouteRecordRaw[] = [
    {
        path: '/compute',
        name: 'compute-landing',
        component: () => import('./pages/ComputeLandingPage.vue'),
        meta: { requiresAuth: false, hideNavbar: true }
    },
    {
        path: '/compute/instances',
        name: 'instances-list',
        component: () => import('./pages/InstancesListPage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/compute/instances/launch',
        name: 'launch-instance',
        component: () => import('./pages/CreateInstancePage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/compute/instances/:id',
        name: 'instance-details',
        component: () => import('./pages/InstanceDetailsPage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/compute/billing',
        name: 'compute-billing',
        component: () => import('./pages/BillingDashboardPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/compute/optimization',
        name: 'compute-optimization',
        component: () => import('./pages/CostOptimizationPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/compute/instances/:id/terminal',
        name: 'instance-terminal',
        component: () => import('./pages/InstanceTerminalPage.vue'),
        meta: { requiresAuth: false, isDarkNavbar: true }
    }
]

export default computeRoutes
