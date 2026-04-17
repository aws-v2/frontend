export default [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('./pages/DashboardPage.vue'),
    meta: { requiresAuth: true }
  },
]
