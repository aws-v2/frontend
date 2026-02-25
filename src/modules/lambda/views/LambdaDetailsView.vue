<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLambdaStore } from '../store/lambdaStore'
import { useAuthStore } from '@/modules/auth/store/authStore'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'
import apiClient from '@/shared/api/apiClient'

const route = useRoute()
const router = useRouter()
const lambdaStore = useLambdaStore()
const functionId = route.params.id as string

const activeTab = ref('code')
const configForm = ref({
  memory: 128,
  timeout: 3,
  description: ''
})

const testPayload = ref('{\n  "KEY1": "VALUE1"\n}')
const executionOutput = ref('')
const isExecuting = ref(false)
const syncStatus = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const tabs = [
  { id: 'code', label: 'Code_Test', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { id: 'monitor', label: 'Telemetry', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'config', label: 'Parameters', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
]

const currentFunction = computed(() => lambdaStore.currentFunction)

onMounted(async () => {
  await lambdaStore.fetchFunctionById(functionId)
  if (currentFunction.value) {
    configForm.value = {
      memory: currentFunction.value.memory || 128,
      timeout: currentFunction.value.timeout || 3,
      description: currentFunction.value.description || ''
    }
    await lambdaStore.fetchMetrics(functionId)
  }
})

let refreshInterval: number | null = null

const startPolling = () => {
  if (refreshInterval) return
  refreshInterval = setInterval(() => {
    if (currentFunction.value?.name) {
      lambdaStore.fetchMetrics(currentFunction.value.name)
    }
  }, 30000) as unknown as number
}

const stopPolling = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

watch(activeTab, (newTab) => {
  if (newTab === 'monitor' && currentFunction.value?.name) {
    lambdaStore.fetchMetrics(currentFunction.value.name)
    startPolling()
  } else {
    stopPolling()
  }
})

const runTestBench = async () => {
  if (isExecuting.value) return

  isExecuting.value = true
  executionOutput.value = ''

  try {
    // Validate JSON
    JSON.parse(testPayload.value)

    const authStore = useAuthStore()
    const baseUrl = (apiClient.defaults.baseURL || '').replace(/\/$/, '')

    const response = await fetch(`${baseUrl}/lambda/functions/${currentFunction.value?.name}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: testPayload.value
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) throw new Error('ReadableStream not supported')

    let partialData = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      partialData += chunk

      // Process SSE lines
      const lines = partialData.split('\n')
      // Keep last incomplete line
      partialData = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith('data:')) {
          const rawData = trimmedLine.slice(5).trim()
          if (!rawData) continue

          try {
            const data = JSON.parse(rawData)

            // Handle structured logs
            if (data.message) {
              executionOutput.value += `[SYSTEM] ${data.message}\n`
            }
            if (data.stdout) {
              executionOutput.value += data.stdout
            }
            if (data.stderr) {
              executionOutput.value += `[ERROR] ${data.stderr}\n`
            }
            if (data.status === 'success' && data.execution_result) {
              executionOutput.value += `\n[DONE] ${data.execution_result} (Exit: ${data.exit_code || 0})\n`
            }

            // Auto-scroll logic if terminal is available
            nextTick(() => {
              const terminal = document.querySelector('.terminal-container')
              if (terminal) terminal.scrollTop = terminal.scrollHeight
            })
          } catch (e) {
            // Fallback for non-JSON or partial data
            if (rawData) executionOutput.value += rawData + '\n'
          }
        }
      }
    }
  } catch (e: any) {
    executionOutput.value += `\n[ERROR] ${e.message}\n`
    console.error('Test Bench Error:', e)
  } finally {
    isExecuting.value = false
  }
}

const saveConfig = async () => {
  if (!currentFunction.value?.name) return

  try {
    await lambdaStore.updateConfiguration(currentFunction.value.name, configForm.value)
    syncStatus.value = { message: 'PROTOCOL_SYNC_SUCCESSFUL', type: 'success' }
    setTimeout(() => { syncStatus.value = null }, 3000)
  } catch (e) {
    syncStatus.value = { message: 'SYNC_FAILED_VALIDATE_PARAMETERS', type: 'error' }
    setTimeout(() => { syncStatus.value = null }, 3000)
  }
}

const goBack = () => {
  router.push({ name: 'compute-landing' })
}
</script>

<template>
  <div
    class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-amber-500/20 selection:text-amber-900 overflow-x-hidden">

    <PublicNavbar activeLink="compute" />

    <div class="relative pt-24 pb-40">
      <!-- Structural Grid Background -->
      <div
        class="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-6">

        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-12">
          <button @click="goBack" class="text-[#879196] hover:text-amber-600 transition-colors">Compute</button>
          <span class="text-[#eaeded] font-light">/</span>
          <span class="text-[#879196]">Functions</span>
          <span class="text-[#eaeded] font-light">/</span>
          <span class="text-amber-600 italic">{{ currentFunction?.name || 'SYNCING...' }}</span>
        </nav>

        <!-- Page Header -->
        <div
          class="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16 px-8 py-10 border-4 border-[#232f3e] bg-white relative overflow-hidden group">
          <div class="absolute right-0 top-0 w-64 h-64 bg-amber-500/5 -rotate-45 translate-x-32 -translate-y-32"></div>

          <div class="flex items-start gap-8">
            <div
              class="w-20 h-20 border-4 border-[#232f3e] flex items-center justify-center text-[#232f3e] font-black italic text-4xl group-hover:bg-amber-500 group-hover:text-white transition-all">
              λ
            </div>
            <div>
              <div class="flex items-center gap-4 mb-4">
                <h1 class="text-5xl font-black text-[#232f3e] tracking-tighter uppercase leading-none">{{
                  currentFunction?.name }}</h1>
                <div
                  class="px-4 py-1 border-2 border-emerald-500 text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50">
                  {{ currentFunction?.status }}
                </div>
              </div>
              <p class="text-lg text-[#545b64] font-medium max-w-2xl leading-relaxed">{{ currentFunction?.description ||
                'No Protocol Manifest Found.' }}</p>
            </div>
          </div>

          <div class="flex gap-4">
            <button @click="activeTab = 'code'"
              class="px-10 py-5 border-2 border-[#232f3e] text-[#232f3e] font-black uppercase tracking-widest text-xs hover:bg-[#232f3e] hover:text-white transition-all">
              Debug_Terminal
            </button>
            <button @click="saveConfig"
              class="px-12 py-5 bg-amber-500 text-white font-black uppercase tracking-widest text-xs hover:bg-amber-600 transition-all active:translate-y-1">
              Deploy_Revision
            </button>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid lg:grid-cols-12 gap-10">

          <!-- Left: Tab Sidebar -->
          <div class="lg:col-span-3 space-y-6">
            <div class="border-2 border-[#232f3e] bg-white overflow-hidden">
              <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                class="w-full px-8 py-6 flex items-center justify-between group transition-all border-b-2 last:border-b-0 border-[#232f3e]"
                :class="activeTab === tab.id ? 'bg-[#232f3e] text-white' : 'hover:bg-amber-50 text-[#879196]'">
                <span class="text-[11px] font-black uppercase tracking-[0.2em]">{{ tab.label }}</span>
                <span v-if="activeTab === tab.id" class="text-amber-400">&rarr;</span>
              </button>
            </div>

            <!-- Runtime Info Card -->
            <div class="p-8 border-2 border-[#eaeded] bg-[#fafafa]">
              <h4 class="text-[10px] font-black text-[#879196] mb-6 tracking-widest uppercase italic">Node_Spec</h4>
              <div class="space-y-6">
                <div
                  v-for="info in [{ l: 'Runtime', v: currentFunction?.runtime }, { l: 'Memory', v: `${configForm.memory} MB` }, { l: 'Timeout', v: `${configForm.timeout}s` }]"
                  :key="info.l">
                  <span class="block text-[9px] font-black text-[#879196] uppercase tracking-widest mb-1">{{ info.l
                  }}</span>
                  <span class="text-sm font-black text-[#232f3e] uppercase">{{ info.v }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Tab Content -->
          <div class="lg:col-span-9">

            <!-- Code & Test Tab -->
            <div v-if="activeTab === 'code'" class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <!-- Code Block -->
              <div class="border-4 border-[#232f3e] bg-[#232f3e] overflow-hidden">
                <div class="flex items-center justify-between px-8 py-4 border-b-2 border-white/10">
                  <div class="flex items-center gap-4">
                    <div class="flex gap-1.5">
                      <div class="w-2 h-2 rounded-full bg-red-400"></div>
                      <div class="w-2 h-2 rounded-full bg-amber-400"></div>
                      <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
                    </div>
                    <span
                      class="text-[10px] font-black text-amber-500 uppercase tracking-widest border-l border-white/10 pl-4 italic">kernel.{{
                        currentFunction?.runtime.split(' ')[0].toLowerCase() }}</span>
                  </div>
                  <span class="text-[9px] text-[#879196] font-bold uppercase tracking-widest">Read-Only Artifact</span>
                </div>
                <div class="p-8 font-mono text-xs leading-relaxed overflow-x-auto text-slate-300 min-h-[400px]">
                  <pre><code>export const handler = async (event) => {
  // Processing logic for {{ currentFunction?.name }}
  console.log("Sector invocation triggered:", event);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Atomic execution confirmed for {{ currentFunction?.name }}",
      protocol: "forge-v1",
      timestamp: new Date().toISOString()
    })
  };
};</code></pre>
                </div>
                <div
                  class="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none">
                </div>
              </div>

              <!-- Interactive Test Bench -->
              <div class="grid lg:grid-cols-2 gap-10">
                <div class="space-y-6">
                  <h3 class="text-xl font-black text-[#232f3e] uppercase tracking-tighter">Test_Payload</h3>
                  <textarea v-model="testPayload"
                    class="w-full h-48 bg-white border-4 border-[#232f3e] p-6 font-mono text-xs focus:ring-0 focus:border-amber-500 transition-all uppercase"
                    placeholder='{"key": "value"}'></textarea>
                  <button @click="runTestBench" :disabled="isExecuting"
                    class="w-full py-5 bg-[#232f3e] text-white font-black uppercase tracking-widest text-xs hover:bg-amber-600 transition-all disabled:opacity-50 active:translate-y-1 active:bg-amber-700">
                    {{ isExecuting ? 'EXECUTING...' : 'RUN_TEST_BENCH' }}
                  </button>
                </div>

                <div class="space-y-6">
                  <h3 class="text-xl font-black text-[#232f3e] uppercase tracking-tighter">Execution_Output</h3>
                  <div
                    class="h-48 bg-[#16191f] border-4 border-[#232f3e] p-6 font-mono text-xs overflow-auto text-amber-500 selection:bg-amber-500/30 selection:text-amber-200 terminal-container">
                    <pre v-if="executionOutput" class="whitespace-pre-wrap">{{ executionOutput }}</pre>
                    <p v-else-if="!isExecuting" class="text-[#545b64] italic uppercase">Idle. Awaiting execution
                      trigger...</p>
                    <div v-if="isExecuting" class="flex items-center gap-2 mt-2">
                      <span class="inline-block w-1.5 h-4 bg-amber-500 animate-pulse"></span>
                    </div>
                  </div>
                  <div class="flex items-center gap-4 p-4 border-2 border-[#eaeded] bg-white transition-colors"
                    :class="{ 'border-amber-500/30 bg-amber-50/30': isExecuting }">
                    <div class="w-3 h-3 rounded-full"
                      :class="isExecuting ? 'bg-amber-500 animate-pulse' : (executionOutput ? 'bg-emerald-500' : 'bg-[#eaeded]')">
                    </div>
                    <span class="text-[10px] font-black text-[#879196] uppercase tracking-widest">Handshake
                      status</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Monitoring / Telemetry Tab -->
            <div v-if="activeTab === 'monitor'"
              class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div class="grid md:grid-cols-3 gap-0 border-4 border-[#232f3e] bg-white">
                <div v-for="stat in [
                  { l: 'Invocations', v: lambdaStore.metrics?.invocations || 0, c: 'text-blue-600' },
               { 
  l: 'Avg Duration', 
  v: `${Number(lambdaStore.metrics?.duration || 0).toFixed(2)}ms`, 
  c: 'text-amber-600' 
},
                  { l: 'Error Count', v: lambdaStore.metrics?.errors || 0, c: 'text-red-600' }
                ]" :key="stat.l"
                  class="p-8 border-r-4 last:border-r-0 border-[#232f3e] hover:bg-[#fafafa] transition-colors">
                  <span class="block text-[10px] font-black text-[#879196] uppercase tracking-widest mb-6 italic">{{
                    stat.l
                  }}</span>
                  <span class="text-5xl font-black tracking-tighter uppercase" :class="stat.c">{{ stat.v }}</span>
                </div>
              </div>

              <div class="p-10 border-4 border-[#232f3e] bg-white">
                <div class="flex justify-between items-end mb-12">
                  <div>
                    <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tight">Traffic_Flow</h3>
                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest">24h Execution History</p>
                  </div>
                  <span class="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">REAL-TIME
                    TELEMETRY</span>
                </div>
                <div class="h-64 flex items-end gap-2 px-4">
                  <div v-for="(point, idx) in lambdaStore.metrics?.timeline" :key="idx"
                    class="flex-1 bg-amber-500 hover:bg-[#232f3e] transition-all cursor-help relative group"
                    :style="{ height: `${Math.min(100, Math.max(5, (point.value / (Math.max(...(lambdaStore.metrics?.timeline.map(p => p.value) || [1]))) * 100)))}%` }">
                    <div
                      class="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#232f3e] text-white px-3 py-1 text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity z-20 uppercase whitespace-nowrap">
                      {{ point.value }} OPS @ {{ point.timestamp }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Config Tab -->
            <div v-if="activeTab === 'config'"
              class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div class="p-12 border-4 border-[#232f3e] bg-white space-y-12 relative">

                <!-- Toast Notification -->
                <transition name="fade">
                  <div v-if="syncStatus"
                    class="absolute top-6 right-12 px-6 py-3 border-4 font-black text-[10px] tracking-[0.2em] uppercase z-50 bg-white"
                    :class="syncStatus.type === 'success' ? 'border-emerald-500 text-emerald-600' : 'border-red-500 text-red-600'">
                    {{ syncStatus.message }}
                  </div>
                </transition>

                <div class="grid md:grid-cols-2 gap-12">
                  <div class="space-y-6">
                    <label class="block text-xs font-black uppercase tracking-widest text-[#232f3e]">Memory_Provision
                      (MB)</label>
                    <input v-model="configForm.memory" type="number"
                      class="w-full p-5 border-4 border-[#232f3e] bg-[#fafafa] focus:ring-0 focus:border-amber-500 transition-all font-black text-sm uppercase">
                    <p class="text-[10px] text-[#879196] font-bold uppercase leading-relaxed">Adjust allocation of
                      cluster resources
                      for this protocol node.</p>
                  </div>
                  <div class="space-y-6">
                    <label class="block text-xs font-black uppercase tracking-widest text-[#232f3e]">Timeout_Threshold
                      (Sec)</label>
                    <input v-model="configForm.timeout" type="number"
                      class="w-full p-5 border-4 border-[#232f3e] bg-[#fafafa] focus:ring-0 focus:border-amber-500 transition-all font-black text-sm uppercase">
                    <p class="text-[10px] text-[#879196] font-bold uppercase leading-relaxed">Define the maximum
                      execution window
                      before atomic termination.</p>
                  </div>
                </div>

                <div class="space-y-6">
                  <label
                    class="block text-xs font-black uppercase tracking-widest text-[#232f3e]">Protocol_Description</label>
                  <textarea v-model="configForm.description" rows="4"
                    class="w-full p-5 border-4 border-[#232f3e] bg-[#fafafa] focus:ring-0 focus:border-amber-500 transition-all font-black text-sm uppercase"></textarea>
                </div>

                <div class="flex justify-end pt-6 border-t-2 border-[#eaeded]">
                  <button @click="saveConfig" :disabled="lambdaStore.isLoading"
                    class="px-12 py-6 bg-emerald-500 text-white font-black uppercase tracking-widest text-sm hover:bg-[#232f3e] transition-all shadow-[8px_8px_0px_#eaeded] active:translate-y-1 active:shadow-none disabled:opacity-50">
                    {{ lambdaStore.isLoading ? 'SYNCING...' : 'SYNC_CONFIGURATION' }}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <footer class="py-20 bg-white border-t-2 border-[#232f3e]">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-[#232f3e] flex items-center justify-center text-white font-black italic">S</div>
          <span class="font-black text-xl text-[#232f3e] tracking-tighter uppercase">SerwinForge</span>
        </div>
        <div class="flex gap-10 text-[10px] font-black text-[#879196] uppercase tracking-[0.2em]">
          <a href="#" class="hover:text-amber-600 transition-colors">Safety_Core</a>
          <a href="#" class="hover:text-amber-600 transition-colors">Edge_Node_Status</a>
          <a href="#" class="hover:text-amber-600 transition-colors">Policy_Spec</a>
        </div>
        <div class="text-[10px] text-[#879196] font-black uppercase tracking-widest italic">© 2026 SERWIN SYSTEMS INC.
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
  font-family: 'Urbanist', sans-serif;
}

pre {
  margin: 0;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
