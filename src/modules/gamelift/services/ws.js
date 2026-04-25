let socket = null

export function connectWebSocket(baseUrl = 'ws://localhost:8080/api/v1/ws') {
  // Clean up existing connection
  if (socket) {
    try {
      socket.close(1000, 'reconnecting')
    } catch (_) {}
    socket = null
  }

  const token = localStorage.getItem('auth_token')

  if (!token) {
    console.warn('[WS] No token found in localStorage')
  }

  // Encode token to avoid URL issues
  const url = token
    ? `${baseUrl}?token=${encodeURIComponent(token)}`
    : baseUrl

  console.log('[WS] Connecting to:', url)

  socket = new WebSocket(url)

  socket.addEventListener('open', () => {
    console.log('[WS] Connected')
  })

  socket.addEventListener('close', (event) => {
    console.log(
      `[WS] Disconnected (code: ${event.code}, reason: ${event.reason || 'none'})`
    )

    // 🔴 1006 = abnormal close (often auth failure / 401 during handshake)
    if (event.code === 1006) {
      console.warn('[WS] Possible auth failure (check token or backend validation)')
    }
  })

  socket.addEventListener('error', (err) => {
    console.error('[WS] Error:', err)
  })

  socket.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data)

      if (data.x !== undefined || data.anim !== undefined) {
        console.log('[GODOT STATE RECEIVED]', data)
      } else {
        console.log('[WS] Message:', data)
      }
    } catch (e) {
      console.log('[WS] Raw message:', event.data)
    }
  })

  return socket
}

export function sendMessage(data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data))
  }
}

export function disconnectWebSocket() {
  if (socket) {
    // Send a proper close frame with code 1000 (normal closure)
    try {
      socket.close(1000, 'user left')
    } catch (_) {}
    socket = null
  }
}
