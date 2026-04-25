let socket = null

export function connectWebSocket(baseUrl = 'ws://localhost:8080/api/v1/ws') {
  // Clean up any existing connection first
  if (socket) {
    try { socket.close(1000, 'reconnecting') } catch (_) {}
    socket = null
  }

  const token = localStorage.getItem('token')
  const url = token ? `${baseUrl}?token=${token}` : baseUrl
  socket = new WebSocket(url)

  socket.addEventListener('open', () => {
    console.log('[WS] Connected')
  })

  socket.addEventListener('close', (event) => {
    console.log(`[WS] Disconnected (code: ${event.code}, reason: ${event.reason || 'none'})`)
  })

  socket.addEventListener('error', (err) => {
    console.error('[WS] Error:', err)
  })

  socket.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data)
      // Only log if it's actual game state from Godot (contains x or anim)
      if (data.x !== undefined || data.anim !== undefined) {
        console.log('[GODOT STATE RECEIVED]', data)
      }
    } catch (e) {
      // Ignore non-JSON or other messages
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
