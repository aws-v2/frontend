import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadRemoteConfig } from '../remoteConfig'
import { featureFlags } from '../featureFlags'

// Mock fetch globally
globalThis.fetch = vi.fn() as any

describe('featureFlags service routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    featureFlags.resetStagingCache()
  })

  it('routes to staging Tailscale IP when service flag is staging', async () => {
    vi.stubEnv('VITE_APP_PROFILE', 'dev')
    vi.stubEnv('VITE_STAGING_TAILSCALE_IP', '10.86.142.136')
    vi.stubEnv('VITE_FF_SERVICE_EC2', 'staging')

    vi.mocked(fetch).mockImplementation((url) => {
      if (url.toString().endsWith('config.json')) {
        return Promise.resolve({ ok: false } as Response)
      }
      if (url.toString().includes('10.86.142.136')) {
        return Promise.resolve({ ok: true } as Response)
      }
      return Promise.resolve({ ok: false } as Response)
    })

    await loadRemoteConfig()

    const url = await featureFlags.getServiceUrl('ec2')
    expect(url).toBe('http://localhost:8080/api/v1/')
  })

  it('routes to local dev when service flag is dev', async () => {
    vi.stubEnv('VITE_APP_PROFILE', 'dev')
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080/api/v1')
    vi.stubEnv('VITE_FF_SERVICE_EC2', 'dev')

    vi.mocked(fetch).mockImplementation(() => Promise.resolve({ ok: false } as Response))

    await loadRemoteConfig()

    const url = await featureFlags.getServiceUrl('ec2')
    expect(url).toBe('http://localhost:8080/api/v1/')
  })
})
