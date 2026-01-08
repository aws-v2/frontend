import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/shared/api/apiClient'

export interface Bucket {
  bucket_id: string
  name: string
  owner_id: string
  region: string
  bucket_type: string
  object_ownership: string
  block_public_access: any
  versioning_status: any
  tags: any[]
  encryption: any
  object_lock: boolean
  created_at: string
  updated_at: string
  policy?: any
}

export interface S3Object {
  object_id: string
  key: string
  size: number
  type: string
  storage_class: string
  last_modified: string
  metadata?: any
  tags?: any[]
}

export const useS3Store = defineStore('s3', () => {
  const buckets = ref<Bucket[]>([])
  const files = ref<S3Object[]>([])
  const isLoading = ref(false)

  const fetchBuckets = async () => {
    isLoading.value = true
    try {
      const response = await apiClient.get<{ count: number; buckets: Bucket[] }>('/api/v1/buckets')
      buckets.value = response.data.buckets || [] // backend returns { count, buckets }
    } catch (error) {
      console.error('Failed to fetch buckets:', error)
      // buckets.value = [] // Keep existing or clear?
    } finally {
      isLoading.value = false
    }
  }

  const addBucket = (bucket: Bucket) => {
    buckets.value.push(bucket)
  }

  const fetchFiles = async (bucketId: string) => {
    isLoading.value = true
    try {
      const response = await apiClient.get<{ count: number; files: S3Object[] }>(
        `/api/v1/files/${bucketId}`,
      )
      files.value = response.data.files || []
    } catch (error) {
      console.error(`Failed to fetch files for bucket ${bucketId}:`, error)
      files.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    buckets,
    files,
    isLoading,
    fetchBuckets,
    addBucket,
    fetchFiles,
  }
})
