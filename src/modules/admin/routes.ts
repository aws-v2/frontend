import type { RouteRecordRaw } from 'vue-router'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('./pages/AdminDashboardPage.vue'),
    meta: {
      requiresAuth: true,
      title: 'Admin Dashboard'
    }
  }
]

export default adminRoutes
