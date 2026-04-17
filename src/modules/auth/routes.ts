export default [
  {
    path: '/login',
    name: 'login',
    component: () => import('./pages/LoginPage.vue'),
    meta: { publicOnly: true, hideNavbar: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('./pages/RegisterPage.vue'),
    meta: { publicOnly: true, hideNavbar: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('./pages/ForgotPasswordPage.vue'),
    meta: { hideNavbar: true }
  },
  {
    path: '/auth/mfa',
    name: 'mfa',
    component: () => import('./pages/MFAPage.vue'),
    meta: { requiresAuth: true, hideNavbar: true }
  },
  {
    path: '/auth/mfa-setup',
    name: 'mfa-setup',
    component: () => import('./pages/MFASetupPage.vue'),
    meta: { requiresAuth: true, hideNavbar: true }
  },
  {
    path: '/auth/reset-password',
    name: 'reset-password',
    component: () => import('./pages/ResetPasswordPage.vue'),
    meta: { hideNavbar: true }
  },
  {
    path: '/auth/verify-email',
    name: 'verify-email',
    component: () => import('./pages/VerifyEmailPage.vue'),
    meta: { hideNavbar: true }
  },
  {
    path: '/auth/complete-setup',
    name: 'complete-setup',
    component: () => import('./pages/CompleteSetupPage.vue'),
    meta: { requiresAuth: true, hideNavbar: true }
  },
  {
    path: '/auth/support-plan',
    name: 'support-plan',
    component: () => import('./pages/SupportPlanPage.vue'),
    meta: { requiresAuth: true, hideNavbar: true }
  },
  {
    path: '/auth/account-plan',
    name: 'account-plan',
    component: () => import('./pages/AccountPlanPage.vue'),
    meta: { requiresAuth: true, hideNavbar: true }
  },
  {
    path: '/auth/payment-method',
    name: 'payment-method',
    component: () => import('./pages/PaymentMethodPage.vue'),
    meta: { requiresAuth: true, hideNavbar: true }
  },
  {
    path: '/auth/registration-success',
    name: 'registration-success',
    component: () => import('./pages/RegistrationSuccessPage.vue'),
    meta: { requiresAuth: true, hideNavbar: true }
  },
]
