import axios from 'axios'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { featureFlags } from '@/shared/config/featureFlags'

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'X-Request-Source': 'web-serwin'
  },
})

// Request Interceptor: Dynamic routing based on service name
apiClient.interceptors.request.use(
  async (config) => {
    if (config.url && config.url.startsWith('/') && !config.url.startsWith('//')) {
      const serviceName = config.url.split('/')[1] || 'default'
      config.baseURL = (await featureFlags.getServiceUrl(serviceName)).replace(/\/$/, '')
    }

    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    console.log(`--------v------->${config.baseURL}`)


    return config
  },
  (error) => Promise.reject(error),
)

// Response Interceptor: Basic error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore().logout()
    }
    return Promise.reject(error)
  },
)

// Stream method — resolves base URL + auth the same way interceptors do
apiClient.stream = async (url: string, body?: unknown): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
 const serviceName = url.startsWith('/') ? (url.split('/')[1] ?? 'default') : 'default'
  
  const baseURL = (await featureFlags.getServiceUrl(serviceName)).replace(/\/$/, '')

  const authStore = useAuthStore()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (authStore.token) {
    headers['Authorization'] = `Bearer ${authStore.token}`
  }

  const response = await fetch(`${baseURL}${url}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    useAuthStore().logout()
    throw new Error('Unauthorized')
  }

  if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
  if (!response.body) throw new Error('ReadableStream not supported in this browser')

  return response.body.getReader()
}


declare module 'axios' {
  interface AxiosInstance {
    stream: (url: string, body?: unknown) => Promise<ReadableStreamDefaultReader<Uint8Array>>
  }
}

export default apiClient