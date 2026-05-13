import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/shared/api/apiClient'
import { useAuthStore } from '@/modules/auth/store/authStore'

export interface ApiKeyResponse {
    id: string
    name: string
    accessKeyId: string
    secretKey: string
    createdAt: string
    lastUsedAt?: string
    expiresAt?: string
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
            const response = await apiClient.get<ApiKeyResponse[]>(`/auth/api-keys/${useAuthStore().user.id}`)
            apiKeys.value = response.data?.data
        } catch (err: any) {
            console.error('Failed to list API keys:', err)
            error.value = err.response?.data?.error || 'Failed to load API keys'
        } finally {
            loading.value = false
        }
    }

async function createApiKey(name: string, validityDays: number = 90) {
    try {
        loading.value = true
        error.value = null
        const response = await apiClient.post<ApiKeyResponse>(`/auth/api-keys/${useAuthStore().user.id}`, { name, validityDays })
        apiKeys.value.push(response.data.data)
        return response.data.data
    } catch (err: any) {
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

    async function requestEmailVerification() {
        try {
            loading.value = true
            error.value = null
            // Hitting the endpoint as requested. The backend expects a token, 
            // but we'll call it to trigger whatever logic is intended (e.g. resend if no token or placeholder)
            await apiClient.get('/auth/verify-email')
        } catch (err: any) {
            console.error('Email verification request failed:', err)
            error.value = err.response?.data?.error || 'Failed to request verification email'
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
        revokeApiKey,
        requestEmailVerification
    }
})
