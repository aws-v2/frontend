import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/shared/api/apiClient'

export interface Bucket {
  bucket_id: string
  name: string
  owner_id?: string
  region: string
  bucket_type: string
  created_at: string
  updated_at?: string
  arn: string
  settings?: {
    block_public_access: {
      blockPublicAcls: boolean
      ignorePublicAcls: boolean
      blockPublicPolicy: boolean
      restrictPublicBuckets: boolean
    }
    versioning_status: string
    tags: any[]
    encryption: {
      type: string
      bucketKeyEnabled: boolean
    }
    object_lock: boolean
    logging?: {
      enabled: boolean
      targetBucket?: string
      targetPrefix?: string
    }
  }
  connectivity?: {
    region: string
    arn: string
    object_ownership: string
  }
  // Deprecated flat fields (kept for compatibility)
  object_ownership?: string
  block_public_access?: any
  versioning_status?: any
  encryption?: any
  object_lock?: boolean | any
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

export interface StorageLensData {
  summary: {
    totalStorage: number
    objectCount: number
    activeBuckets: number
    avgObjectSize: number
  }
  timeSeries: {
    date: string
    storage: number
    objects: number
    throughput: number
  }[]
  storageClasses: {
    name: string
    size: number
    color: string
  }[]
  topBuckets: {
    name: string
    region: string
    size: number
    objectCount: number
  }[]
}

export interface SecuritySummary {
  score: number // 0-100
  criticalCount: number
  warningCount: number
  publicBucketsCount: number
  mfaMissingCount: number
  unencryptedCount: number
  findings: {
    id: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    bucket_name: string
    description: string
    remediation: string
    timestamp: string
  }[]
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
      const response = await apiClient.get<{ code: number; message: string; data: { count: number; buckets: Bucket[] } }>('/s3/buckets')
      // Handle both wrapped { data: { buckets: [] } } and flat { buckets: [] } formats
      buckets.value = response.data?.data?.buckets || (response.data as any)?.buckets || []
    } catch (error) {
      console.error('Failed to fetch buckets:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchBucket = async (bucketId: string) => {
    isLoading.value = true
    try {
      const response = await apiClient.get<{ code: number; message: string; data: Bucket }>(`/s3/buckets/${bucketId}`)
      const rawData = (response.data?.data || response.data) as any
      if (rawData) {
        currentBucket.value = {
          ...rawData,
          bucket_id: rawData.bucket_id || rawData.bucketId,
          name: rawData.name,
          region: rawData.region,
          bucket_type: rawData.bucket_type || rawData.bucketType,
          created_at: rawData.created_at || rawData.createdAt,
          arn: rawData.arn,
          settings: rawData.settings,
          connectivity: rawData.connectivity,
          // Maintain compatibility for components still using flat fields
          versioning_status: rawData.settings?.versioning_status || rawData.versioning_status || rawData.versioningStatus,
          object_lock: rawData.settings?.object_lock !== undefined ? rawData.settings.object_lock : (rawData.object_lock !== undefined ? rawData.object_lock : rawData.objectLock),
          block_public_access: rawData.settings?.block_public_access || rawData.block_public_access || rawData.blockPublicAccess,
          object_ownership: rawData.connectivity?.object_ownership || rawData.object_ownership || rawData.objectOwnership,
        }
      } else {
        currentBucket.value = null
      }
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
      const response = await apiClient.get<{ code: number; message: string; data: BucketStats }>(`/s3/buckets/${bucketId}/stats`)
      const rawData = (response.data?.data || response.data) as any
      if (rawData) {
        currentBucketStats.value = {
          bucket_id: rawData.bucket_id || rawData.bucketId,
          total_files: rawData.total_files !== undefined ? rawData.total_files : (rawData.totalFiles || 0),
          total_size: rawData.total_size !== undefined
            ? rawData.total_size
            : (rawData.total_size_bytes !== undefined ? rawData.total_size_bytes : (rawData.totalSize || 0))
        }
      } else {
        currentBucketStats.value = null
      }
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
      const params: any = {}
      if (prefix && prefix !== '/') {
        params.prefix = prefix
      }

      const response = await apiClient.get<{ code: number; message: string; data: { count: number; files: S3Object[] } }>(
        `/s3/files/${bucketId}`,
        { params },
      )
      // Handle both wrapped { data: { files: [] } } and flat { files: [] } formats
      files.value = response.data?.data?.files || (response.data as any)?.files || []
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
      await apiClient.post(`/s3/files/folders/${bucketId}`, { name })
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
      await apiClient.post(`/s3/files/upload/${bucketId}`, formData, {
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
        const itemKey = parts[0]
        if (itemKey === undefined) return

        if (parts.length === 1) {
          // It's a file or folder marker in this directory
          items.set(itemKey, file)
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
      const response = await apiClient.get<{ code: number; message: string; data: S3Object }>(`/s3/files/${bucketId}/${objectKey}`)
      currentFile.value = response.data?.data || (response.data as any) || null
    } catch (error) {
      console.error(`Failed to fetch file details for ${objectKey} in bucket ${bucketId}:`, error)
      currentFile.value = null
    } finally {
      isLoading.value = false
    }
  }

  const deleteFiles = async (bucketId: string, objects: S3Object[]) => {
    isLoading.value = true
    try {
      for (const obj of objects) {
        await apiClient.delete(`/s3/files/${bucketId}/files/${obj.file_id}`)
      }
      // Refresh the file list for the current prefix
      let currentPrefix = ''
      if (files.value.length > 0 && files.value[0]?.key.includes('/')) {
        currentPrefix = files.value[0].key.split('/').slice(0, -1).join('/') + '/'
      }
      await fetchFiles(bucketId, currentPrefix)
    } catch (error) {
      console.error(`Failed to delete files from bucket ${bucketId}:`, error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const downloadFile = async (bucketId: string, fileId: string, fileName: string) => {
    try {
      const url = `/api/v1/s3/files/${bucketId}/files/${fileId}/download`
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
      throw error
    }
  }

  const updateBucketVersioning = async (bucketId: string, status: string) => {
    isLoading.value = true
    try {
      const response = await apiClient.put<{ code: number; message: string; data: Bucket }>(
        `/s3/buckets/${bucketId}/versioning`,
        { status }
      )
      if (response.data?.data && currentBucket.value && currentBucket.value.bucket_id === bucketId) {
        currentBucket.value.versioning_status = status
      }
      return response.data
    } catch (error) {
      console.error(`Failed to update versioning for bucket ${bucketId}:`, error)
      throw error
    } finally {
      isLoading.value = false
    }
  }



  /* Analytics State & Actions */
  const storageLensData = ref<StorageLensData | null>(null)
  const securityData = ref<SecuritySummary | null>(null)

  const fetchStorageLensData = async () => {
    isLoading.value = true
    try {
      // computed dummy data for fallback
      const dummyData: StorageLensData = {
        summary: {
          totalStorage: 450 * 1024 * 1024 * 1024, // 450 GB
          objectCount: 12500,
          activeBuckets: 8,
          avgObjectSize: 36 * 1024 * 1024, // 36 MB
        },
        timeSeries: Array.from({ length: 14 }).map((_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (13 - i))
          return {
            date: date.toISOString().split('T')[0] as string,
            storage: 200 + (i * i * 2) + Math.random() * 10, // Explicit exponential growth for aesthetics
            objects: 5000 + i * 1000 + Math.random() * 200,
            throughput: (20 + Math.random() * 30) * 1024 * 1024 // 20-50 MB/s
          }
        }),
        storageClasses: [
          { name: 'Standard', size: 300, color: '#10b981' }, // Emerald-500
          { name: 'Intelligent-Tiering', size: 100, color: '#3b82f6' }, // Blue-500
          { name: 'Glacier', size: 50, color: '#6366f1' }, // Indigo-500
        ],
        topBuckets: [
          { name: 'production-assets', region: 'us-east-1', size: 250 * 1024 * 1024 * 1024, objectCount: 5000 },
          { name: 'backup-daily', region: 'eu-central-1', size: 120 * 1024 * 1024 * 1024, objectCount: 1200 },
          { name: 'user-uploads', region: 'us-west-2', size: 80 * 1024 * 1024 * 1024, objectCount: 8000 },
        ]
      }

      try {
        const response = await apiClient.get<{ code: number; message: string; data: any }>('/s3/analytics/dashboard')
        const raw = response.data?.data || (response.data as any)?.data

        if (raw) {
          storageLensData.value = {
            summary: {
              totalStorage: raw.summary?.total_storage ?? raw.summary?.totalStorage ?? 0,
              objectCount: raw.summary?.object_count ?? raw.summary?.objectCount ?? 0,
              activeBuckets: raw.summary?.active_buckets ?? raw.summary?.activeBuckets ?? 0,
              avgObjectSize: raw.summary?.avg_object_size ?? raw.summary?.avgObjectSize ?? 0,
            },
            timeSeries: (raw.time_series || raw.time_series || raw.timeSeries || []).map((d: any) => ({
              date: d.date,
              storage: d.total_storage ?? d.storage ?? 0,
              objects: d.object_count ?? d.objects ?? 0,
              throughput: d.throughput ?? 0
            })),
            storageClasses: (raw.storage_classes || raw.storageClasses || []).map((cls: any) => ({
              name: cls.class_name ?? cls.name ?? 'Unknown',
              size: cls.total_size ?? cls.size ?? 0,
              color: cls.color || '#ff9900'
            })),
            topBuckets: (raw.top_buckets || raw.topBuckets || []).map((b: any) => ({
              name: b.bucket_name ?? b.name ?? 'Unnamed',
              region: b.region ?? 'Unknown',
              size: b.total_size ?? b.total_storage ?? b.size ?? 0,
              objectCount: b.total_objects ?? b.object_count ?? b.objectCount ?? 0
            }))
          }
        } else {
          storageLensData.value = dummyData
        }
      } catch (innerError) {
        console.warn('Backend analytics endpoint missing or failed, using dummy data', innerError)
        storageLensData.value = dummyData
      }

    } catch (error) {
      console.error('Failed to init storage lens data:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchSecurityData = async () => {
    isLoading.value = true
    try {
      // Mock Data
      const dummySecurity: SecuritySummary = {
        score: 85,
        criticalCount: 0,
        warningCount: 3,
        publicBucketsCount: 0,
        mfaMissingCount: 2,
        unencryptedCount: 1,
        findings: [
          {
            id: 'FIND-001',
            severity: 'medium',
            bucket_name: 'user-uploads',
            description: 'Bucket missing Default Encryption configuration',
            remediation: 'Enable AES-256 or KMS encryption',
            timestamp: new Date().toISOString()
          },
          {
            id: 'FIND-002',
            severity: 'low',
            bucket_name: 'backup-daily',
            description: 'MFA Delete is not enabled',
            remediation: 'Enable MFA Delete in versioning settings',
            timestamp: new Date().toISOString()
          },
          {
            id: 'FIND-003',
            severity: 'low',
            bucket_name: 'production-assets',
            description: 'Lifecycle policy not configured',
            remediation: 'Configure lifecycle rules to transition old objects',
            timestamp: new Date().toISOString()
          }
        ]
      }

      try {
        const response = await apiClient.get<{ code: number; message: string; data: SecuritySummary }>('/s3/security/summary')
        const raw = response.data
        // Handle: { data: { security summary } } or { security summary }
        const data = (raw?.data || raw) as any

        if (data && (data.findings || data.score !== undefined)) {
          securityData.value = {
            score: data.score ?? 0,
            criticalCount: data.criticalCount ?? data.critical_count ?? 0,
            warningCount: data.warningCount ?? data.warning_count ?? 0,
            publicBucketsCount: data.publicBucketsCount ?? data.public_buckets_count ?? data.publicBuckets ?? 0,
            mfaMissingCount: data.mfaMissingCount ?? data.mfa_missing_count ?? data.mfaMissing ?? 0,
            unencryptedCount: data.unencryptedCount ?? data.un_encrypted_count ?? data.unencrypted ?? 0,
            findings: (data.findings || []).map((f: any) => ({
              id: f.id || f.findingId || 'UNKNOWN',
              severity: f.severity || 'low',
              bucket_name: f.bucket_name || f.bucketName || 'Unknown',
              description: f.description || '',
              remediation: f.remediation || '',
              timestamp: f.timestamp || new Date().toISOString()
            }))
          }
        } else {
          securityData.value = dummySecurity
        }
      } catch (innerError) {
        console.warn('Backend security endpoint missing, using mock data')
        securityData.value = dummySecurity
      }

    } catch (error) {
      console.error('Failed to fetch security data:', error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchAccessPoints = async (bucketId: string) => {
    isLoading.value = true
    try {
      const response = await apiClient.get<{ code: number; message: string; data: any }>(`/s3/buckets/${bucketId}/access-points`)
      // The backend returns { access_points: [...], available_vpcs: [...] } or { data: { ... } }
      return response.data?.data || response.data || { access_points: [], available_vpcs: [] }
    } catch (error) {
      console.warn(`Failed to fetch access points for bucket ${bucketId}:`, error)
      return { access_points: [], available_vpcs: [] }
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
    storageLensData,
    securityData,
    isLoading,
    fetchBuckets,
    fetchBucket,
    fetchBucketStats,
    fetchFiles,
    fetchFileDetails,
    createFolder,
    uploadFiles,
    deleteFiles,
    downloadFile,
    getDirectoryItems,
    addBucket,
    lastUploadResult,
    fetchStorageLensData,
    fetchSecurityData,
    updateBucketVersioning,
    enableObjectLock: async (bucketId: string) => {
      isLoading.value = true
      try {
        await apiClient.put(`/s3/buckets/${bucketId}/object-lock`, {
          status: 'Enabled'
        })
        if (currentBucket.value && currentBucket.value.bucket_id === bucketId) {
          if (currentBucket.value.settings) {
            currentBucket.value.settings.object_lock = true
          }
        }
      } catch (error) {
        console.error(`Failed to enable object lock for bucket ${bucketId}:`, error)
        throw error
      } finally {
        isLoading.value = false
      }
    },
    updateBucketAccessLogging: async (bucketId: string, status: string, targetBucket: string, targetPrefix: string) => {
      isLoading.value = true
      try {
        await apiClient.put(`/s3/buckets/${bucketId}/logging`, {
          status,
          targetBucket,
          targetPrefix
        })
        if (currentBucket.value && currentBucket.value.bucket_id === bucketId) {
          // Update local state if needed via a fetch or manually setting it if structure matches
          // Ideally we re-fetch the bucket to get the latest settings
          await fetchBucket(bucketId)
        }
      } catch (error) {
        console.error(`Failed to update access logging for bucket ${bucketId}:`, error)
        throw error
      } finally {
        isLoading.value = false
      }
    },
    createEventNotification: async (bucketId: string, name: string, eventTypes: string[], destination: string) => {
      isLoading.value = true
      try {
        const response = await apiClient.post(`/s3/buckets/${bucketId}/notifications`, {
          name,
          eventTypes,
          destination
        })
        return response.data
      } catch (error) {
        console.error(`Failed to create event notification for bucket ${bucketId}:`, error)
        throw error
      } finally {
        isLoading.value = false
      }
    },
    fetchEventNotifications: async (bucketId: string) => {
      isLoading.value = true
      try {
        const response = await apiClient.get(`/s3/buckets/${bucketId}/notifications`)
        // Handle: { data: { notifications: [...] } }, { notifications: [...] }, or { notifications: {...} }
        const data = response.data?.data?.notifications || (response.data as any)?.notifications || response.data?.data || []
        return Array.isArray(data) ? data : [data]
      } catch (error) {
        console.error(`Failed to fetch event notifications for bucket ${bucketId}:`, error)
        return []
      } finally {
        isLoading.value = false
      }
    },
    fetchBucketTags: async (bucketId: string) => {
      isLoading.value = true
      try {
        const response = await apiClient.get(`/s3/buckets/${bucketId}/tags`)
        // Handle: { data: { tags: [...] } } or { tags: [...] }
        return response.data?.data?.tags || (response.data as any)?.tags || response.data?.data || []
      } catch (error) {
        console.error(`Failed to fetch tags for bucket ${bucketId}:`, error)
        return []
      } finally {
        isLoading.value = false
      }
    },
    updateBucketTags: async (bucketId: string, tags: { key: string; value: string }[]) => {
      isLoading.value = true
      try {
        await apiClient.put(`/s3/buckets/${bucketId}/tags`, { tags })
        if (currentBucket.value && currentBucket.value.bucket_id === bucketId) {
          await fetchBucket(bucketId)
        }
      } catch (error) {
        console.error(`Failed to update tags for bucket ${bucketId}:`, error)
        throw error
      } finally {
        isLoading.value = false
      }
    },
    fetchReplicationRules: async (bucketId: string) => {
      isLoading.value = true
      try {
        const response = await apiClient.get(`/s3/buckets/${bucketId}/replication`)
        // Handle: { data: { replication: [...] } }, { replication: [...] }, or { replication: {...} }
        const data = response.data?.data?.replication || (response.data as any)?.replication || response.data?.data || []
        return Array.isArray(data) ? data : (data && typeof data === 'object' ? [data] : [])
      } catch (error) {
        console.error(`Failed to fetch replication rules for bucket ${bucketId}:`, error)
        return []
      } finally {
        isLoading.value = false
      }
    },
    createReplicationRule: async (bucketId: string, name: string, priority: number, status: string) => {
      isLoading.value = true
      try {
        const response = await apiClient.post(`/s3/buckets/${bucketId}/replication`, {
          name,
          priority,
          status
        })
        return response.data
      } catch (error) {
        console.error(`Failed to create replication rule for bucket ${bucketId}:`, error)
        throw error
      } finally {
        isLoading.value = false
      }
    },
    fetchBucketCors: async (bucketId: string) => {
      isLoading.value = true
      try {
        const response = await apiClient.get<{ code: number; message: string; data: { corsRules: any[] } }>(`/s3/buckets/${bucketId}/cors`)
        // Handle both wrapped { data: { corsRules: [...] } } and flat { corsRules: [...] } formats
        return response.data?.data?.corsRules || (response.data as any)?.corsRules || []
      } catch (error) {
        console.warn(`Failed to fetch CORS for bucket ${bucketId} (might not be implemented yet):`, error)
        return []
      } finally {
        isLoading.value = false
      }
    },
    updateBucketCors: async (bucketId: string, corsRules: any[]) => {
      isLoading.value = true
      try {
        await apiClient.put(`/s3/buckets/${bucketId}/cors`, { corsRules })
        // Optimistically update or re-fetch
      } catch (error) {
        console.error(`Failed to update CORS for bucket ${bucketId}:`, error)
        throw error
      } finally {
        isLoading.value = false
      }
    },
    deleteBucketCors: async (bucketId: string) => {
      isLoading.value = true
      try {
        await apiClient.delete(`/s3/buckets/${bucketId}/cors`)
      } catch (error) {
        console.error(`Failed to delete CORS for bucket ${bucketId}:`, error)
        throw error
      } finally {
        isLoading.value = false
      }
    },
    fetchBucketPolicy: async (bucketId: string) => {
      isLoading.value = true
      try {
        const response = await apiClient.get<{ code: number; message: string; data: { policy: string } }>(`/s3/buckets/${bucketId}/policy`)
        // Handle both wrapped { data: { policy: "..." } } and flat { policy: "..." } formats
        const policyString = response.data?.data?.policy || (response.data as any)?.policy
        if (policyString) {
          return JSON.parse(policyString)
        }
        return null
      } catch (error) {
        console.warn(`Failed to fetch policy for bucket ${bucketId}:`, error)
        return null
      } finally {
        isLoading.value = false
      }
    },
    updateBucketPolicy: async (bucketId: string, flatPolicy: {
      version: string
      effect: string
      actions: string[]
      resources: string[]
      principals: string[]
      conditions?: any
    }) => {
      isLoading.value = true
      try {
        await apiClient.put(`/s3/buckets/${bucketId}/policy`, flatPolicy)
      } catch (error) {
        console.error(`Failed to update policy for bucket ${bucketId}:`, error)
        throw error
      } finally {
        isLoading.value = false
      }
    },
    fetchBucketAccessLogging: async (bucketId: string) => {
      isLoading.value = true
      try {
        const response = await apiClient.get(`/s3/buckets/${bucketId}/logging`)
        // Handle: { data: { status: "Enabled", targetBucket: "...", targetPrefix: "..." } }
        const data = response.data?.data || response.data
        if (currentBucket.value && currentBucket.value.bucket_id === bucketId) {
          if (!currentBucket.value.settings) {
            currentBucket.value.settings = {} as any
          }
          currentBucket.value.settings!.logging = {
            enabled: data.status === 'Enabled',
            targetBucket: data.targetBucket,
            targetPrefix: data.targetPrefix
          }
        }
        return data
      } catch (error) {
        console.warn(`Failed to fetch access logging for bucket ${bucketId}:`, error)
        return null
      } finally {
        isLoading.value = false
      }
    },
    fetchBucketObjectLock: async (bucketId: string) => {
      isLoading.value = true
      try {
        const response = await apiClient.get(`/s3/buckets/${bucketId}/object-lock`)
        // Handle: { data: { enabled: true } } or { enabled: true }
        const data = response.data?.data || response.data
        if (currentBucket.value && currentBucket.value.bucket_id === bucketId) {
          if (!currentBucket.value.settings) {
            currentBucket.value.settings = {} as any
          }
          currentBucket.value.settings!.object_lock = data.enabled
        }
        return data
      } catch (error) {
        console.warn(`Failed to fetch object lock for bucket ${bucketId}:`, error)
        return null
      } finally {
        isLoading.value = false
      }
    },
    fetchBucketEncryption: async (bucketId: string) => {
      isLoading.value = true
      try {
        const response = await apiClient.get(`/s3/buckets/${bucketId}/encryption`)
        // Handle: { data: { type: "SSE-S3", bucketKeyEnabled: true } } or { type: "...", ... }
        const data = response.data?.data || response.data
        if (currentBucket.value && currentBucket.value.bucket_id === bucketId) {
          if (!currentBucket.value.settings) {
            currentBucket.value.settings = {} as any
          }
          currentBucket.value.settings!.encryption = data
        }
        return data
      } catch (error) {
        console.warn(`Failed to fetch encryption for bucket ${bucketId}:`, error)
        return null
      } finally {
        isLoading.value = false
      }
    },
    updateBucketEncryption: async (bucketId: string, encryption: { type: string; bucketKeyEnabled: boolean }) => {
      isLoading.value = true
      try {
        const response = await apiClient.put(`/s3/buckets/${bucketId}/encryption`, encryption)
        if (currentBucket.value && currentBucket.value.bucket_id === bucketId) {
          if (!currentBucket.value.settings) {
            currentBucket.value.settings = {} as any
          }
          currentBucket.value.settings!.encryption = encryption
        }
        return response.data
      } catch (error) {
        console.error(`Failed to update encryption for bucket ${bucketId}:`, error)
        throw error
      } finally {
        isLoading.value = false
      }
    },
    fetchAccessPoints,
    createAccessPoint: async (bucketId: string, data: {
      name: string
      networkOrigin: 'internet' | 'vpc'
      vpcId?: string
    }) => {
      isLoading.value = true
      try {
        await apiClient.post(`/s3/buckets/${bucketId}/access-points`, data)
      } catch (error) {
        console.error(`Failed to create access point for bucket ${bucketId}:`, error)
        throw error
      } finally {
        isLoading.value = false
      }
    },
    updateBlockPublicAccess: async (bucketId: string, blockAll: boolean) => {
      isLoading.value = true
      try {
        await apiClient.put(`/s3/buckets/${bucketId}/block-public-access`, { blockAll })
        await fetchBucket(bucketId)
      } catch (error) {
        console.error(`Failed to update block public access for bucket ${bucketId}:`, error)
        throw error
      } finally {
        isLoading.value = false
      }
    },
    updateAccessPointStatus: async (bucketId: string, accessPointName: string, status: 'active' | 'blocked') => {
      isLoading.value = true
      try {
        await apiClient.put(`/s3/buckets/${bucketId}/access-points/${accessPointName}/status`, { status })
        // Use the function defined in the same scope
        await fetchAccessPoints(bucketId)
      } catch (error) {
        console.error(`Failed to update status for access point ${accessPointName}:`, error)
        throw error
      } finally {
        isLoading.value = false
      }
    }
  }
})
