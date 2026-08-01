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
const selectedFile = ref<File | null>(null)

export const useLambdaStore = defineStore('lambda', () => {
    const functions = ref<LambdaFunction[]>([])
    const isLoading = ref(false)
    const currentFunction = ref<LambdaFunction | null>(null)
    const lastTestResult = ref<any>(null)
    const metrics = ref<LambdaMetrics | null>(null)
    const policies = ref<any[]>([])

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
    async function uploadToS3(url: string, file: File) {


        try {
            const res = await apiClient.put(url, file, {
                headers: {
                    'Content-Type': file.type || 'application/octet-stream',
                },
                transformRequest: [(data) => data],
            })


            return res
        } catch (err: any) {

            throw err
        }
    }

    const registerFunction = async (formData: FormData, data:any) => {
    selectedFile.value = data.file as File  

        isLoading.value = true
        try {
            const response = await apiClient.post('/lambda/functions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            // return response.data
            // this returns 
            // {
            //     "artifact_path": "/api/v1/s3/files/upload?t=eyJhIjoiOTlkOTA2ODAtZDJhZC00ODU4LThmMjItZjFkZTEyYWZhY2VkIiwiYiI6ImdhbWVsaWZ0Z2FtZXMtZGVmYXVsdCIsImUiOjE3ODQ3ODUzNDgsImsiOiJ1cGxvYWRzL2dhbWVzLzk5ZDkwNjgwLWQyYWQtNDg1OC04ZjIyLWYxZGUxMmFmYWNlZC9nYW1lIiwibSI6IlBVVCIsInNoYSI6ImZkOTE0ZWRkYTVjZTQxNDc4NGNiMGRmYjBkNDAzNmUyMjNlNTIyMjdlZmU5MDFlMTE3MzQwNjM4MTlhYWRlYTgiLCJ1IjoiMWU3NTAwMzItNjk5OC00NjE5LTg2NzQtMWNmZTU1NTlhODdmIiwidWlkIjoiMTg0ZTkyY2YtMTRhOC00NmJhLWFhYjAtZGQ2YTU3NDUyNGE0In0.7b2c3017b1330066ce2f259ea9b287e8fdf048068a8fcadbde4b96aee33df0c1\u0026token=eyJhbGciOiJIUzM4NCJ9.eyJhIjoiOTlkOTA2ODAtZDJhZC00ODU4LThmMjItZjFkZTEyYWZhY2VkIiwidWlkIjoiMTg0ZTkyY2YtMTRhOC00NmJhLWFhYjAtZGQ2YTU3NDUyNGE0IiwiYiI6ImdhbWVsaWZ0Z2FtZXMtZGVmYXVsdCIsImUiOjE3ODQ3ODUzNDgsInUiOiIxZTc1MDAzMi02OTk4LTQ2MTktODY3NC0xY2ZlNTU1OWE4N2YiLCJjb3JyZWxhdGlvbklkIjoiZmVlZjU3MGEtZTRjMS00YTU2LTg1MGEtOTZjYjdjMDQxNDg4IiwiayI6InVwbG9hZHMvZ2FtZXMvOTlkOTA2ODAtZDJhZC00ODU4LThmMjItZjFkZTEyYWZhY2VkL2dhbWUiLCJtIjoiUFVUIiwic2hhIjoiZmQ5MTRlZGRhNWNlNDE0Nzg0Y2IwZGZiMGQ0MDM2ZTIyM2U1MjIyN2VmZTkwMWUxMTczNDA2MzgxOWFhZGVhOCIsInVzZXJJZCI6IjE4NGU5MmNmLTE0YTgtNDZiYS1hYWIwLWRkNmE1NzQ1MjRhNCIsInN1YiI6IjE4NGU5MmNmLTE0YTgtNDZiYS1hYWIwLWRkNmE1NzQ1MjRhNCIsImlhdCI6MTc4NDc4NDQ0OCwiZXhwIjoxNzg0ODcwODQ4fQ.u62UHPfR6OTNrtfd6wtgjMCWcBeCfAiqm3ifs0jLi06DudsbBtWtF93andgeVj5N",
            //     "message": "function registered successfully",
            //     "name": "yet"
            // }



            const result = response.data as {
                message: string
                name: string
                artifact_path: string
            }

            console.log('Received upload data:', result)

            if (!result?.artifact_path) {
                throw new Error('Server did not return a valid upload URL.')
            }




  await uploadToS3(
            result?.artifact_path.replace('/api/v1', ''),
            selectedFile.value
        )





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

    const fetchPolicies = async () => {
        isLoading.value = true
        try {
            const response = await apiClient.get<any>('/lambda/policies')
            policies.value = response.data?.data || response.data || []
        } catch (error) {
            console.error('Failed to fetch scaling policies:', error)
        } finally {
            isLoading.value = false
        }
    }

    const createPolicy = async (functionId: string, payload: any) => {
        isLoading.value = true
        try {
            console.log(payload)
            console.log("functionId")
            await apiClient.post(`/lambda/${functionId}/policies`, payload)
            await fetchPolicies()
        } catch (error) {
            console.error('Failed to create scaling policy:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const updatePolicy = async (functionId: string, payload: any) => {
        isLoading.value = true
        try {
            await apiClient.put(`/lambda/${functionId}/policies`, payload)
            await fetchPolicies()
        } catch (error) {
            console.error('Failed to update scaling policy:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const deletePolicy = async (functionId: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.delete(`/lambda/${functionId}/policies`)
            await fetchPolicies()
            return response.data
        } catch (error) {
            console.error(`Failed to delete policy for ${functionId}:`, error)
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
        policies,
        fetchFunctions,
        fetchFunctionById,
        registerFunction,
        invokeFunction,
        fetchMetrics,
        updateConfiguration,
        fetchPolicies,
        createPolicy,
        updatePolicy,
        deletePolicy
    }
})
