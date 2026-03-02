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
    {
        path: '/rds/databases/:id/snapshots',
        name: 'rds-snapshots-list',
        component: () => import('./views/RdsSnapshotsListView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/rds/databases/:id/snapshots/create',
        name: 'rds-create-snapshot',
        component: () => import('./views/CreateRdsSnapshotView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/rds/snapshots/:snapshotId/restore',
        name: 'rds-restore-database',
        component: () => import('./views/RestoreDatabaseView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/rds/volumes',
        name: 'rds-volumes',
        component: () => import('./views/RdsVolumesListView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/rds/volumes/create',
        name: 'rds-create-volume',
        component: () => import('./views/CreateRdsVolumeView.vue'),
        meta: { requiresAuth: true },
    },
]

export default rdsRoutes
