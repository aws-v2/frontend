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
  file_id: string
  bucket_id: string
  key: string
  size: number
  mime_type: string
  storage_class?: string
  last_modified?: string
  created_at: string
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
  const lastUploadResult = ref<{
    destination: string
    files: Array<{ name: string; size: number; status: string; type: string; error?: string }>
    succeededCount: number
    failedCount: number
    totalSize: number
  } | null>(null)

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

  const fetchFiles = async (bucketId: string, prefix: string = '') => {
    isLoading.value = true
    try {
      const response = await apiClient.get<{ count: number; files: S3Object[] }>(
        `/api/v1/files/${bucketId}`,
        { params: { prefix } },
      )
      files.value = response.data.files || []
    } catch (error) {
      console.error(`Failed to fetch files for bucket ${bucketId}:`, error)
      files.value = []
    } finally {
      isLoading.value = false
    }
  }

  const createFolder = async (bucketId: string, name: string) => {
    isLoading.value = true
    try {
      await apiClient.post(`/api/v1/files/folders/${bucketId}`, { name })
      await fetchFiles(bucketId) // Refresh list
    } catch (error) {
      console.error(`Failed to create folder ${name} in bucket ${bucketId}:`, error)
      throw error // Re-throw for modal handling
    } finally {
      isLoading.value = false
    }
  }

  const uploadFiles = async (bucketId: string, formData: FormData) => {
    isLoading.value = true
    try {
      await apiClient.post(`/api/v1/files/upload/${bucketId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Store results for the status page
      const uploadedFiles = Array.from(formData.getAll('files') as File[])
      const prefix = (formData.get('prefix') as string) || ''

      lastUploadResult.value = {
        destination: `s3://${bucketId}/${prefix}`,
        files: uploadedFiles.map((f) => ({
          name: f.name,
          size: f.size,
          status: 'Succeeded',
          type: f.type,
        })),
        succeededCount: uploadedFiles.length,
        failedCount: 0,
        totalSize: uploadedFiles.reduce((acc, f) => acc + f.size, 0),
      }

      await fetchFiles(bucketId, prefix) // Refresh list
    } catch (error) {
      console.error(`Failed to upload files to bucket ${bucketId}:`, error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const getDirectoryItems = (prefix: string) => {
    const rawFiles = files.value
    const items = new Map<
      string,
      S3Object | { key: string; mime_type: string; isFolder: boolean }
    >()

    rawFiles.forEach((file) => {
      // If file.key starts with prefix
      if (file.key.startsWith(prefix)) {
        const relativeKey = file.key.slice(prefix.length)
        if (!relativeKey) return // It's the folder itself

        const parts = relativeKey.split('/')
        if (parts.length === 1) {
          // It's a file or folder marker in this directory
          items.set(parts[0], file)
        } else {
          // It's something deeper, so it should be represented by a folder
          const folderName = parts[0] + '/'
          if (!items.has(folderName)) {
            items.set(folderName, {
              key: prefix + folderName,
              mime_type: 'folder',
              isFolder: true,
            })
          }
        }
      }
    })

    return Array.from(items.values())
  }

  const currentFile = ref<S3Object | null>(null)

  const fetchFileDetails = async (bucketId: string, objectKey: string) => {
    isLoading.value = true
    try {
      // Assuming a backend endpoint exists or we filter from files
      // If we need a dedicated endpoint:
      const response = await apiClient.get<S3Object>(`/api/v1/files/${bucketId}/${objectKey}`)
      currentFile.value = response.data
    } catch (error) {
      console.error(`Failed to fetch file details for ${objectKey} in bucket ${bucketId}:`, error)
      currentFile.value = null
    } finally {
      isLoading.value = false
    }
  }

  return {
    buckets,
    files,
    currentBucket,
    currentBucketStats,
    currentFile,
    isLoading,
    fetchBuckets,
    fetchBucket,
    fetchBucketStats,
    fetchFiles,
    fetchFileDetails,
    createFolder,
    uploadFiles,
    getDirectoryItems,
    addBucket,
    lastUploadResult,
  }
})
