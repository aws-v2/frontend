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

export interface BucketStats {
  bucket_id: string
  total_files: number
  total_size: number
}

export const useS3Store = defineStore('s3', () => {
  const buckets = ref<Bucket[]>([])
  const files = ref<S3Object[]>([])
  const currentBucket = ref<Bucket | null>(null)
  const currentBucketStats = ref<BucketStats | null>(null)
  const isLoading = ref(false)

  const fetchBuckets = async () => {
    isLoading.value = true
    try {
      const response = await apiClient.get<{ count: number; buckets: Bucket[] }>('/api/v1/buckets')
      buckets.value = response.data.buckets || []
    } catch (error) {
      console.error('Failed to fetch buckets:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchBucket = async (bucketId: string) => {
    isLoading.value = true
    try {
      const response = await apiClient.get<Bucket>(`/api/v1/buckets/${bucketId}`)
      currentBucket.value = response.data
    } catch (error) {
      console.error(`Failed to fetch bucket ${bucketId}:`, error)
      currentBucket.value = null
    } finally {
      isLoading.value = false
    }
  }

  const fetchBucketStats = async (bucketId: string) => {
    isLoading.value = true
    try {
      const response = await apiClient.get<BucketStats>(`/api/v1/buckets/${bucketId}/stats`)
      currentBucketStats.value = response.data
    } catch (error) {
      console.error(`Failed to fetch stats for bucket ${bucketId}:`, error)
      currentBucketStats.value = null
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
    currentBucket,
    currentBucketStats,
    isLoading,
    fetchBuckets,
    fetchBucket,
    fetchBucketStats,
    addBucket,
    fetchFiles,
  }
})
