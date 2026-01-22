import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/render',
    component: () => import('./layouts/RenderLayout.vue'),
    children: [
      {
        path: '',
        name: 'render-dashboard',
        component: () => import('./pages/RenderDashboard.vue'),
      },
      {
        path: 'new/web-service',
        name: 'render-new-web-service',
        component: () => import('./pages/NewWebService.vue'),
      },
      {
        path: 'services/:serviceId',
        component: () => import('./pages/ServiceDetails.vue'),
        children: [
          {
            path: '',
            redirect: (to) => ({ name: 'render-service-events', params: to.params }),
          },
          {
            path: 'events',
            name: 'render-service-events',
            component: () => import('./pages/ServiceEvents.vue'),
          },
          {
            path: 'settings',
            name: 'render-service-settings',
            component: () => import('./pages/ServiceSettings.vue'),
          },
          {
            path: 'metrics',
            name: 'render-service-metrics',
            component: () => import('./pages/ServiceMetrics.vue'),
          },
          {
            path: 'logs',
            name: 'render-service-logs',
            component: () => import('./pages/ServiceLogs.vue'),
          },
          {
            path: 'env',
            name: 'render-service-env',
            component: () => import('./pages/ServiceEnvironment.vue'),
          },
          {
            path: 'shell',
            name: 'render-service-shell',
            component: () => import('./pages/ServiceShell.vue'),
          },
          {
            path: 'scaling',
            name: 'render-service-scaling',
            component: () => import('./pages/ServiceScaling.vue'),
          },
          {
            path: 'disk',
            name: 'render-service-disk',
            component: () => import('./pages/ServiceDisk.vue'),
          },
          {
            path: 'jobs',
            name: 'render-service-jobs',
            component: () => import('./pages/ServiceJobs.vue'),
          },
        ],
      },
    ],
    meta: { requiresAuth: true },
  },
]

export default routes
