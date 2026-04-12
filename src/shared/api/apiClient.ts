import axios from 'axios'
import { useAuthStore } from '@/modules/auth/store/authStore'

const viteAppProfile = import.meta.env.VITE_APP_PROFILE
const isProdProfile = viteAppProfile === 'prod'
const isStagingProfile = viteAppProfile === 'staging'

// List of potential backend URLs for staging (in priority order)
const STAGING_URLS = [
  'http://api-gateway:8080/api/v1',           // 2. Docker Service Name
  'http://api-gateway-staging:8080/api/v1',   // 3. Docker Container Name
  'http://172.10.18.06:8080/api/v1',            // 4. Internal IP (Example)
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
  const probeResults: string[] = []
  
  for (const url of STAGING_URLS) {
    try {
      // Simple GET request to check connectivity
      const response = await axios.get(url, { 
        timeout: 2000,
        validateStatus: () => true // Accept any status code (2xx, 4xx, 5xx) as "reachable"
      }) 
      apiClient.defaults.baseURL = url
      probeResults.push(`✅ ${url} (Responded with ${response.status})`)
      break
    } catch (err: any) {
      const reason = err.response ? `HTTP ${err.response.status}` : (err.code || 'Network Error')
      probeResults.push(`❌ ${url} (${reason})`)
    }
  }

  console.group('[API Client] Backend Discovery Summary')
  probeResults.forEach(res => console.log(res))
  console.groupEnd()
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
