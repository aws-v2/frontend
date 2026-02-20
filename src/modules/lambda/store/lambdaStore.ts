import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/shared/api/apiClient'

export interface LambdaFunction {
    id: string
    name: string
    runtime: string
    lastModified: string
    status: string
    description: string
    memory?: number
    timeout?: number
}

export const useLambdaStore = defineStore('lambda', () => {
    const functions = ref<LambdaFunction[]>([
        // Mock data for initial development
        { id: '1', name: 'process-image', runtime: 'Node.js 24.x', lastModified: '2026-02-10 14:30', status: 'Active', description: 'Handles image processing' },
        { id: '2', name: 'send-email', runtime: 'Python 3.13', lastModified: '2026-02-11 09:15', status: 'Active', description: 'Sends welcome emails' },
        { id: '3', name: 'data-cleanup', runtime: 'Java 21', lastModified: '2026-01-20 11:00', status: 'Inactive', description: 'Daily data cleaning job' }
    ])
    const isLoading = ref(false)
    const currentFunction = ref<LambdaFunction | null>(null)

    const fetchFunctions = async () => {
        isLoading.value = true
        try {
            const response = await apiClient.get<{ data: any[] }>('/lambda/functions')
            const rawData = response.data?.data || []
            if (rawData.length > 0) {
                functions.value = rawData.map(f => ({
                    id: f.id,
                    name: f.name,
                    runtime: f.runtime,
                    lastModified: f.last_modified || f.lastModified,
                    status: f.status || 'Active',
                    description: f.description || ''
                }))
            }
        } catch (error) {
            console.error('Failed to fetch lambda functions:', error)
            // Keep mock data if API fails for now
        } finally {
            isLoading.value = false
        }
    }

    const fetchFunctionById = async (id: string) => {
        isLoading.value = true
        try {
            // First check if we already have it in the list to avoid flickers
            const existing = functions.value.find(f => f.id === id)
            if (existing) currentFunction.value = existing

            const response = await apiClient.get<{ data: any }>(`/lambda/functions/${id}`)
            const data = response.data?.data
            if (data) {
                currentFunction.value = {
                    id: data.id,
                    name: data.name,
                    runtime: data.runtime,
                    lastModified: data.last_modified || data.lastModified,
                    status: data.status || 'Active',
                    description: data.description || ''
                }
            }
        } catch (error) {
            console.error(`Failed to fetch lambda function ${id}:`, error)
            // Fallback to mock if not found in list
            if (!currentFunction.value) {
                const mock = functions.value.find(f => f.id === id)
                if (mock) currentFunction.value = mock
            }
        } finally {
            isLoading.value = false
        }
    }

    return {
        functions,
        currentFunction,
        isLoading,
        fetchFunctions,
        fetchFunctionById
    }
})
