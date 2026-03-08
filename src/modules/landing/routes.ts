export default [
  {
    path: '/',
    name: 'landing',
    component: () => import('./pages/LandingPage.vue'),
    meta: { hideNavbar: true },
  },
  {
    path: '/pricing',
    name: 'pricing',
    component: () => import('./pages/PricingPage.vue'),
    meta: { hideNavbar: true },
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('./pages/PrivacyPage.vue'),
    meta: { hideNavbar: true },
  },
  {
    path: '/legal',
    name: 'legal',
    component: () => import('./pages/LegalPage.vue'),
    meta: { hideNavbar: true },
  },
  {
    path: '/support',
    name: 'support',
    component: () => import('./pages/SupportPage.vue'),
    meta: { hideNavbar: true },
  },
]
