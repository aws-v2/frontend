import axios from 'axios'
import { useAuthStore } from '@/modules/auth/store/authStore'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

console.log(`[API Client] Initialized with profile: ${import.meta.env.VITE_APP_PROFILE}`)

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
