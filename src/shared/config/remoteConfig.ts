// src/shared/config/remoteConfig.ts

export type RemoteConfig = {
  VITE_APP_PROFILE: string
  VITE_API_BASE_URL?: string
  VITE_SHOW_GAMING_COMING_SOON?: string
  VITE_STAGING_TAILSCALE_IP: string
  VITE_STAGING_LOCAL_IP: string
  [key: string]: string | undefined
}

let cachedConfig: RemoteConfig | null = null
let pollingInterval: ReturnType<typeof setInterval> | null = null

export async function loadRemoteConfig(): Promise<RemoteConfig> {
  var CONFIG_FILE = '/config.json'

  try {
    const profile = import.meta.env.VITE_APP_PROFILE ?? 'dev'

    if (profile == 'staging') {
      CONFIG_FILE = '/config-staging.json'
    }

    if (profile == 'prod') {
      CONFIG_FILE = '/config-prod.json'
    }

    const res = await fetch(CONFIG_FILE, { cache: 'no-store' })
    if (!res.ok) throw new Error('config.json not found')
    cachedConfig = await res.json()
    console.info('[config] Loaded remote config:', cachedConfig)
    console.log(profile)




    
  } catch {
    console.warn(
      `[config] Remote config unavailable at ${CONFIG_FILE}, falling back to environment defaults`,
    )

    const profile = import.meta.env.VITE_APP_PROFILE ?? 'devvie'

    // Built-in staging fallback
    if (profile == 'staging') {
      cachedConfig = {

        VITE_API_BASE_URL: 'http://api-gateway-staging:8080/api/v1',
        VITE_APP_PROFILE: 'staging',
        VITE_SHOW_GAMING_COMING_SOON: 'true',

        VITE_STAGING_TAILSCALE_IP: '100.71.223.121',
        VITE_STAGING_LOCAL_IP: '192.168.x.x',

        VITE_FF_SERVICE_S3: 'staging',
        VITE_FF_SERVICE_RDS: 'staging',
        VITE_FF_SERVICE_NETWORK: 'staging',
        VITE_FF_SERVICE_METRICS: 'staging',
        VITE_FF_SERVICE_LAMBDA: 'staging',
        VITE_FF_SERVICE_GAMELIFT: 'staging',
        VITE_FF_SERVICE_FARGATE: 'staging',
        VITE_FF_SERVICE_EC2: 'staging',
        VITE_FF_SERVICE_IDENTITY: 'staging',
        VITE_FF_SERVICE_CONFIG: 'staging',
        VITE_FF_SERVICE_BILLING: 'staging',
        VITE_FF_SERVICE_AUTH: 'staging',
        VITE_FF_SERVICE_LLM: 'staging',
        VITE_FF_SERVICE_GATEWAY: 'dev',
      }

      return cachedConfig
    }

    // Generic env fallback
    cachedConfig = {
      VITE_APP_PROFILE: import.meta.env.VITE_APP_PROFILE ?? 'dev',

      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',

      VITE_STAGING_TAILSCALE_IP: import.meta.env.VITE_STAGING_TAILSCALE_IP ?? '',

      VITE_STAGING_LOCAL_IP: import.meta.env.VITE_STAGING_LOCAL_IP ?? '',

      VITE_SHOW_GAMING_COMING_SOON: import.meta.env.VITE_SHOW_GAMING_COMING_SOON ?? 'false',

      VITE_FF_SERVICE_S3: import.meta.env.VITE_FF_SERVICE_S3 ?? 'dev',

      VITE_FF_SERVICE_RDS: import.meta.env.VITE_FF_SERVICE_RDS ?? 'dev',

      VITE_FF_SERVICE_NETWORK: import.meta.env.VITE_FF_SERVICE_NETWORK ?? 'dev',

      VITE_FF_SERVICE_METRICS: import.meta.env.VITE_FF_SERVICE_METRICS ?? 'dev',

      VITE_FF_SERVICE_LAMBDA: import.meta.env.VITE_FF_SERVICE_LAMBDA ?? 'dev',

      VITE_FF_SERVICE_GAMELIFT: import.meta.env.VITE_FF_SERVICE_GAMELIFT ?? 'dev',

      VITE_FF_SERVICE_FARGATE: import.meta.env.VITE_FF_SERVICE_FARGATE ?? 'dev',

      VITE_FF_SERVICE_EC2: import.meta.env.VITE_FF_SERVICE_EC2 ?? 'dev',

      VITE_FF_SERVICE_IDENTITY: import.meta.env.VITE_FF_SERVICE_IDENTITY ?? 'dev',

      VITE_FF_SERVICE_CONFIG: import.meta.env.VITE_FF_SERVICE_CONFIG ?? 'dev',

      VITE_FF_SERVICE_BILLING: import.meta.env.VITE_FF_SERVICE_BILLING ?? 'dev',

      VITE_FF_SERVICE_AUTH: import.meta.env.VITE_FF_SERVICE_AUTH ?? 'dev',

      VITE_FF_SERVICE_LLM: import.meta.env.VITE_FF_SERVICE_LLM ?? 'dev',

      VITE_FF_SERVICE_GATEWAY: import.meta.env.VITE_FF_SERVICE_GATEWAY ?? 'dev',
    }

    // Dynamically copy any VITE_ variables defined in the env
    for (const key in import.meta.env) {
      if (key.startsWith('VITE_') && import.meta.env[key] !== undefined) {
        cachedConfig[key] = import.meta.env[key] as string
      }
    }
  }
  return cachedConfig!
}

export function getRemoteConfig(): RemoteConfig {
  if (!cachedConfig) throw new Error('Remote config not loaded yet. Call loadRemoteConfig() first.')
  return cachedConfig
}

/**
 * Polls config.json every intervalMs and calls onChange if values changed.
 * Useful for picking up hot swaps without a page reload.
 */
export function watchRemoteConfig(onChange: (config: RemoteConfig) => void, intervalMs = 30_000) {
  if (pollingInterval) clearInterval(pollingInterval)

  pollingInterval = setInterval(async () => {
    const previous = JSON.stringify(cachedConfig)
    const next = await loadRemoteConfig()
    if (JSON.stringify(next) !== previous) {
      console.info('[config] Config changed, notifying...')
      onChange(next)
    }
  }, intervalMs)
}

export function stopWatchingRemoteConfig() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}
