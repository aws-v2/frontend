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
    },
    {
        path: '/models/register',
        name: 'sagemaker-register-model',
        component: () => import('./pages/NewInferencingJob.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/models/:id',
        name: 'sagemaker-model-details',
        component: () => import('./pages/ModelDetailsPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/training/jobs/:id',
        name: 'sagemaker-training-job-details',
        component: () => import('./pages/TrainingJobDetailsPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/training/new',
        name: 'sagemaker-training-new',
        component: () => import('./pages/CreateTrainingJobPage.vue'),
        meta: { requiresAuth: true }
    }
]

export default sagemakerRoutes