import { ref, onUnmounted } from 'vue'
import { featureFlags } from '@/shared/config/featureFlags'

export type VMEventType =
  | 'INSTANCE_STARTED'
  | 'INSTANCE_STOPPED'
  | 'HEALTH_UPDATE'
  | 'PROVISIONING_PROGRESS'
  | 'INSTANCE_ERROR'
  | 'INSTANCE_PROVISIONED'

export interface VMEvent {
  event_type: VMEventType
  session_id: string
  instance_id: string
  payload: Record<string, unknown>
}

/**
 * Composable for subscribing to VM lifecycle events via SSE.
 * Moved to SageMaker module.
 */
export function useVMEvents(sessionId: string) {
  console.log(`[useVMEvents] Initialized with sessionId: ${sessionId}`)
  
  const status      = ref<VMEventType | 'connecting' | 'disconnected'>('connecting')
  const instanceId  = ref<string>('')
  const isProvisioned = ref(false)
  const isError     = ref(false)
  const errorPayload = ref<unknown>(null)
  const isConnected = ref(false)

  let abortController: AbortController | null = null
  let closed = false

  async function connect() {
    if (closed) {
      console.log('[useVMEvents] Connection aborted: closed=true')
      return
    }

    try {
      let baseUrl = (await featureFlags.getServiceUrl('llm'))
      const token = localStorage.getItem('auth_token') ?? ''
      
      // Force relative path in dev to leverage Vite proxy and avoid CORS
      if (baseUrl.includes('localhost:8080')) {
        baseUrl = baseUrl.replace('http://localhost:8080', '')
      }
      baseUrl = baseUrl.replace(/\/$/, '')
      
      const url = `${baseUrl}/llm/vm/events/${sessionId}?token=${encodeURIComponent(token)}`
      
      console.log('[useVMEvents] Connecting to URL:', url)

      abortController = new AbortController()

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: abortController.signal,
      })

      console.log('[useVMEvents] Fetch response received. Status:', response.status, response.statusText)

      if (!response.ok || !response.body) {
        console.error('[useVMEvents] Response not OK or body missing')
        isError.value = true
        status.value = 'disconnected'
        errorPayload.value = { message: `Connection failed: HTTP ${response.status}` }
        return
      }

      console.log('[useVMEvents] Stream connection established.')
      isConnected.value = true

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      // SSE frame parser
      while (!closed) {
        console.log('[useVMEvents] Waiting for stream chunk...')
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('[useVMEvents] Stream reader done.')
          break
        }

        buffer += decoder.decode(value, { stream: true })
        console.log('[useVMEvents] Received chunk. Current buffer size:', buffer.length)
        
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? '' // keep incomplete last line

        let eventType: string | null = null
        let dataLine: string | null = null

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) {
            // Empty line = end of SSE frame — dispatch
            if (dataLine !== null) {
              console.log('[useVMEvents] Dispatching SSE frame. event:', eventType, 'data:', dataLine)
              if (eventType === 'connected') {
                 console.log('[useVMEvents] Initial "connected" event skipped.')
              } else {
                try {
                  const event: VMEvent = JSON.parse(dataLine)
                  handleEvent(event)
                } catch (e) {
                  console.error('[useVMEvents] JSON Parse Error:', e, 'Raw data:', dataLine)
                }
              }
              if (isProvisioned.value || isError.value) {
                console.log('[useVMEvents] Terminal state reached, canceling reader.')
                reader.cancel()
                break
              }
            }
            eventType = null
            dataLine = null
          } else if (trimmed.startsWith('event:')) {
            eventType = trimmed.slice(6).trim()
          } else if (trimmed.startsWith('data:')) {
            dataLine = trimmed.slice(5).trim()
          }
        }

        if (isProvisioned.value || isError.value) break
      }
    } catch (err: unknown) {
      if (!closed) {
        const errMsg = err instanceof Error ? err.stack || err.message : String(err)
        console.error('[useVMEvents] Catch block error:', errMsg)
        if (errMsg.includes('aborted') || errMsg.includes('AbortError')) return
        isError.value = true
        status.value = 'disconnected'
        errorPayload.value = { message: errMsg }
      }
    } finally {
      console.log('[useVMEvents] Finally block: cleaning up.')
      isConnected.value = false
      if (!closed) status.value = 'disconnected'
    }
  }

  function handleEvent(event: VMEvent) {
    console.log('[useVMEvents] Processing event:', event.event_type, event)
    status.value = event.event_type
    if (event.instance_id) instanceId.value = event.instance_id

    if (event.event_type === 'INSTANCE_PROVISIONED') {
      console.log('[useVMEvents] Success state reached.')
      isProvisioned.value = true
      disconnect()
    } else if (event.event_type === 'INSTANCE_ERROR') {
      console.log('[useVMEvents] Error state reached.')
      isError.value = true
      errorPayload.value = event.payload
      disconnect()
    }
  }

  function disconnect() {
    if (closed) return
    console.log('[useVMEvents] Disconnecting...')
    closed = true
    abortController?.abort()
    isConnected.value = false
  }

  onUnmounted(() => {
    console.log('[useVMEvents] Component unmounted - disconnecting.')
    disconnect()
  })

  // Kick off
  connect()

  return {
    status,
    instanceId,
    isProvisioned,
    isError,
    errorPayload,
    isConnected,
    disconnect,
  }
}
