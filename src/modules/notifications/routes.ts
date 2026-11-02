import type { RouteRecordRaw } from 'vue-router'

const notificationsRoutes: RouteRecordRaw[] = [
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('@/modules/notifications/pages/NotificationsPage.vue'),
    meta: { requiresAuth: true },
  },
]

export default notificationsRoutes