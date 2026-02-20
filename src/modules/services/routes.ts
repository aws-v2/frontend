export default [
    {
        path: '/services/network',
        name: 'global-mesh-network',
        component: () => import('./pages/GlobalMeshNetworkPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/services/benchmarks',
        name: 'benchmarks',
        component: () => import('./pages/BenchmarksPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/services/migrate',
        name: 'migration',
        component: () => import('./pages/MigrationPage.vue'),
        meta: { requiresAuth: true }
    }
]
