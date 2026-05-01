/**
 * Feature Flag and Dynamic Service URL Manager
 */

export type ServiceEnv = 'dev' | 'staging' | 'prod'

const STAGING_TAILSCALE_IP = import.meta.env.VITE_STAGING_TAILSCALE_IP
const STAGING_LOCAL_IP = import.meta.env.VITE_STAGING_LOCAL_IP

const SERVICE_URLS: Record<ServiceEnv, string> = {
  dev: 'http://localhost:8080/api/v1',
  staging: `http://${STAGING_TAILSCALE_IP}:8080/api/v1`, // resolved dynamically at runtime
  prod: 'http://13.48.129.233:8080/api/v1'
}

const getEnv = (key: string) => import.meta.env[key]
const getStorage = (key: string) => localStorage.getItem(key)

// Cache so we only probe once per session
let resolvedStagingUrl: string | null = null

/**
 * Probes a URL with a short timeout. Returns true if reachable.
 */
async function probe(baseUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)
    await fetch(`${baseUrl}/gateway/docs`, {
      signal: controller.signal,
      method: 'GET',
    })
    clearTimeout(timeout)
    return true
  } catch {
    return false
  }
}

/**
 * Tries Tailscale first, falls back to local IP.
 * Result is cached for the session.
 */
async function resolveStagingUrl(): Promise<string> {
  const appProfile = getEnv('VITE_APP_PROFILE') as ServiceEnv
  if (appProfile === 'prod') {
    console.info('[prod] Using production URL:', SERVICE_URLS.prod)
    return SERVICE_URLS.prod
  }
  if (resolvedStagingUrl) return resolvedStagingUrl

  const tailscaleUrl = `http://${STAGING_TAILSCALE_IP}:8080/api/v1`
  const localUrl = `http://${STAGING_LOCAL_IP}:8080/api/v1`

  if (await probe(tailscaleUrl)) {
    console.info('[staging] Reachable via Tailscale:', tailscaleUrl)
    resolvedStagingUrl = tailscaleUrl
  } else if (await probe(localUrl)) {
    console.info('[staging] Tailscale failed, using local IP:', localUrl)
    resolvedStagingUrl = localUrl
  } else {
    console.warn('[staging] Both Tailscale and local unreachable. Defaulting to Tailscale.')
    resolvedStagingUrl = tailscaleUrl
  }

  return resolvedStagingUrl
}

export const featureFlags = {
  /**
   * Resolves the base URL for a service.
   * For staging, probes Tailscale first and falls back to local IP.
   * Priority: localStorage -> .env (VITE_FF_SERVICE_X) -> Global profile -> Default
   */
  async getServiceUrl(service: string): Promise<string> {
    const envKey = `VITE_FF_SERVICE_${service.toUpperCase()}`
    const storageKey = `ff_service_${service.toLowerCase()}`

    const override = getStorage(storageKey) || getEnv(envKey) || getEnv('VITE_APP_PROFILE')
    const env: ServiceEnv = (override as ServiceEnv) || 'dev'

    let baseUrl: string

    if (env === 'staging') {
      baseUrl = await resolveStagingUrl()
    } else {
      baseUrl = SERVICE_URLS[env] || SERVICE_URLS.dev
    }

    return baseUrl.replace(/\/$/, '') + '/'
  },

  /**
   * Checks if a feature is enabled.
   * Supports toggling via localStorage for easy debugging.
   */
  isEnabled(flag: string, defaultValue = false): boolean {
    const envKey = `VITE_FF_${flag.toUpperCase()}`
    const storageKey = `ff_${flag.toLowerCase()}`

    const storageVal = getStorage(storageKey)
    if (storageVal !== null) return storageVal === 'true'

    const envVal = getEnv(envKey)
    if (envVal !== undefined) return envVal === 'true'

    return defaultValue
  },

  /**
   * Sets a feature flag override in localStorage for the current session.
   */
  setOverride(flag: string, value: boolean | string | null) {
    const key = `ff_${flag.toLowerCase()}`
    if (value === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, String(value))
    }
  },

  /**
   * Forces re-probe of staging URL on next getServiceUrl call.
   * Useful if the network changes mid-session.
   */
  resetStagingCache() {
    resolvedStagingUrl = null
  }
}