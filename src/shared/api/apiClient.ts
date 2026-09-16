import axios from 'axios'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { featureFlags } from '@/shared/config/featureFlags'

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'X-Request-Source': 'web-serwin',
    
  },
})

// Request Interceptor: Dynamic routing based on service name
apiClient.interceptors.request.use(
  async (config) => {
    if (config.url && config.url.startsWith('/') && !config.url.startsWith('//')) {
      const serviceName = config.url.split('/')[1] || 'default'
      const base = await featureFlags.getServiceUrl(serviceName)
      config.baseURL = base.replace(/\/$/, '')
    console.log(`-------thisis thebase -v------->${base}`)
    console.log(`-------thisis servicename -v------->${serviceName}`)
    console.log(`-------thisis config.url -v------->${config.url}`)
      
      // Axios quirk: leading slash on url strips prefix (like /api/v1) from baseURL.
      // We manually ensure it's treated as relative to the concatenated result.
      if (config.url.startsWith('/')) {
        config.url = config.url.substring(1)
      }
    }

    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    console.log(`--------*v------->${config.baseURL}`)


    return config
  },
  (error) => Promise.reject(error),
)

// Response Interceptor: Basic error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        const authStore = useAuthStore()
        // Determine the service from the request URL (e.g. 'auth', 'llm', etc.)
        const reqUrl: string = error.config?.url || ''
        const service = reqUrl.split('/')[0] || ''

        // Only perform automatic logout when the 401 comes from the identity/auth service.
        // Other 401s (expired token on downstream services) should be handled by the caller.
        if (service === 'auth' || reqUrl.includes('/auth/')) {
          if (authStore.token) {
            authStore.logout()
          }
        } else {
          console.warn('[apiClient] 401 received from', service, '- skipping automatic logout')
        }
      } catch (e) {
        // Fallback: if anything unexpected happens, avoid accidentally logging out the user.
        console.warn('[apiClient] error handling 401 response', e)
      }
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

  const fullUrl = `${baseURL}/${url.startsWith('/') ? url.substring(1) : url}`
  const response = await fetch(fullUrl, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    // Only logout if the stream endpoint is the auth service
    try {
      const urlParts = url.startsWith('/') ? url.substring(1).split('/') : url.split('/')
      const service = urlParts[0] || ''
      if (service === 'auth' || url.includes('/auth/')) {
        useAuthStore().logout()
      } else {
        console.warn('[apiClient.stream] 401 from', service, '- skipping automatic logout')
      }
    } catch (e) {
      console.warn('[apiClient.stream] error handling 401 response', e)
    }
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