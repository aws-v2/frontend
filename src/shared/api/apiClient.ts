import axios from 'axios'
import { useAuthStore } from '@/modules/auth/store/authStore'

const viteAppProfile = import.meta.env.VITE_APP_PROFILE
const isProdProfile = viteAppProfile === 'prod'
const isStagingProfile = viteAppProfile === 'staging'

// List of potential backend URLs for staging (in priority order)
const STAGING_URLS = [
  '/api/v1',                                  // 1. Nginx Proxy (Standard)
  'http://api-gateway:8080/api/v1',           // 2. Docker Service Name
  'http://api-gateway-staging:8080/api/v1',   // 3. Docker Container Name
  'http://172.18.0.2:8080/api/v1',            // 4. Internal IP (Example)
]

const defaultBaseUrl = isProdProfile
  ? 'http://13.48.129.233:8080/api/v1'
  : (isStagingProfile ? STAGING_URLS[0] : 'http://localhost:8080/api/v1')

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Fallback "Cycling" Discovery (Staging only)
if (isStagingProfile && !import.meta.env.VITE_API_BASE_URL) {
  (async () => {
    for (const url of STAGING_URLS) {
      try {
        console.log(`[API Client] Probing: ${url}...`)
        // Simple GET request to check connectivity
        await axios.get(url, { timeout: 2000 }) 
        apiClient.defaults.baseURL = url
        console.log(`[API Client] Connected! Using: ${url}`)
        break
      } catch (err) {
        console.warn(`[API Client] ${url} not reachable.`)
      }
    }
  })()
}

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
