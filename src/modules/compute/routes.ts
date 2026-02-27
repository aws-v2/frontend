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
    },
    {
        path: '/compute/security-groups/:id/edit-rules',
        name: 'edit-security-group-rules',
        component: () => import('./pages/EditSecurityGroupRulesPage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/compute/volumes/attach',
        name: 'attach-volume',
        component: () => import('./pages/AttachVolumePage.vue'),
        meta: { requiresAuth: false }
    },
    // Volumes
    {
        path: '/compute/volumes',
        name: 'volumes-list',
        component: () => import('./pages/VolumesListPage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/compute/volumes/create',
        name: 'create-volume',
        component: () => import('./pages/CreateVolumePage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/compute/volumes/:id',
        name: 'volume-details',
        component: () => import('./pages/VolumeDetailsPage.vue'),
        meta: { requiresAuth: false }
    },
    // Snapshots
    {
        path: '/compute/snapshots',
        name: 'snapshots-list',
        component: () => import('./pages/SnapshotsListPage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/compute/snapshots/create',
        name: 'create-snapshot',
        component: () => import('./pages/CreateSnapshotPage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/compute/snapshots/:id',
        name: 'snapshot-details',
        component: () => import('./pages/SnapshotDetailsPage.vue'),
        meta: { requiresAuth: false }
    },
    // Templates
    {
        path: '/compute/templates',
        name: 'templates-list',
        component: () => import('./pages/TemplatesListPage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/compute/templates/create',
        name: 'create-template',
        component: () => import('./pages/CreateTemplatePage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/compute/templates/:id',
        name: 'template-details',
        component: () => import('./pages/TemplateDetailsPage.vue'),
        meta: { requiresAuth: false }
    },
    // SSH Keys
    {
        path: '/compute/ssh-keys',
        name: 'ssh-keys-list',
        component: () => import('./pages/SSHKeysListPage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/compute/ssh-keys/create',
        name: 'create-ssh-key',
        component: () => import('./pages/CreateSSHKeyPage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/compute/ssh-keys/:id',
        name: 'ssh-key-details',
        component: () => import('./pages/SSHKeyDetailsPage.vue'),
        meta: { requiresAuth: false }
    }
]

export default computeRoutes
