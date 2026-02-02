import type { RouteRecordRaw } from 'vue-router'

const sagemakerRoutes: RouteRecordRaw[] = [
    {
        path: '/sagemaker',
        name: 'sagemaker-landing',
        component: () => import('./pages/SagemakerLandingPage.vue'),
        meta: { requiresAuth: true }
    }
]

export default sagemakerRoutes
