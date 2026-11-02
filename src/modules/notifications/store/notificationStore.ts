import { reactive } from 'vue'
import { useAuthStore } from '@/modules/auth/store/authStore'

export type NotificationStatus = 'running' | 'completed' | 'failed' | 'info'

export interface AppNotification {
  id: string
  kind: string
  title: string
  message?: string
  status: NotificationStatus
  progress?: number
  createdAt: string
  updatedAt: string
  read: boolean
}

const STREAM_PATH = '/api/v1/ec2/instances/notifications/stream'
const MAX_ITEMS = 200

const state = reactive({
  items: [] as AppNotification[],
  connected: false,
})

let eventSource: EventSource | null = null
let retry = 0
let retryTimer: ReturnType<typeof setTimeout> | null = null

function upsert(incoming: Partial<AppNotification> & { id: string }) {
  const now = new Date().toISOString()
  const previous = state.items.find((notification) => notification.id === incoming.id)

  if (!previous) {
    state.items.unshift({
      kind: 'info',
      title: 'Notification',
      status: 'info',
      createdAt: now,
      updatedAt: now,
      read: false,
      ...incoming,
    })
  } else {
    const statusChanged = !!incoming.status && incoming.status !== previous.status
    const index = state.items.indexOf(previous)
    state.items[index] = {
      ...previous,
      ...incoming,
      id: incoming.id,
      kind: incoming.kind ?? previous.kind,
      title: incoming.title ?? previous.title,
      status: incoming.status ?? previous.status,
      createdAt: incoming.createdAt ?? previous.createdAt,
      updatedAt: now,
      read: statusChanged ? false : previous.read,
    }
  }

  if (state.items.length > MAX_ITEMS) state.items.length = MAX_ITEMS
}

function connect() {
  if (eventSource) return

  const auth = useAuthStore()
  const url = new URL(STREAM_PATH, import.meta.env.VITE_API_URL || window.location.origin)
  if (auth.token) url.searchParams.set('token', auth.token)

  eventSource = new EventSource(url.toString())

  eventSource.onopen = () => {
    state.connected = true
    retry = 0
  }

  eventSource.addEventListener('notification', (event: MessageEvent) => {
    try {
      upsert(JSON.parse(event.data))
    } catch (error) {
      console.warn('[notifications] bad event payload', error)
    }
  })

  eventSource.onerror = () => {
    state.connected = false
    eventSource?.close()
    eventSource = null
    const delay = Math.min(1000 * 2 ** retry++, 30000)
    retryTimer = setTimeout(connect, delay)
  }
}

function disconnect() {
  if (retryTimer) clearTimeout(retryTimer)
  retryTimer = null
  eventSource?.close()
  eventSource = null
  state.connected = false
}

function markRead(id: string) {
  const notification = state.items.find((item) => item.id === id)
  if (notification) notification.read = true
}

function markAllRead() {
  state.items.forEach((notification) => {
    notification.read = true
  })
}

function remove(id: string) {
  state.items = state.items.filter((notification) => notification.id !== id)
}

function clearFinished() {
  state.items = state.items.filter((notification) => notification.status === 'running')
}

const notificationStore = {
  get items() {
    return state.items
  },
  get connected() {
    return state.connected
  },
  get unreadCount() {
    return state.items.filter((notification) => !notification.read).length
  },
  get activeCount() {
    return state.items.filter((notification) => notification.status === 'running').length
  },
  connect,
  disconnect,
  upsert,
  markRead,
  markAllRead,
  remove,
  clearFinished,
}

export function useNotificationStore() {
  return notificationStore
}
