<template>
  <div class="logs-page">
    <div class="logs-controls">
      <div class="control-left">
        <button class="btn-control">
          <span class="icon">🕒</span> All time <span class="chevron">⌄</span>
        </button>
        <div class="search-box">
          <span class="icon">🔍</span>
          <input type="text" placeholder="Search log lines" />
        </div>
      </div>
      <div class="control-right">
        <button class="btn-control highlight">
          Capture log lines
        </button>
        <div class="view-toggles">
          <button class="btn-icon active">📜</button>
          <button class="btn-icon">📁</button>
        </div>
      </div>
    </div>

    <!-- Terminal Surface -->
    <div class="terminal-container" ref="terminalRef">
      <div class="terminal-header">
        <div class="status-indicator">
          <span class="dot green pulse"></span> Connected. Streaming logs...
        </div>
        <div class="actions">
          <button class="btn-text">Clear</button>
          <button class="btn-text">Download</button>
        </div>
      </div>

      <div class="terminal-body">
        <div v-for="(log, index) in logs" :key="index" :class="['log-line', log.type]">
          <span class="timestamp">{{ log.time }}</span>
          <span class="content">{{ log.message }}</span>
        </div>
        <div class="terminal-cursor"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface LogEntry {
  time: string
  message: string
  type: 'info' | 'error' | 'success' | 'warning'
}

const logs = ref<LogEntry[]>([
  { time: 'Jan 21 08:45:01 PM', message: '==> Starting service...', type: 'info' },
  { time: 'Jan 21 08:45:03 PM', message: '==> Detected Go runtime', type: 'info' },
  { time: 'Jan 21 08:45:05 PM', message: '==> Running: /usr/local/bin/start_app', type: 'info' },
  { time: 'Jan 21 08:45:07 PM', message: 'Listening on port 8080', type: 'success' },
  { time: 'Jan 21 08:46:12 PM', message: 'GET / 200 in 12ms', type: 'info' },
  { time: 'Jan 21 08:47:01 PM', message: 'GET /healthz 200 in 2ms', type: 'info' },
  { time: 'Jan 21 08:49:55 PM', message: 'ERROR: connection reset by peer', type: 'error' },
  { time: 'Jan 21 08:49:56 PM', message: 'Retrying connection (1/3)...', type: 'warning' },
])

const terminalRef = ref<HTMLElement | null>(null)
let interval: any

const addMockLog = () => {
  const routes = ['/', '/api/v1/users', '/api/v2/products', '/settings', '/auth/login']
  const route = routes[Math.floor(Math.random() * routes.length)]
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const ms = Math.floor(Math.random() * 50) + 1
  
  logs.value.push({
    time: `Jan 21 ${time}`,
    message: `GET ${route} 200 in ${ms}ms`,
    type: 'info'
  })

  if (logs.value.length > 200) logs.value.shift()
  
  // Auto-scroll logic
  setTimeout(() => {
    if (terminalRef.value) {
      const body = terminalRef.value.querySelector('.terminal-body')
      if (body) body.scrollTop = body.scrollHeight
    }
  }, 0)
}

onMounted(() => {
  interval = setInterval(addMockLog, 3000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<style scoped>
.logs-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px); /* Adjust based on parent layout */
}

.logs-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.control-left, .control-right { display: flex; gap: 8px; }

.search-box {
  background-color: #0c0c0c;
  border: 1px solid #333;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  width: 320px;
}

.search-box .icon { color: #666; width: 14px; font-size: 12px; }
.search-box input {
  background: none;
  border: none;
  color: #fff;
  padding: 8px;
  font-size: 13px;
  flex: 1;
  outline: none;
}

.btn-control {
  background-color: #0c0c0c;
  border: 1px solid #333;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-control.highlight {
  background-color: #7b3fe4;
  border: none;
  font-weight: 600;
}

.view-toggles { background-color: #111; padding: 2px; border-radius: 4px; display: flex; }
.btn-icon { background: none; border: none; padding: 4px 8px; font-size: 14px; cursor: pointer; border-radius: 2px; color: #666; }
.btn-icon.active { background-color: #1a1033; color: #7b3fe4; }

/* Terminal */
.terminal-container {
  flex: 1;
  background-color: #050505;
  border: 1px solid #1a1a1a;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

.terminal-header {
  padding: 10px 16px;
  background-color: #0c0c0c;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-indicator { display: flex; align-items: center; gap: 10px; font-size: 11px; color: #666; font-weight: 500; }
.dot { width: 6px; height: 6px; border-radius: 50%; }
.dot.green { background-color: #00c853; }
.dot.pulse { animation: pulse 2s infinite; }

@keyframes pulse {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}

.btn-text { background: none; border: none; color: #666; font-size: 11px; font-weight: 600; cursor: pointer; margin-left: 16px; }
.btn-text:hover { color: #fff; }

.terminal-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.6;
}

/* Custom scrollbar */
.terminal-body::-webkit-scrollbar { width: 8px; }
.terminal-body::-webkit-scrollbar-track { background: transparent; }
.terminal-body::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 4px; }
.terminal-body::-webkit-scrollbar-thumb:hover { background: #222; }

.log-line { display: flex; gap: 20px; margin-bottom: 2px; }
.timestamp { color: #444; min-width: 140px; }
.content { color: #ccc; white-space: pre-wrap; word-break: break-all; }

.log-line.info .content { color: #aaa; }
.log-line.error .content { color: #f44336; }
.log-line.success .content { color: #4caf50; }
.log-line.warning .content { color: #ff9800; }

.terminal-cursor {
  width: 8px;
  height: 16px;
  background-color: #7b3fe4;
  display: inline-block;
  vertical-align: middle;
  margin-top: 4px;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>
