import type { RouteRecordRaw } from 'vue-router'

const docsRoutes: RouteRecordRaw[] = [
    {
        path: '/docs',
        name: 'docs',
        component: () => import('./pages/DocsLandingPage.vue'),
        meta: {
            title: 'Documentation - Serwin Systems',
            hideNavbar: true
        }
    },
    {
        path: '/docs/:service?/:slug?',
        name: 'docs-content',
        component: () => import('./pages/DocsContentPage.vue'),
        meta: {
            title: 'Serwin Systems Documentation',
            hideNavbar: true
        }
    }
]

export default docsRoutes
