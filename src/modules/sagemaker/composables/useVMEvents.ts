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

  let sse: EventSource | null = null
  let closed = false

  async function connect() {
    if (closed) {
      console.log('[useVMEvents] Connection aborted: closed=true')
      return
    }

    try {
      const baseUrl = (await featureFlags.getServiceUrl('llm')).replace(/\/$/, '')
      const token = localStorage.getItem('auth_token') ?? ''
      
      const url = `${baseUrl}/llm/vm/events/${sessionId}?token=${encodeURIComponent(token)}`
      
      console.log('[useVMEvents] Connecting to URL:', url)

      sse = new EventSource(url)


 




      sse.onopen = () => {
        console.log('[useVMEvents] Stream connection established.')
        isConnected.value = true
      }

      sse.onerror = (err) => {
        console.error('[useVMEvents] EventSource error:', err)
        if (!closed) {
          isError.value = true
          status.value = 'disconnected'
          errorPayload.value = { message: 'SSE Connection failed or closed unexpectedly' }
          disconnect()
        }
      }

      sse.addEventListener('connected', (event: MessageEvent) => {
         console.log('[useVMEvents] Initial "connected" event received.', event.data)
      })

      sse.addEventListener('closed', (event: MessageEvent) => {
         console.log('[useVMEvents] "closed" event received.', event.data)
         disconnect()
      })

      sse.onmessage = (event: MessageEvent) => {
        console.log('[useVMEvents] SSE frame received:', event.data)
        try {
          const data: VMEvent = JSON.parse(event.data)
          handleEvent(data)
        } catch (e) {
          console.error('[useVMEvents] JSON Parse Error:', e, 'Raw data:', event.data)
        }
      }

    } catch (err: unknown) {
      if (!closed) {
        const errMsg = err instanceof Error ? err.stack || err.message : String(err)
        console.error('[useVMEvents] Catch block error:', errMsg)
        isError.value = true
        status.value = 'disconnected'
        errorPayload.value = { message: errMsg }
      }
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
    if (sse) {
      sse.close()
      sse = null
    }
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
