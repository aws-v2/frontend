<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'
import ConnectInstanceModal from '../components/ConnectInstanceModal.vue'

const route = useRoute()
const router = useRouter()
const computeStore = useComputeStore()
const instanceId = computed(() => route.params.id as string)

const activeTab = ref('details')
const isConnectModalOpen = ref(false)

const handleConnect = () => {
  isConnectModalOpen.value = true
}

const tabs = [
  { id: 'details', label: 'Details' },
  { id: 'security', label: 'Security' },
  { id: 'networking', label: 'Networking' },
  { id: 'storage', label: 'Storage' },
  { id: 'checks', label: 'Status checks' },
  { id: 'monitoring', label: 'Monitoring' },
  { id: 'tags', label: 'Tags' }
]

onMounted(async () => {
    await computeStore.fetchInstance(instanceId.value)
})

const goBack = () => {
    router.push('/compute/instances')
}

const handleAction = async (action: 'start' | 'stop' | 'restart' | 'delete') => {
    if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this instance?')) return
        await computeStore.deleteInstance(instanceId.value)
        router.push('/compute/instances')
    } else if (action === 'start') {
        await computeStore.startInstance(instanceId.value)
    } else if (action === 'stop') {
        await computeStore.stopInstance(instanceId.value)
    } else if (action === 'restart') {
        await computeStore.restartInstance(instanceId.value)
    }
}
</script>

<template>
  <div class="min-h-screen bg-[#05080F] text-slate-200 pb-32 font-sans relative overflow-hidden">
    <!-- Ambient background effects -->
    <div class="absolute inset-0 pointer-events-none opacity-20">
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
      <div class="absolute bottom-0 right-10 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]"></div>
    </div>

    <div v-if="computeStore.isLoading && !computeStore.currentInstance" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p class="text-xs font-black uppercase tracking-widest text-white">Loading Instance Details...</p>
        </div>
    </div>

    <div v-if="computeStore.currentInstance" class="relative z-10 p-8 px-8 md:px-16 space-y-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
        <a href="#" @click.prevent="router.push('/dashboard')" class="text-slate-500 hover:text-blue-400 transition-colors">AWS</a>
        <span class="text-slate-700">/</span>
        <a href="#" @click.prevent="router.push('/compute')" class="text-slate-500 hover:text-blue-400 transition-colors">EC2</a>
        <span class="text-slate-700">/</span>
        <a href="#" @click.prevent="goBack" class="text-slate-500 hover:text-blue-400 transition-colors">Instances</a>
        <span class="text-slate-700">/</span>
        <span class="text-slate-400">{{ instanceId }}</span>
      </nav>

      <!-- Header Section -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-white tracking-tight">{{ computeStore.currentInstance.name || instanceId }}</h1>
            <div class="flex items-center gap-4 mt-1">
              <span :class="[
                'flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full border',
                computeStore.currentInstance.state === 'Running' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                computeStore.currentInstance.state === 'Stopped' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                'bg-slate-500/10 text-slate-400 border-slate-500/20'
              ]">
                <span :class="['w-1.5 h-1.5 rounded-full', computeStore.currentInstance.state === 'Running' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500']"></span>
                {{ computeStore.currentInstance.state }}
              </span>
              <span class="text-xs text-slate-500 font-medium tracking-wide">
                {{ computeStore.currentInstance.type }} • {{ computeStore.currentInstance.publicIp || 'No public IP' }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex gap-4">
            <div class="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden p-1 shadow-lg">
                <button @click="handleAction('start')" v-if="computeStore.currentInstance.state !== 'Running'"
                    class="p-2.5 hover:bg-emerald-500/10 text-emerald-500 transition-all active:scale-95" title="Start">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                    </svg>
                </button>
                <button @click="handleAction('stop')" v-if="computeStore.currentInstance.state === 'Running'"
                    class="p-2.5 hover:bg-rose-500/10 text-rose-500 transition-all active:scale-95" title="Stop">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd" />
                    </svg>
                </button>
                <div class="w-px h-6 bg-white/10 mx-1"></div>
                <button @click="handleAction('restart')"
                    class="p-2.5 hover:bg-amber-500/10 text-amber-500 transition-all active:scale-95" title="Restart">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
                <div class="w-px h-6 bg-white/10 mx-1"></div>
                <button @click="handleAction('delete')"
                    class="p-2.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-all active:scale-95" title="Delete">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            <button @click="handleConnect" class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95 shadow-xl">
                Connect
            </button>
        </div>
      </div>

      <!-- Instance Summary Card (Top Section) -->
      <div class="glass-panel rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-700"></div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          <div>
            <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Public IPv4 Address</h4>
            <div class="flex items-center gap-2 group/text">
                <p class="text-sm font-bold text-white">{{ computeStore.currentInstance.publicIp || '-' }}</p>
                <button v-if="computeStore.currentInstance.publicIp" class="text-slate-600 hover:text-blue-400 transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>
          </div>
          <div>
            <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Instance State</h4>
            <p class="text-sm font-bold text-white">{{ computeStore.currentInstance.state }}</p>
          </div>
          <div>
            <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Instance Type</h4>
            <p class="text-sm font-bold text-white">{{ computeStore.currentInstance.type }}</p>
          </div>
          <div>
            <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Availability Zone</h4>
            <p class="text-sm font-bold text-white">{{ computeStore.currentInstance.az || 'us-east-1a' }}</p>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="border-b border-white/10">
        <div class="flex flex-wrap -mb-px">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative"
            :class="activeTab === tab.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'"
          >
            {{ tab.label }}
            <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
          </button>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div class="glass-panel rounded-3xl border border-white/10 p-8 shadow-2xl min-h-[400px]">
        <!-- Details Tab -->
        <div v-if="activeTab === 'details'" class="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
            <div class="space-y-6">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <span class="w-1 h-4 bg-blue-500 rounded-full"></span>
                Instance Summary
              </h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center py-2 border-b border-white/5">
                  <span class="text-xs text-slate-500">Instance ID</span>
                  <span class="text-xs font-bold text-white font-mono">{{ computeStore.currentInstance.id }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-white/5">
                  <span class="text-xs text-slate-500">RAM</span>
                  <span class="text-xs font-bold text-white">{{ computeStore.currentInstance.ram || 2048 }} MB</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-white/5">
                  <span class="text-xs text-slate-500">vCPUs</span>
                  <span class="text-xs font-bold text-white">{{ computeStore.currentInstance.cpu || 2 }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <span class="w-1 h-4 bg-blue-500 rounded-full"></span>
                Image Information
              </h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center py-2 border-b border-white/5">
                  <span class="text-xs text-slate-500">Image ID / Code</span>
                  <span class="text-xs font-bold text-blue-400">{{ computeStore.currentInstance.image || 'ubuntu-24.04' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-white/5">
                  <span class="text-xs text-slate-500">SSH Key</span>
                  <span class="text-xs font-bold text-white truncate max-w-[150px]">{{ computeStore.currentInstance.ssh_key || '...' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Tab -->
         <div v-else-if="activeTab === 'security'" class="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-white">Security Groups</h3>
                <button class="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">Edit inbound rules</button>
            </div>
            <div class="overflow-x-auto rounded-xl border border-white/10">
                <table class="w-full text-left">
                    <thead class="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <tr>
                            <th class="p-4">Group name</th>
                            <th class="p-4">Group ID</th>
                            <th class="p-4">Protocol</th>
                            <th class="p-4">Port range</th>
                            <th class="p-4">Source</th>
                        </tr>
                    </thead>
                    <tbody class="text-xs divide-y divide-white/5">
                        <tr class="hover:bg-white/[0.02]">
                            <td class="p-4 text-blue-400">launch-wizard-1</td>
                            <td class="p-4 font-mono">sg-0a1b2c3d4e</td>
                            <td class="p-4 text-slate-400">TCP</td>
                            <td class="p-4 text-white">22</td>
                            <td class="p-4 text-slate-400 font-mono">0.0.0.0/0</td>
                        </tr>
                    </tbody>
                </table>
            </div>
         </div>

        <!-- Placeholder for other tabs -->
        <div v-else class="flex flex-col items-center justify-center h-full opacity-30 py-20 animate-in fade-in duration-700">
            <svg class="w-16 h-16 text-slate-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                {{ activeTab }} content coming soon
            </p>
        </div>
      </div>
    </div>
    
    <div v-else-if="!computeStore.isLoading" class="relative z-10 p-8 px-8 md:px-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div class="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-6 font-black text-2xl">!</div>
        <h2 class="text-2xl font-bold text-white mb-2">Instance Not Found</h2>
        <p class="text-sm text-slate-500 mb-8">The instance with ID <span class="text-slate-300 font-mono">{{ instanceId }}</span> could not be retrieved.</p>
        <button @click="goBack" class="px-8 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
            Return to Instances
        </button>
    </div>

    <!-- Footer Actions (Sticky) -->
    <div class="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 flex items-center justify-end px-8 md:px-16 py-4 gap-4 z-50 backdrop-blur-xl">
      <button @click="goBack" 
        class="px-8 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all active:scale-95 shadow-lg">
        Go Back
      </button>
      <button v-if="computeStore.currentInstance" @click="handleConnect"
        class="px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95 shadow-xl">
        Connect
      </button>
    </div>

    <!-- Connect Modal -->
    <ConnectInstanceModal 
      :isOpen="isConnectModalOpen" 
      :instance="computeStore.currentInstance"
      @close="isConnectModalOpen = false"
    />
  </div>
</template>

<style scoped>
.glass-panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0% , rgba(255, 255, 255, 0.01) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.animate-in {
    animation-duration: 0.5s;
    animation-fill-mode: both;
}

@keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slide-in-from-bottom {
    from { transform: translateY(10px); }
    to { transform: translateY(0); }
}

.fade-in {
    animation-name: fade-in;
}

.slide-in-from-bottom-2 {
    animation-name: slide-in-from-bottom;
}
</style>
