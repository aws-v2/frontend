import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/s3',
    name: 's3-landing',
    component: () => import('./pages/S3LandingPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/s3/buckets',
    name: 's3-buckets',
    component: () => import('./pages/S3BucketsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/s3/create-bucket',
    name: 's3-create-bucket',
    component: () => import('./pages/CreateBucketPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/s3/buckets/:bucketName/create-metadata-config',
    name: 's3-create-metadata-config',
    component: () => import('./pages/CreateMetadataConfigPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/s3/buckets/:bucketName/create-folder',
    name: 's3-create-folder',
    component: () => import('./pages/CreateFolderPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/s3/buckets/:bucketName/upload',
    name: 's3-upload',
    component: () => import('./pages/UploadPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/s3/buckets/:bucketName',
    name: 's3-bucket-details',
    component: () => import('./pages/BucketDetailsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/s3/buckets/:bucketName/create-access-point',
    name: 's3-create-access-point',
    component: () => import('./pages/CreateAccessPointPage.vue'),
    meta: { requiresAuth: true },
  },
]

export default routes
