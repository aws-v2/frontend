import axios from 'axios'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { featureFlags } from '@/shared/config/featureFlags'

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Dynamic routing based on service name
apiClient.interceptors.request.use(
  async (config) => {
    // If URL starts with / and doesn't have a protocol, resolve base URL
    if (config.url && config.url.startsWith('/') && !config.url.startsWith('//')) {
      const serviceName = config.url.split('/')[1] || 'default'
      console.log('serviceName', serviceName)
      config.baseURL = (await featureFlags.getServiceUrl(serviceName)).replace(/\/$/, '')
      console.log('config.baseURL', config.baseURL)
    }

    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

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

export default apiClient