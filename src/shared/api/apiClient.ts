import axios from 'axios'
import { useAuthStore } from '@/modules/auth/store/authStore'

const viteAppProfile = import.meta.env.VITE_APP_PROFILE
const isProdProfile = viteAppProfile === 'prod'
const isStagingProfile = viteAppProfile === 'staging'

const defaultBaseUrl = isProdProfile
  ? 'http://13.48.129.233:8080/api/v1'
  : (isStagingProfile ? 'http://api-gateway-staging:8080/api/v1' : 'http://localhost:8080/api/v1')

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

console.log(`[API Client] Initialized with profile: ${viteAppProfile}, Base URL: ${apiClient.defaults.baseURL}`)

// Request Interceptor: Attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response Interceptor: Handle 401 Unauthorized (Global Logout/Redirect)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      // Optional: Redirect to login or show toast
    }
    return Promise.reject(error)
  },
)

export default apiClient
