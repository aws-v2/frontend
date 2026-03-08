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
    arn?: string
}

export interface LambdaMetrics {
    invocations: number
    duration: number
    errors: number
    timeline: { timestamp: string; value: number }[]
}

export const useLambdaStore = defineStore('lambda', () => {
    const functions = ref<LambdaFunction[]>([])
    const isLoading = ref(false)
    const currentFunction = ref<LambdaFunction | null>(null)
    const lastTestResult = ref<any>(null)
    const metrics = ref<LambdaMetrics | null>(null)

    const fetchFunctions = async () => {
        isLoading.value = true
        try {
            const response = await apiClient.get<any>('/lambda/functions')
            // Handle both { data: [] } and raw [] response formats
            const rawData = Array.isArray(response.data) ? response.data : response.data?.data || []

            if (rawData.length > 0) {
                functions.value = rawData.map((f: any) => ({
                    id: f.Name || f.id,
                    name: f.Name || f.name,
                    runtime: f.Execution?.kind ? f.Execution.kind.toUpperCase() : (f.runtime || 'SCRIPT'),
                    lastModified: f.last_modified || f.lastModified || new Date().toISOString().slice(0, 16).replace('T', ' '),
                    status: f.status || 'Active',
                    description: f.description || '',
                    memory: f.Resources?.memory || f.memory,
                    timeout: f.TimeoutMS ? f.TimeoutMS / 1000 : f.timeout,
                    arn: f.ARN || f.arn
                }))
            }
        } catch (error) {
            console.error('Failed to fetch lambda functions:', error)
        } finally {
            isLoading.value = false
        }
    }

    const fetchFunctionById = async (id: string) => {
        isLoading.value = true
        try {
            const existing = functions.value.find(f => f.id === id)
            if (existing) currentFunction.value = existing

            const response = await apiClient.get<any>(`/lambda/functions/${id}`)
            const data = response.data?.data || response.data

            if (data) {
                currentFunction.value = {
                    id: data.Name || data.id,
                    name: data.Name || data.name,
                    runtime: data.Execution?.kind ? data.Execution.kind.toUpperCase() : (data.runtime || 'SCRIPT'),
                    lastModified: data.last_modified || data.lastModified || new Date().toISOString().slice(0, 16).replace('T', ' '),
                    status: data.status || 'Active',
                    description: data.description || '',
                    memory: data.Resources?.memory || data.memory,
                    timeout: data.TimeoutMS ? data.TimeoutMS / 1000 : data.timeout,
                    arn: data.ARN || data.arn
                }
            }
        } catch (error) {
            console.error(`Failed to fetch lambda function ${id}:`, error)
            if (!currentFunction.value) {
                const mock = functions.value.find(f => f.id === id)
                if (mock) currentFunction.value = mock
            }
        } finally {
            isLoading.value = false
        }
    }

    const registerFunction = async (formData: FormData) => {
        isLoading.value = true
        try {
            const response = await apiClient.post('/lambda/functions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            return response.data
        } catch (error) {
            console.error('Failed to register lambda function:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const invokeFunction = async (id: string, payload: any) => {
        isLoading.value = true
        try {
            // In a real app, this would be a POST to an invocation endpoint
            // For now, we simulate a latency and return the payload with some metadata
            await new Promise(resolve => setTimeout(resolve, 800))
            lastTestResult.value = {
                status: 200,
                latency: Math.floor(Math.random() * 50) + 10,
                response: {
                    message: "Execution successful",
                    inputReceived: payload,
                    timestamp: new Date().toISOString()
                }
            }
            return lastTestResult.value
        } catch (error) {
            console.error('Failed to invoke function:', error)
            lastTestResult.value = { status: 500, error: 'Execution failed' }
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const fetchMetrics = async (name: string) => {
        try {
            const response = await apiClient.get<LambdaMetrics>(`/lambda/functions/${name}/metrics`)
            metrics.value = response.data
        } catch (error) {
            console.error(`Failed to fetch metrics for ${name}:`, error)
        }
    }

    const updateConfiguration = async (name: string, config: Partial<LambdaFunction>) => {
        isLoading.value = true
        try {
            const response = await apiClient.patch(`/lambda/functions/${name}/config`, {
                memory: config.memory,
                timeout: config.timeout,
                description: config.description
            })
            if (currentFunction.value) {
                currentFunction.value = { ...currentFunction.value, ...config }
            }
            return response.data
        } catch (error) {
            console.error('Failed to update configuration:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const deletePolicy = async (id: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.delete(`/lambda/policies/${id}`)
            return response.data
        } catch (error) {
            console.error(`Failed to delete policy ${id}:`, error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    return {
        functions,
        currentFunction,
        isLoading,
        lastTestResult,
        metrics,
        fetchFunctions,
        fetchFunctionById,
        registerFunction,
        invokeFunction,
        fetchMetrics,
        updateConfiguration,
        deletePolicy
    }
})
