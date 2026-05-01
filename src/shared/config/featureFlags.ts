import { getRemoteConfig } from '@/shared/config/remoteConfig'

export type ServiceEnv = 'dev' | 'staging' | 'prod'

const SERVICE_URLS: Record<ServiceEnv, string> = {
  dev: 'http://localhost:8080/api/v1',
  staging: 'http://localhost:8080/api/v1', // Resolved dynamically in resolveStagingUrl
  prod: 'http://13.48.129.233:8080/api/v1'
}

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
  const config = getRemoteConfig()
  const appProfile = config.VITE_APP_PROFILE as ServiceEnv
  
  if (appProfile === 'prod') {
    return SERVICE_URLS.prod
  }
  if (appProfile === 'staging') {
    return SERVICE_URLS.staging
  }
  if (resolvedStagingUrl) return resolvedStagingUrl

  const stagingTailscaleIp = config.VITE_STAGING_TAILSCALE_IP
  const stagingLocalIp = config.VITE_STAGING_LOCAL_IP

  const tailscaleUrl = `http://${stagingTailscaleIp}:8080/api/v1`
  const localUrl = `http://${stagingLocalIp}:8080/api/v1`

  if (stagingTailscaleIp && await probe(tailscaleUrl)) {
    console.info('[staging] Reachable via Tailscale:', tailscaleUrl)
    resolvedStagingUrl = tailscaleUrl
  } else if (stagingLocalIp && await probe(localUrl)) {
    console.info('[staging] Tailscale failed, using local IP:', localUrl)
    resolvedStagingUrl = localUrl
  } else {
    console.warn('[staging] Both Tailscale and local unreachable or not configured. Defaulting to Tailscale.')
    resolvedStagingUrl = tailscaleUrl
  }

  return resolvedStagingUrl
}

export const featureFlags = {
  /**
   * Resolves the base URL for a service.
   * Priority: localStorage -> remoteConfig (VITE_FF_SERVICE_X) -> Global profile -> Default
   */
async getServiceUrl(service: string): Promise<string> {
  const config = getRemoteConfig()
  const envKey = `VITE_FF_SERVICE_${service.toUpperCase()}`
  const storageKey = `ff_service_${service.toLowerCase()}`

  const profile = config.VITE_APP_PROFILE as ServiceEnv
  const override = getStorage(storageKey) || config[envKey]


console.log(`the configs : ${JSON.stringify(config)}`)
console.log(`the override : ${JSON.stringify(override)}`)
console.log(`the envKey : ${JSON.stringify(envKey)}`)
console.log(`profile: ${config.VITE_APP_PROFILE}`)




  // If dev, respect whatever the service flag says, else stick to profile
  const env: ServiceEnv = (profile === 'dev'
    ? (override as ServiceEnv) || 'dev'
    : profile) || 'dev'

  let baseUrl: string

  if (env === 'staging') {
    baseUrl = await resolveStagingUrl()
  } else if (env === 'prod') {
    baseUrl = SERVICE_URLS.prod
  } else {
    baseUrl = config.VITE_API_BASE_URL || SERVICE_URLS.dev
  }

  return baseUrl.replace(/\/$/, '') + '/'
},

  /**
   * Checks if a feature is enabled.
   * Checks localStorage, then remoteConfig.
   */
  isEnabled(flag: string, defaultValue = false): boolean {
    const config = getRemoteConfig()
    const envKey = `VITE_FF_${flag.toUpperCase()}`
    const storageKey = `ff_${flag.toLowerCase()}`

    const storageVal = getStorage(storageKey)
    if (storageVal !== null) return storageVal === 'true'

    const configVal = config[envKey]
    if (configVal !== undefined) return configVal === 'true'

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
   */
  resetStagingCache() {
    resolvedStagingUrl = null
  }
}