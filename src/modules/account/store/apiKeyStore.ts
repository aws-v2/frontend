import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/shared/api/apiClient'

export interface ApiKeyResponse {
    id: string
    name: string
    accessKeyId: string
    secretAccessKey?: string
    createdAt: string
    lastUsedAt?: string
    status: 'ACTIVE' | 'REVOKED'
}

export const useApiKeyStore = defineStore('apiKey', () => {
    const apiKeys = ref<ApiKeyResponse[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function listApiKeys() {
        try {
            loading.value = true
            error.value = null
            const response = await apiClient.get<ApiKeyResponse[]>('/auth/api-keys')
            apiKeys.value = response.data
        } catch (err: any) {
            console.error('Failed to list API keys:', err)
            error.value = err.response?.data?.error || 'Failed to load API keys'
        } finally {
            loading.value = false
        }
    }

    async function createApiKey(name: string) {
        try {
            loading.value = true
            error.value = null
            const response = await apiClient.post<ApiKeyResponse>('/auth/api-keys', { name })
            // Add the new key to the list (backend returns full object including masked accessKeyId)
            apiKeys.value.push(response.data)
            return response.data
        } catch (err: any) {
            console.error('Failed to create API key:', err)
            error.value = err.response?.data?.error || 'Failed to create API key'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function revokeApiKey(keyId: string) {
        try {
            loading.value = true
            error.value = null
            await apiClient.delete(`/auth/api-keys/${keyId}`)
            // Update local state by removing/updating the revoked key
            apiKeys.value = apiKeys.value.filter(key => key.id !== keyId)
        } catch (err: any) {
            console.error('Failed to revoke API key:', err)
            error.value = err.response?.data?.error || 'Failed to revoke API key'
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        apiKeys,
        loading,
        error,
        listApiKeys,
        createApiKey,
        revokeApiKey
    }
})
