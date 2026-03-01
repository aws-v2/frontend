import type { RouteRecordRaw } from 'vue-router'

const rdsRoutes: RouteRecordRaw[] = [
    {
        path: '/rds',
        redirect: '/rds/databases',
    },
    {
        path: '/rds/databases',
        name: 'rds-databases',
        component: () => import('./views/RDSLandingView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/rds/create',
        name: 'rds-create',
        component: () => import('./views/CreateDatabaseView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/rds/modify/:id',
        name: 'rds-modify',
        component: () => import('./views/ModifyDatabaseView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/rds/databases/:id',
        name: 'rds-database-detail',
        component: () => import('./views/RdsDatabaseDetailView.vue'),
        meta: { requiresAuth: true },
    },
]

export default rdsRoutes
