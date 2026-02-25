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
  <div
    class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-blue-500/20 selection:text-blue-900 overflow-x-hidden pb-40">
    <!-- Structural Grid Background -->
    <div
      class="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
    </div>

    <!-- Loading Overlay -->
    <div v-if="computeStore.isLoading && !computeStore.currentInstance"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-6">
        <div class="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-none animate-spin"></div>
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[#232f3e]">Node_Sync_Active...</p>
      </div>
    </div>

    <div v-if="computeStore.currentInstance" class="relative z-10 p-8 px-8 md:px-16 pt-24 space-y-12">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
        <a href="#" @click.prevent="router.push('/dashboard')"
          class="text-[#879196] hover:text-blue-600 transition-colors">AWS_GLOBAL</a>
        <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
        <a href="#" @click.prevent="router.push('/compute')"
          class="text-[#879196] hover:text-blue-600 transition-colors">EC2_ENGINE</a>
        <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
        <a href="#" @click.prevent="goBack"
          class="text-[#879196] hover:text-blue-600 transition-colors">FLEET_CONTROL</a>
        <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
        <span class="text-[#232f3e]">NODE_{{ instanceId.slice(0, 8) }}</span>
      </nav>

      <!-- Header Section -->
      <div
        class="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-12 border-b-2 border-[#eaeded]">
        <div class="flex items-start gap-8">
          <div
            class="w-20 h-20 bg-[#232f3e] flex items-center justify-center text-white relative overflow-hidden group">
            <div
              class="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            </div>
            <svg class="w-10 h-10 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-6 mb-4">
              <h1 class="text-5xl font-black text-[#232f3e] tracking-tighter uppercase leading-none">{{
                computeStore.currentInstance.name || '// UNNAMED_NODE' }}</h1>
              <span :class="[
                'flex items-center gap-2 text-[10px] font-black px-4 py-1.5 bg-white border-2 uppercase tracking-widest',
                computeStore.currentInstance.state === 'Running' ? 'text-emerald-600 border-emerald-600/20 bg-emerald-500/5' :
                  computeStore.currentInstance.state === 'Stopped' ? 'text-rose-600 border-rose-600/20 bg-rose-500/5' :
                    'text-[#879196] border-[#eaeded] bg-[#fafafa]'
              ]">
                <span
                  :class="['w-1.5 h-1.5', computeStore.currentInstance.state === 'Running' ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600']"></span>
                {{ computeStore.currentInstance.state }}
              </span>
            </div>
            <p class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] italic">
              // CLUSTER_MEMBER: {{ computeStore.currentInstance.type }} // INGRESS_IP: {{
                computeStore.currentInstance.publicIp || 'NO_PUBLIC_ROUTE'
              }} // ID: {{ computeStore.currentInstance.id }}
            </p>
          </div>
        </div>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center bg-[#fafafa] border-2 border-[#232f3e] overflow-hidden p-1 shadow-none">
            <button @click="handleAction('start')" v-if="computeStore.currentInstance.state !== 'Running'"
              class="px-4 py-3 hover:bg-emerald-500/10 text-emerald-600 transition-all border-r-2 border-[#eaeded] group"
              title="START_PROTOCOL">
              <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <button @click="handleAction('stop')" v-if="computeStore.currentInstance.state === 'Running'"
              class="px-4 py-3 hover:bg-rose-500/10 text-rose-600 transition-all border-r-2 border-[#eaeded] group"
              title="STOP_PROTOCOL">
              <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <button @click="handleAction('restart')"
              class="px-4 py-3 hover:bg-amber-500/10 text-amber-600 transition-all border-r-2 border-[#eaeded] group"
              title="CYCLES_REBOOT">
              <svg class="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button @click="handleAction('delete')"
              class="px-4 py-3 hover:bg-rose-600 hover:text-white text-[#232f3e] transition-colors group"
              title="DECOMMISSION_NODE">
              <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <button @click="handleConnect"
            class="px-12 py-5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#232f3e] transition-all shadow-none">
            Establish_Connection
          </button>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="metric in [
          { label: 'Network_Ingress_IP', value: computeStore.currentInstance.publicIp || '0.0.0.0', sub: 'IPv4_Public_Protocol' },
          { label: 'Logical_State', value: computeStore.currentInstance.state, sub: 'Hardware_Lifecycle' },
          { label: 'Compute_Tier', value: computeStore.currentInstance.type, sub: 'Resource_Class' },
          { label: 'Infrastructure_Zone', value: computeStore.currentInstance.az || 'US-EAST-1A', sub: 'Regional_Endpoint' }
        ]" :key="metric.label"
          class="bg-white border-2 border-[#eaeded] p-8 hover:border-[#232f3e] transition-colors group">
          <h4 class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-4 italic">// {{ metric.label }}
          </h4>
          <p class="text-xl font-black text-[#232f3e] tracking-tight uppercase">{{ metric.value }}</p>
          <p class="text-[9px] font-black text-[#879196] mt-2 uppercase tracking-widest">{{ metric.sub }}</p>
        </div>
      </div>

      <!-- Navigation Matrix -->
      <div class="border-b-2 border-[#eaeded] flex overflow-x-auto scrollbar-hide">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          class="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative border-r-2 border-[#eaeded] whitespace-nowrap"
          :class="activeTab === tab.id ? 'text-blue-600 bg-[#fafafa]' : 'text-[#879196] hover:text-[#232f3e] hover:bg-[#fafafa]'">
          {{ tab.label }}
          <div v-if="activeTab === tab.id" class="absolute bottom-[-2px] left-0 right-0 h-[4px] bg-blue-600"></div>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="bg-white border-2 border-[#232f3e] p-12 min-h-[500px] relative overflow-hidden">
        <div
          class="absolute right-0 top-0 w-32 h-32 bg-[#fafafa] -rotate-45 translate-x-16 -translate-y-16 border-l-2 border-[#232f3e]">
        </div>

        <!-- Details Tab -->
        <div v-if="activeTab === 'details'" class="space-y-12">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            <div class="space-y-8">
              <h3 class="text-xl font-black text-[#232f3e] flex items-center gap-4 uppercase tracking-tight">
                <span class="w-1.5 h-6 bg-blue-600"></span>
                Node_Manifest
              </h3>
              <div class="space-y-4">
                <div v-for="item in [
                  { label: 'INSTANCE_DESCRIPTOR', value: computeStore.currentInstance.id },
                  { label: 'MEMORY_ALLOCATION', value: (computeStore.currentInstance.ram || 2048) + ' MB' },
                  { label: 'LOGICAL_CORES', value: computeStore.currentInstance.cpu || '2 VCPUS' }
                ]" :key="item.label" class="py-4 border-b-2 border-[#eaeded] flex flex-col">
                  <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-2 italic">// {{
                    item.label }}</span>
                  <span class="text-sm font-black text-[#232f3e] uppercase font-mono">{{ item.value }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-8">
              <h3 class="text-xl font-black text-[#232f3e] flex items-center gap-4 uppercase tracking-tight">
                <span class="w-1.5 h-6 bg-blue-600"></span>
                Image_Protocol
              </h3>
              <div class="space-y-4">
                <div v-for="item in [
                  { label: 'AMI_SIGNATURE', value: computeStore.currentInstance.image || 'UBUNTU-24.04-LTS' },
                  { label: 'SSH_IDENTITY_SET', value: (computeStore.currentInstance.ssh_key?.slice(0, 32) || 'RSA_KEY_2048_PRIVATE') + '...' }
                ]" :key="item.label" class="py-4 border-b-2 border-[#eaeded] flex flex-col">
                  <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-2 italic">// {{
                    item.label }}</span>
                  <span class="text-sm font-black text-blue-600 uppercase break-all">{{
                    item.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Tab -->
        <div v-else-if="activeTab === 'security'" class="space-y-10">
          <div class="flex items-end justify-between border-b-2 border-[#eaeded] pb-6">
            <h3 class="text-xl font-black text-[#232f3e] uppercase tracking-tight">Access_Matrix_Rules</h3>
            <button
              class="text-[10px] font-black uppercase tracking-widest text-blue-600 border-b-2 border-blue-600/20 hover:text-[#232f3e] hover:border-[#232f3e] transition-all pb-1">Modify_Inbound_Protocol</button>
          </div>
          <div class="overflow-x-auto border-2 border-[#eaeded]">
            <table class="w-full text-left border-collapse">
              <thead
                class="bg-[#fafafa] text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] border-b-2 border-[#eaeded]">
                <tr>
                  <th class="p-8 border-r-2 border-[#eaeded]">Group_Identifier</th>
                  <th class="p-8 border-r-2 border-[#eaeded]">Protocol_Class</th>
                  <th class="p-8 border-r-2 border-[#eaeded]">Port_Range</th>
                  <th class="p-8">Source_Cidr</th>
                </tr>
              </thead>
              <tbody class="text-sm divide-y-2 divide-[#eaeded]">
                <tr class="hover:bg-[#fafafa] transition-colors">
                  <td class="p-8 border-r-2 border-[#eaeded] text-blue-600 font-black uppercase">PROD_GATEWAY_V1</td>
                  <td class="p-8 border-r-2 border-[#eaeded] text-[#232f3e] font-black uppercase">TCP_HANDSHAKE</td>
                  <td class="p-8 border-r-2 border-[#eaeded] text-[#232f3e] font-black">PORT_22</td>
                  <td class="p-8 text-[#879196] font-mono font-bold italic">0.0.0.0/0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Placeholder for other tabs -->
        <div v-else class="flex flex-col items-center justify-center py-24 opacity-40">
          <div class="w-24 h-24 border-2 border-[#eaeded] flex items-center justify-center mb-10">
            <svg class="w-10 h-10 text-[#879196]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-[11px] font-black uppercase tracking-[0.4em] text-[#879196]">
            {{ activeTab }}_Stream_Pending
          </p>
        </div>
      </div>
    </div>

    <div v-else-if="!computeStore.isLoading"
      class="relative z-10 p-16 flex flex-col items-center justify-center min-h-[60vh]">
      <div
        class="w-32 h-32 border-4 border-rose-600 flex items-center justify-center text-rose-600 mb-10 font-black text-6xl italic">
        !</div>
      <h2 class="text-5xl font-black text-[#232f3e] mb-4 uppercase tracking-tighter">Null_Pointer_Instance</h2>
      <p class="text-sm font-black text-[#879196] mb-12 uppercase tracking-widest text-center">Infrastructure identifier
        <span class="text-[#232f3e] underline">{{ instanceId }}</span> could not be located in mesh topology.
      </p>
      <button @click="goBack"
        class="px-12 py-5 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
        Return_To_Topology
      </button>
    </div>

    <!-- Footer Actions (Sticky) -->
    <div
      class="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white border-2 border-[#232f3e] px-12 py-5 flex items-center gap-12 z-50 shadow-2xl">
      <div class="hidden md:flex flex-col pr-12 border-r-2 border-[#eaeded]">
        <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest mb-1 italic">Active_Target</span>
        <span class="text-xs font-black text-[#232f3e] uppercase tracking-tight">{{ instanceId.slice(0, 16) }}</span>
      </div>
      <button @click="goBack"
        class="text-[10px] font-black uppercase tracking-widest text-[#879196] hover:text-[#232f3e] transition-colors">
        Abort_View
      </button>
      <button v-if="computeStore.currentInstance" @click="handleConnect"
        class="px-12 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] transition-all">
        Connect_Node
      </button>
    </div>

    <!-- Connect Modal -->
    <ConnectInstanceModal :isOpen="isConnectModalOpen" :instance="computeStore.currentInstance"
      @close="isConnectModalOpen = false" />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
  font-family: 'Urbanist', sans-serif;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
