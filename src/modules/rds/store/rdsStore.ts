import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/shared/api/apiClient'

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
}

export interface RdsSnapshot {
    id: string
    name: string
    dbId: string
    status: string
    createdAt: string
}

export const useRdsStore = defineStore('rds', () => {
    const databases = ref<RdsDatabase[]>([])
    const currentDatabase = ref<RdsDatabase | null>(null)
    const snapshots = ref<RdsSnapshot[]>([])
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
    })

    const mapSnapshot = (s: any): RdsSnapshot => ({
        id: s.id || s.Id || '',
        name: s.name || s.Name || '',
        dbId: s.dbId || s.DatabaseID || '',
        status: s.status || s.Status || 'available',
        createdAt: s.createdAt || s.CreatedAt || s.created_at,
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
            const response = await apiClient.post(`/rds/databases/${dbId}/snapshots`, { name })
            return response.data
        } catch (e) {
            console.error('RDS createSnapshot error:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    return {
        databases,
        currentDatabase,
        snapshots,
        isLoading,
        error,
        fetchDatabases,
        fetchDatabaseById,
        createDatabase,
        deleteDatabase,
        fetchSnapshots,
        createSnapshot,
    }
})
