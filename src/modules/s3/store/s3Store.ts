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

export const useS3Store = defineStore('s3', () => {
  const buckets = ref<Bucket[]>([])
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

  return {
    buckets,
    isLoading,
    fetchBuckets,
    addBucket,
  }
})
