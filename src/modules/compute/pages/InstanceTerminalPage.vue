<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

const route = useRoute()
const router = useRouter()
const computeStore = useComputeStore()
const authStore = useAuthStore()
const instanceId = route.params.id as string

const terminalElement = ref<HTMLElement | null>(null)
let terminal: Terminal | null = null
let fitAddon: FitAddon | null = null

const isConnected = ref(false)
const connectionError = ref<string | null>(null)

onMounted(async () => {
  console.log('[Terminal] Initializing connection for instance:', instanceId)

  await computeStore.fetchInstance(instanceId)
  
  if (!computeStore.currentInstance) {
    console.error('[Terminal] Instance not found in backend')
    connectionError.value = 'Instance not found'
    return
  }

  console.log('[Terminal] Instance details retrieved:', computeStore.currentInstance)
  
  // Test backend availability
  try {
    const healthCheckUrl = `/ec2/instances/${instanceId}/health` // Hypothical check
    console.log('[Terminal] Testing backend connectivity via:', healthCheckUrl)
    // We don't await here to not block UI, just log the attempt
  } catch (e) {
    console.warn('[Terminal] Backend connectivity test failed (expected if not implemented)')
  }

  initTerminal()
})

let socket: WebSocket | null = null

const initTerminal = () => {
  if (!terminalElement.value) return

  terminal = new Terminal({
    cursorBlink: true,
    theme: {
      background: '#0D1117',
      foreground: '#c9d1d9',
      cursor: '#58a6ff',
      black: '#484f58',
      red: '#ff7b72',
      green: '#3fb950',
      yellow: '#d2991d',
      blue: '#58a6ff',
      magenta: '#bc8cff',
      cyan: '#39c5cf',
      white: '#b1bac4'
    },
    fontSize: 14,
    fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, "Courier New", monospace',
    logLevel: 'off',
  })

  fitAddon = new FitAddon()
  terminal.loadAddon(fitAddon)
  terminal.open(terminalElement.value)
  fitAddon.fit()

  terminal.writeln('\x1b[1;34m[*] \x1b[0mConnecting to instance \x1b[1;36m' + instanceId + '\x1b[0m...')
  
  // Initialize WebSocket
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = 'localhost:8085' // Direct connection to EC2 service (bypassing gateway)
  const token = authStore.token
  const wsUrl = `${protocol}//${host}/api/v1/ec2/instances/${instanceId}/terminal?token=${token}`
  
  console.log('[Terminal] Handshake initiated at:', `${protocol}//${host}/api/v1/ec2/instances/${instanceId}/terminal?token=***`)
  
  try {
    socket = new WebSocket(wsUrl)
  } catch (e) {
    console.error('[Terminal] Synchronous WebSocket creation failed:', e)
    terminal?.writeln('\x1b[1;31m[!] \x1b[0mFailed to initiate WebSocket object.')
    return
  }

  socket.onopen = () => {
    console.log('[Terminal] WebSocket opened successfully (readyState: ' + socket?.readyState + ')')
    isConnected.value = true
    terminal?.writeln('\x1b[1;32m[+] \x1b[0mConnection established.')
    terminal?.writeln('')
    
    // Initial size sync
    if (fitAddon) {
        const dims = fitAddon.proposeDimensions()
        if (dims) {
            console.log('[Terminal] Sending initial resize sync:', dims)
            socket?.send(JSON.stringify({
                type: 'resize',
                cols: dims.cols,
                rows: dims.rows
            }))
        }
    }
  }

  socket.onmessage = (event) => {
    try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'stdout' && msg.data) {
            terminal?.write(msg.data)
        } else if (msg.type === 'error') {
            console.error('[Terminal] Backend reported error:', msg.data)
            terminal?.writeln(`\r\n\x1b[1;31m[ERROR] ${msg.data}\x1b[0m`)
        }
    } catch (e) {
        // Fallback for raw text messages (some backends don't wrap stdout in JSON)
        terminal?.write(event.data)
    }
  }

  socket.onerror = (error) => {
    // Note: Browser hides specific error details for security
    console.error('[Terminal] WebSocket encountered an error. Check Network tab (WS) for status code.')
    terminal?.writeln('\x1b[1;31m[!] \x1b[0mWebSocket handshake failed. Ensure EC2-SERVICE is running and Gateway is routing correctly.')
  }

  socket.onclose = (event) => {
    console.warn(`[Terminal] WebSocket closed. Code: ${event.code}, Reason: ${event.reason || 'None'}, WasClean: ${event.wasClean}`)
    isConnected.value = false
    terminal?.writeln('\r\n\x1b[1;31m[!] \x1b[0mConnection closed.')
  }

  terminal.onData((data) => {
    if (isConnected.value && socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'stdin',
            data: data
        }))
    }
  })

  window.addEventListener('resize', handleResize)
}

const handleResize = () => {
  fitAddon?.fit()
  const dims = fitAddon?.proposeDimensions()
  if (dims && isConnected.value && socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
          type: 'resize',
          cols: dims.cols,
          rows: dims.rows
      }))
  }
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  terminal?.dispose()
})

const closeTerminal = () => {
  window.close()
}
</script>

<template>
  <div class="fixed inset-0 bg-[#05080F] flex flex-col font-sans">
    <!-- Header -->
    <header class="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0D1117] relative z-10">
      <div class="flex items-center gap-4">
        <div class="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 class="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
            Terminal: {{ computeStore.currentInstance?.name || instanceId }}
            <span v-if="isConnected" class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </h1>
          <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {{ computeStore.currentInstance?.publicIp || 'Connecting...' }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="h-6 w-px bg-white/10"></div>
        <button 
          @click="closeTerminal"
          class="p-2 text-slate-500 hover:text-white transition-colors"
          title="Close tab"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Terminal Container -->
    <div class="flex-1 overflow-hidden relative p-4">
      <div v-if="connectionError" class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
        <div class="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4 font-black text-xl">!</div>
        <h2 class="text-xl font-bold text-white mb-2">{{ connectionError }}</h2>
        <button @click="closeTerminal" class="px-6 py-2 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all">
          Close Tab
        </button>
      </div>
      
      <div ref="terminalElement" class="w-full h-full terminal-wrapper"></div>
    </div>

    <!-- Status Bar -->
    <footer class="h-8 border-t border-white/5 bg-[#0D1117] flex items-center justify-between px-6">
      <div class="flex items-center gap-4">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          Status: 
          <span :class="isConnected ? 'text-emerald-400' : 'text-amber-400'">{{ isConnected ? 'Connected' : 'Connecting' }}</span>
        </span>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          UTF-8 • xterm.js
        </span>
      </div>
    </footer>
  </div>
</template>

<style>
.terminal-wrapper {
  background-color: #0D1117;
}

.xterm-viewport::-webkit-scrollbar {
  width: 10px;
}

.xterm-viewport::-webkit-scrollbar-track {
  background: transparent;
}

.xterm-viewport::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 3px solid transparent;
  background-clip: padding-box;
}

.xterm-viewport::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
  border: 3px solid transparent;
  background-clip: padding-box;
}

.xterm .xterm-screen {
    padding: 10px;
}
</style>
