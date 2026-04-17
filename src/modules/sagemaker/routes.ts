import type { RouteRecordRaw } from 'vue-router'

const sagemakerRoutes: RouteRecordRaw[] = [
    {
        path: '/sagemaker',
        name: 'sagemaker-landing',
        component: () => import('./pages/SageMakerLandingPage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/sagemaker/train/create',
        name: 'sagemaker-create-job',
        component: () => import('./pages/CreateTrainingJobPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/sagemaker/jobs/:id',
        name: 'sagemaker-job-details',
        component: () => import('./pages/TrainingJobDetailsPage.vue'),
        meta: { requiresAuth: true }
    }
]

export default sagemakerRoutes
