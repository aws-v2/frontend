export default [
  {
    path: '/login',
    name: 'login',
    component: () => import('./pages/LoginPage.vue'),
    meta: { publicOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('./pages/RegisterPage.vue'),
    meta: { publicOnly: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('./pages/ForgotPasswordPage.vue'),
  },
  {
    path: '/auth/mfa',
    name: 'mfa',
    component: () => import('./pages/MFAPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/auth/mfa-setup',
    name: 'mfa-setup',
    component: () => import('./pages/MFASetupPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/auth/reset-password',
    name: 'reset-password',
    component: () => import('./pages/ResetPasswordPage.vue'),
  },
  {
    path: '/auth/verify-email',
    name: 'verify-email',
    component: () => import('./pages/VerifyEmailPage.vue'),
  },
]
