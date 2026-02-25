import type { RouteRecordRaw } from 'vue-router'

const lambdaRoutes: RouteRecordRaw[] = [
    {
        path: '/lambda',
        name: 'lambda-landing',
        component: () => import('../compute/pages/ComputeLandingPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/lambda/create',
        name: 'lambda-create',
        component: () => import('./views/CreateFunctionView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/lambda/functions/:id',
        name: 'lambda-details',
        component: () => import('./views/LambdaDetailsView.vue'),
        meta: { requiresAuth: true }
    }
]

export default lambdaRoutes
