import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/shared/api/apiClient'
import type { Vpc } from '@/shared/types/vpc'


export interface RdsDatabase {
    id: string
    name: string
    user?: string
    status?: string
    engine?: string
    endpoint?: string
    port?: number
    createdAt?: string
    region?: string
    // New fields from backend update
    arn?: string
    connectionString?: string
    host?: string
    physicalDbName?: string
    roleName?: string
    password?: string
    vpcId?: string
    privateIp?: string
    publicConnectionString?: string
    publicPort?: number
}

export interface RdsSnapshot {
    id: string
    name: string
    dbId: string
    status: string
    createdAt: string
}

export interface RdsVolume {
    id: string
    name: string
    sizeGb: number
    status: string
    createdAt: string
}

export interface RdsScalingPolicy {
    id: string
    user_id: string
    target_type: string
    target_id: string
    metric_name: string
    target_value: number
    scale_down_value: number
    max_instances: number
    scale_out_cooldown: number
    scale_in_cooldown: number
    status?: string
    created_at?: string
    updated_at?: string
}

export interface CreateRdsScalingPolicyPayload {
    target_type: string
    target_id: string
    metric_name: string
    target_value: number
    scale_down_value: number
    max_instances: number
    scale_out_cooldown: number
    scale_in_cooldown: number
}

export interface UpdateRdsScalingPolicyPayload {
    target_value: number
    scale_down_value: number
    max_instances: number
    scale_out_cooldown: number
    scale_in_cooldown: number
}

export interface RdsAggregateMetrics {
    summary: {
        totalDatabases: number
        totalCpuUsage: number
        totalMemoryUsage: number
        totalConnections: number
        totalDiskUsage: number
        unitCpu: string
        unitMemory: string
        unitDisk: string
    }
    breakdown: Array<{
        name: string
        cpu: number
        memory: number
        status: string
    }>
    history: Array<{
        timestamp: string
        cpu: number
        memory: number
    }>
}

export const useRdsStore = defineStore('rds', () => {
    const databases = ref<RdsDatabase[]>([])
    const currentDatabase = ref<RdsDatabase | null>(null)
    const snapshots = ref<RdsSnapshot[]>([])
    const volumes = ref<RdsVolume[]>([])
    const aggregateMetrics = ref<RdsAggregateMetrics | null>(null)
    const vpcs = ref<Vpc[]>([])
    const scalingPolicies = ref<RdsScalingPolicy[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const mapDb = (d: any): RdsDatabase => ({
        id: d.id || d.DatabaseID || d.Id || '',
        name: d.name || d.Name || d.DatabaseName || '',
        user: d.user || d.User || d.roleName || d.username,
        status: d.status || d.Status || 'available',
        engine: d.engine || d.Engine || 'PostgreSQL',
        endpoint: d.endpoint || d.Endpoint || d.host,
        port: d.port || d.Port || 5432,
        createdAt: d.createdAt || d.CreatedAt || d.created_at,
        region: d.region || 'eu-north-1',
        arn: d.arn || d.Arn,
        connectionString: d.connectionString || d.ConnectionString,
        host: d.host || d.Host,
        physicalDbName: d.physicalDbName || d.PhysicalDbName,
        roleName: d.roleName || d.RoleName,
        password: d.password || d.Password,
        vpcId: d.vpcId || d.vpc_id || d.VpcId,
        privateIp: d.privateIp || d.private_ip || d.host,
        publicConnectionString: d.publicConnectionString || d.PublicConnectionString,
        publicPort: d.publicPort || d.public_port || d.PublicPort,
    })

    const mapSnapshot = (s: any): RdsSnapshot => ({
        id: s.id || s.Id || s.ID || '',
        name: s.name || s.Name || '',
        dbId: s.dbId || s.DatabaseID || '',
        status: s.status || s.Status || 'available',
        createdAt: s.createdAt || s.CreatedAt || s.created_at,
    })

    const mapVolume = (v: any): RdsVolume => ({
        id: v.id || v.Id || v.ID || '',
        name: v.name || v.Name || '',
        sizeGb: v.sizeGb || v.SizeGB || 0,
        status: v.status || v.Status || 'available',
        createdAt: v.createdAt || v.CreatedAt || v.created_at,
    })

    const fetchDatabases = async () => {
        isLoading.value = true
        error.value = null
        try {
            const response = await apiClient.get<any>('/rds/databases')
            const raw = Array.isArray(response.data)
                ? response.data
                : response.data?.data || response.data?.databases || []
            databases.value = raw.map(mapDb)
        } catch (e: any) {
            error.value = e?.message || 'Failed to fetch databases'
            console.error('RDS fetch error:', e)
        } finally {
            isLoading.value = false
        }
    }

    const fetchDatabaseById = async (id: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.get<any>(`/rds/databases/${id}`)
            const d = response.data?.data || response.data


            if (d) currentDatabase.value = mapDb(d)
        } catch (e) {
            console.error('RDS fetchById error:', e)
        } finally {
            isLoading.value = false
        }
    }

    const createDatabase = async (payload: { name: string; user: string; password: string }) => {
        isLoading.value = true
        try {
            const response = await apiClient.post('/rds/databases', payload)
            await fetchDatabases()
            return response.data
        } catch (e) {
            console.error('RDS create error:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const deleteDatabase = async (id: string) => {
        try {
            await apiClient.delete(`/rds/databases/${id}`)
            databases.value = databases.value.filter(d => d.id !== id)
        } catch (e) {
            console.error('RDS delete error:', e)
            throw e
        }
    }

    const fetchSnapshots = async (dbId: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.get<any>(`/rds/databases/${dbId}/snapshots`)
            const raw = Array.isArray(response.data)
                ? response.data
                : response.data?.data || response.data?.snapshots || []
            snapshots.value = raw.map(mapSnapshot)
        } catch (e) {
            console.error('RDS fetchSnapshots error:', e)
        } finally {
            isLoading.value = false
        }
    }

    const createSnapshot = async (dbId: string, name: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.post(`/rds/databases/${dbId}/snapshots`, {
                name,
                databaseId: dbId
            })
            return response.data
        } catch (e) {
            console.error('RDS createSnapshot error:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const restoreDatabase = async (snapshotId: string, newDbId: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.post('/rds/databases/restore', {
                snapshotId,
                databaseId: newDbId
            })
            await fetchDatabases()
            return response.data
        } catch (e) {
            console.error('RDS restore error:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const deleteSnapshot = async (snapshotId: string) => {
        try {
            await apiClient.delete(`/rds/snapshots/${snapshotId}`)
            snapshots.value = snapshots.value.filter(s => s.id !== snapshotId)
        } catch (e) {
            console.error('RDS snapshot delete error:', e)
            throw e
        }
    }

    const fetchVolumes = async () => {
        isLoading.value = true
        try {
            const response = await apiClient.get<any>('/rds/volumes')
            const raw = Array.isArray(response.data)
                ? response.data
                : response.data?.data || response.data?.volumes || []
            volumes.value = raw.map(mapVolume)
        } catch (e) {
            console.error('RDS fetchVolumes error:', e)
        } finally {
            isLoading.value = false
        }
    }

    const createRdsVolume = async (payload: { name: string; sizeGb: number }) => {
        isLoading.value = true
        try {
            const response = await apiClient.post('/rds/volumes', payload)
            await fetchVolumes()
            return response.data
        } catch (e) {
            console.error('RDS createVolume error:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const deleteRdsVolume = async (id: string) => {
        try {
            await apiClient.delete(`/rds/volumes/${id}`)
            volumes.value = volumes.value.filter(v => v.id !== id)
        } catch (e) {
            console.error('RDS volume delete error:', e)
            throw e
        }
    }

    const fetchAggregateMetrics = async () => {
        isLoading.value = true
        try {
            const response = await apiClient.get<any>('/rds/databases/metrics/aggregate')
            aggregateMetrics.value = response.data?.data || response.data
        } catch (e) {
            console.error('RDS fetchAggregateMetrics error:', e)
        } finally {
            isLoading.value = false
        }
    }

    const fetchVpcs = async () => {
        isLoading.value = true
        try {
            const response = await apiClient.get<any>('/rds/vpcs')
            const raw = Array.isArray(response.data)
                ? response.data
                : response.data?.data || response.data?.vpcs || []
            vpcs.value = raw
        } catch (e: any) {
            console.error('RDS fetchVpcs error:', e)
        } finally {
            isLoading.value = false
        }
    }

    const changeVpc = async (dbId: string, vpcId: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.put(`/rds/databases/${dbId}/vpc`, { vpc_id: vpcId })
            await fetchDatabaseById(dbId)
            return response.data
        } catch (e) {
            console.error('RDS changeVpc error:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const createVpc = async (name: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.post('/rds/vpcs', { name })
            await fetchVpcs()
            return response.data?.data || response.data
        } catch (e) {
            console.error('RDS createVpc error:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const fetchScalingPolicies = async (dbId?: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.get<any>('/rds/scaling-policies')
            const raw = response.data?.data || response.data || []
            let filtered = Array.isArray(raw) ? raw : []
            if (dbId) {
                filtered = filtered.filter((p: any) => p.target_id === dbId)
            }
            scalingPolicies.value = filtered
        } catch (e) {
            console.error('RDS fetchScalingPolicies error:', e)
        } finally {
            isLoading.value = false
        }
    }

    const createScalingPolicy = async (payload: CreateRdsScalingPolicyPayload) => {
        isLoading.value = true
        try {
            await apiClient.post('/rds/scaling-policies', payload)
            await fetchScalingPolicies()
        } catch (e) {
            console.error('RDS createScalingPolicy error:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const updateScalingPolicy = async (id: string, payload: UpdateRdsScalingPolicyPayload) => {
        isLoading.value = true
        try {
            await apiClient.put(`/rds/scaling-policies/${id}`, payload)
            await fetchScalingPolicies()
        } catch (e) {
            console.error('RDS updateScalingPolicy error:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const deleteScalingPolicy = async (id: string) => {
        isLoading.value = true
        try {
            await apiClient.delete(`/rds/scaling-policies/${id}`)
            scalingPolicies.value = scalingPolicies.value.filter(p => p.id !== id)
        } catch (e) {
            console.error('RDS deleteScalingPolicy error:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    return {
        databases,
        currentDatabase,
        snapshots,
        volumes,
        aggregateMetrics,
        isLoading,
        error,
        fetchDatabases,
        fetchDatabaseById,
        createDatabase,
        deleteDatabase,
        fetchSnapshots,
        createSnapshot,
        restoreDatabase,
        deleteSnapshot,
        fetchVolumes,
        createRdsVolume,
        deleteRdsVolume,
        fetchAggregateMetrics,
        vpcs,
        fetchVpcs,
        changeVpc,
        createVpc,
        scalingPolicies,
        fetchScalingPolicies,
        createScalingPolicy,
        updateScalingPolicy,
        deleteScalingPolicy,
    }
})
