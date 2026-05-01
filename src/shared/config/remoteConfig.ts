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
  try {
    const CONFIG_FILE=`/opt/frontend/config-${import.meta.env.VITE_APP_PROFILE}.json`
    const res = await fetch(CONFIG_FILE, { cache: 'no-store' })
    if (!res.ok) throw new Error('config.json not found')
    cachedConfig = await res.json()
    console.info('[config] Loaded remote config:', cachedConfig)
  } catch {
    console.warn('[config] Remote config unavailable, falling back to import.meta.env')
    cachedConfig = {
      VITE_APP_PROFILE: import.meta.env.VITE_APP_PROFILE ?? 'dev',
      VITE_STAGING_TAILSCALE_IP: import.meta.env.VITE_STAGING_TAILSCALE_IP ?? '',
      VITE_STAGING_LOCAL_IP: import.meta.env.VITE_STAGING_LOCAL_IP ?? '',
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
export function watchRemoteConfig(
  onChange: (config: RemoteConfig) => void,
  intervalMs = 30_000
) {
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