<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'
import { useToastStore } from '@/shared/store/toastStore'
import ConnectInstanceModal from '../components/ConnectInstanceModal.vue'
import ChangeVpcModal from '@/shared/components/ChangeVpcModal.vue'

const route = useRoute()
const router = useRouter()
const computeStore = useComputeStore()
const toastStore = useToastStore()
const instanceId = computed(() => route.params.id as string)

const activeTab = ref('details')
const isConnectModalOpen = ref(false)
const isVpcModalOpen = ref(false)

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
  console.log('[DEBUG] Page mounted for instance:', instanceId.value)
  await computeStore.fetchInstance(instanceId.value)
  await computeStore.fetchInstanceSecurityGroups(instanceId.value)
  await computeStore.fetchVolumes()
  await computeStore.fetchInstanceStatusChecks(instanceId.value)
  await computeStore.fetchInstanceMetrics(instanceId.value)
  await computeStore.fetchInstanceTags(instanceId.value)
  await computeStore.fetchVpcs()
  console.log('[DEBUG] Security groups loaded:', computeStore.instanceSecurityGroups)
})

const attachedVolumes = computed(() => {
  return computeStore.volumes.filter(v => v.instance_id === instanceId.value)
})

const firstSecurityGroup = computed(() => {
  if (computeStore.instanceSecurityGroups && computeStore.instanceSecurityGroups.length > 0) {
    return computeStore.instanceSecurityGroups[0]
  }
  // Try fallback to instance object fields if separate fetch failed
  const inst = computeStore.currentInstance
  const fallbackId = inst?.security_group_id || inst?.security_groups?.[0]?.id || inst?.security_group?.[0]?.id
  if (fallbackId) {
    console.log('[DEBUG] Using fallback security group ID from instance object:', fallbackId)
    return { id: fallbackId }
  }
  return null
})

const goToEditRules = (type: 'inbound' | 'outbound') => {
  console.log('[DEBUG] goToEditRules called:', { type, sg: firstSecurityGroup.value })
  if (firstSecurityGroup.value) {
    const target = `/compute/security-groups/${firstSecurityGroup.value.id}/edit-rules`
    console.log('[DEBUG] Redirecting to:', target)
    router.push(target)
  } else {
    console.error('[DEBUG] Redirection failed: No security group found.')
    alert('No security group ID detected for this node. Ensure the instance has an associated security group.')
  }
}

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

// Storage Action Logic
const isStorageModalOpen = ref(false)
const storageActionType = ref<'expand' | 'detach' | null>(null)
const targetVolumeId = ref<string | null>(null)
const newVolumeSize = ref<number>(20)
const isOperating = ref(false)

const goToAttachVolume = () => {
  router.push({
    path: '/compute/volumes/attach',
    query: { instanceId: instanceId.value }
  })
}

const openStorageConfirm = (type: 'expand' | 'detach', volumeId: string, currentSize: number = 20) => {
  storageActionType.value = type
  targetVolumeId.value = volumeId
  newVolumeSize.value = currentSize + 10
  isStorageModalOpen.value = true
}

const handleStorageConfirm = async () => {
  if (!targetVolumeId.value) return

  isOperating.value = true
  try {
    if (storageActionType.value === 'expand') {
      await computeStore.expandVolume(targetVolumeId.value, newVolumeSize.value)
      toastStore.addToast('Storage expansion cycles started', 'success')
    } else if (storageActionType.value === 'detach') {
      await computeStore.detachVolume(targetVolumeId.value)
      toastStore.addToast('Volume detached successfully', 'success')
      await computeStore.fetchInstance(instanceId.value)
    }
  } catch (error: any) {
    console.error(`Failed to ${storageActionType.value} volume:`, error)
    const message = error.response?.data?.message || error.message || `Failed to ${storageActionType.value} volume`
    toastStore.addToast(message, 'error')
  } finally {
    isOperating.value = false
    isStorageModalOpen.value = false
  }
}

const refreshStatusChecks = async () => {
  await computeStore.fetchInstanceStatusChecks(instanceId.value)
}

// Monitoring Logic
const isAutoRefreshEnabled = ref(false)
let refreshInterval: any = null

const toggleAutoRefresh = () => {
  isAutoRefreshEnabled.value = !isAutoRefreshEnabled.value
  if (isAutoRefreshEnabled.value) {
    refreshInterval = setInterval(() => {
      computeStore.fetchInstanceMetrics(instanceId.value)
    }, 5000)
  } else {
    if (refreshInterval) clearInterval(refreshInterval)
  }
}

// VPC Logic
const handleVpcRefresh = async () => {
  await computeStore.fetchVpcs()
}

const handleVpcCreate = async (name: string) => {
  try {
    await computeStore.createVpc(name)
    toastStore.addToast('VPC created successfully', 'success')
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to create VPC'
    toastStore.addToast(message, 'error')
  }
}

const handleVpcChange = async (vpcId: string) => {
  try {
    await computeStore.changeInstanceVpc(instanceId.value, vpcId)
    toastStore.addToast('VPC assignment update initiated', 'success')
    isVpcModalOpen.value = false
    await computeStore.fetchInstance(instanceId.value)
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to update VPC assignment'
    toastStore.addToast(message, 'error')
  }
}

// Memory percentage helper
const memoryPercent = computed(() => {
  const metrics = computeStore.currentInstanceMetrics
  if (!metrics || metrics.ram_total_mb === 0) return 0
  return Math.round((metrics.ram_usage_mb / metrics.ram_total_mb) * 100)
})

// Tag Management
const newTag = ref({ key: '', value: '' })
const isAddingTag = ref(false)

const handleAddTag = async () => {
  if (!newTag.value.key.trim()) return
  isAddingTag.value = true
  try {
    await computeStore.addInstanceTag(instanceId.value, { ...newTag.value })
    newTag.value = { key: '', value: '' }
    toastStore.addToast('Tag assigned successfully', 'success')
  } catch (error) {
    toastStore.addToast('Failed to assign tag', 'error')
  } finally {
    isAddingTag.value = false
  }
}

const handleRemoveTag = async (key: string) => {
  try {
    await computeStore.deleteInstanceTag(instanceId.value, key)
    toastStore.addToast('Tag removed successfully', 'success')
  } catch (error) {
    toastStore.addToast('Failed to remove tag', 'error')
  }
}

// Snapshot Logic
const isSnapshotModalOpen = ref(false)
const isCreatingSnapshot = ref(false)
const snapshotForm = ref({
  name: '',
  description: ''
})

const openSnapshotModal = () => {
  const timestamp = Date.now()
  snapshotForm.value = {
    name: `Snapshot_${instanceId.value.slice(0, 8)}_${timestamp}`,
    description: `Manual snapshot of instance ${instanceId.value}`
  }
  isSnapshotModalOpen.value = true
}

const handleSnapshotCreate = async () => {
  if (!snapshotForm.value.name.trim()) return
  isCreatingSnapshot.value = true
  try {
    await computeStore.createSnapshot(instanceId.value, { ...snapshotForm.value })
    toastStore.addToast('Snapshot creation protocol initiated', 'success')
    isSnapshotModalOpen.value = false
  } catch (error: any) {
    console.error('Failed to create instance snapshot:', error)
    toastStore.addToast(error.response?.data?.message || 'Failed to initiate snapshot', 'error')
  } finally {
    isCreatingSnapshot.value = false
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
        <span class="text-[#232f3e] font-black">NODE_{{ instanceId.slice(0, 8) }}</span>
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
                computeStore.currentInstance.state?.toLowerCase() === 'running' ? 'text-emerald-600 border-emerald-600/20 bg-emerald-500/5' :
                  computeStore.currentInstance.state?.toLowerCase() === 'stopped' ? 'text-rose-600 border-rose-600/20 bg-rose-500/5' :
                    'text-[#879196] border-[#eaeded] bg-[#fafafa]'
              ]">
                <span
                  :class="['w-1.5 h-1.5', computeStore.currentInstance.state?.toLowerCase() === 'running' ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600']"></span>
                {{ computeStore.currentInstance.state }}
              </span>
            </div>
            <p class="text-[10px] font-black text-[#545b64] uppercase tracking-[0.2em] italic">
              // CLUSTER_MEMBER: {{ computeStore.currentInstance.type }} // INGRESS_IP: {{
                computeStore.currentInstance.publicIp || 'NO_PUBLIC_ROUTE'
              }} // ID: {{ computeStore.currentInstance.id }}
            </p>
          </div>
        </div>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center bg-[#fafafa] border-2 border-[#232f3e] overflow-hidden p-1 shadow-none">
            <button @click="handleAction('start')"
              v-if="computeStore.currentInstance.state?.toLowerCase() !== 'running'"
              class="px-4 py-3 hover:bg-emerald-500/10 text-emerald-600 transition-all border-r-2 border-[#eaeded] group"
              title="START_PROTOCOL">
              <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <button @click="handleAction('stop')" v-if="computeStore.currentInstance.state?.toLowerCase() === 'running'"
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
          <h4 class="text-[9px] font-black text-[#545b64] uppercase tracking-[0.2em] mb-4 italic">// {{ metric.label }}
          </h4>
          <p class="text-xl font-black text-[#232f3e] tracking-tight uppercase">{{ metric.value }}</p>
          <p class="text-[9px] font-black text-[#545b64] mt-2 uppercase tracking-widest">{{ metric.sub }}</p>
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
                <div class="pt-8">
                  <button @click="openSnapshotModal"
                    class="w-full py-4 border-2 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] hover:text-white transition-all">
                    Create_Instance_Snapshot
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'security'" class="space-y-10">
          <div class="flex items-end justify-between border-b-2 border-[#eaeded] pb-6">
            <h3 class="text-xl font-black text-[#232f3e] uppercase tracking-tight">Access_Matrix_Rules</h3>
            <div class="flex items-center gap-6">
              <button @click="goToEditRules('inbound')"
                class="text-[10px] font-black uppercase tracking-widest text-blue-600 border-b-2 border-blue-600/20 hover:text-[#232f3e] hover:border-[#232f3e] transition-all pb-1">Modify_Inbound_Protocol</button>
              <button @click="goToEditRules('outbound')"
                class="text-[10px] font-black uppercase tracking-widest text-[#545b64] border-b-2 border-[#eaeded] hover:text-[#232f3e] hover:border-[#232f3e] transition-all pb-1">Modify_Outbound_Protocol</button>
            </div>
          </div>
          <div class="overflow-x-auto border-2 border-[#eaeded]">
            <table class="w-full text-left border-collapse">
              <thead
                class="bg-[#fafafa] text-[10px] font-black uppercase tracking-[0.2em] text-[#545b64] border-b-2 border-[#eaeded]">
                <tr>
                  <th class="p-8 border-r-2 border-[#eaeded]">Group_Identifier</th>
                  <th class="p-8 border-r-2 border-[#eaeded]">Protocol_Class</th>
                  <th class="p-8 border-r-2 border-[#eaeded]">Port_Range</th>
                  <th class="p-8">Source_Cidr</th>
                </tr>
              </thead>
              <tbody class="text-sm divide-y-2 divide-[#eaeded] font-black uppercase">
                <template v-if="computeStore.instanceSecurityGroups.length > 0">
                  <template v-for="sg in computeStore.instanceSecurityGroups" :key="sg.id">
                    <tr v-for="rule in sg.rules.filter(r => r.type === 'inbound')" :key="rule.id"
                      class="hover:bg-[#fafafa] transition-colors">
                      <td class="p-8 border-r-2 border-[#eaeded] text-blue-600">{{ sg.name }}</td>
                      <td class="p-8 border-r-2 border-[#eaeded] text-[#232f3e]">{{ rule.protocol }}</td>
                      <td class="p-8 border-r-2 border-[#eaeded] text-[#232f3e]">{{ rule.from_port === rule.to_port ?
                        rule.from_port : `${rule.from_port}-${rule.to_port}` }}</td>
                      <td class="p-8 text-[#545b64] font-mono italic">{{ rule.source_dest_cidr }}</td>
                    </tr>
                  </template>
                </template>
                <tr v-else class="hover:bg-[#fafafa] transition-colors">
                  <td class="p-8 border-r-2 border-[#eaeded] text-blue-600 font-black uppercase">PROD_GATEWAY_V1</td>
                  <td class="p-8 border-r-2 border-[#eaeded] text-[#232f3e] font-black uppercase">TCP_HANDSHAKE</td>
                  <td class="p-8 border-r-2 border-[#eaeded] text-[#232f3e] font-black">PORT_22</td>
                  <td class="p-8 text-[#545b64] font-mono font-bold italic">0.0.0.0/0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Networking Tab -->
        <div v-else-if="activeTab === 'networking'" class="space-y-12">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            <!-- Node_Network_Architecture -->
            <div class="space-y-8">
                <div class="flex items-center justify-between mb-2">
                  <span class="w-1.5 h-6 bg-blue-600"></span>
                  <h3 class="text-xl font-black text-[#232f3e] uppercase tracking-tight flex-1 ml-4">
                    Node_Network_Architecture
                  </h3>
                  <button @click="isVpcModalOpen = true"
                    class="text-[9px] font-black text-blue-600 border border-blue-600/20 px-3 py-1 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest">
                    Change_VPC
                  </button>
                </div>
              <div class="space-y-4">
                <div v-for="item in [
                  { label: 'VPC_MAP_ID', value: computeStore.currentInstance.vpc_id || 'VPC-7B2A91D0_MAPPED' },
                  { label: 'SUBNET_PARTITION_ID', value: computeStore.currentInstance.subnet_id || 'SUBNET-C9F8E7C5_PRIMARY' },
                  { label: 'NETWORK_INTERFACE_ID', value: 'ENI-' + (computeStore.currentInstance.id?.slice(2) || '8B3D2F1E') }
                ]" :key="item.label" class="py-4 border-b-2 border-[#eaeded] flex flex-col">
                  <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-2 italic">// {{
                    item.label }}</span>
                  <span class="text-sm font-black text-[#232f3e] uppercase font-mono">{{ item.value }}</span>
                </div>
              </div>
            </div>

            <!-- IP_Allocation_Map -->
            <div class="space-y-8">
              <h3 class="text-xl font-black text-[#232f3e] flex items-center gap-4 uppercase tracking-tight">
                <span class="w-1.5 h-6 bg-blue-600"></span>
                IP_Allocation_Map
              </h3>
              <div class="space-y-4">
                <div v-for="item in [
                  { label: 'PUBLIC_IPV4_PROTOCOL', value: computeStore.currentInstance.publicIp || '0.0.0.0' },
                  { label: 'PRIVATE_IPV4_INTRA', value: computeStore.currentInstance.privateIp || '10.0.1.15' },
                  { label: 'ELASTIC_IP_MAP', value: computeStore.currentInstance.publicIp ? 'MAPPED' : 'UNMAPPED' }
                ]" :key="item.label" class="py-4 border-b-2 border-[#eaeded] flex flex-col">
                  <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-2 italic">// {{
                    item.label }}</span>
                  <span class="text-sm font-black text-blue-600 uppercase">{{ item.value }}</span>
                </div>
              </div>
            </div>

            <!-- Interface_Identity -->
            <div class="space-y-8">
              <h3 class="text-xl font-black text-[#232f3e] flex items-center gap-4 uppercase tracking-tight">
                <span class="w-1.5 h-6 bg-blue-600"></span>
                Interface_Identity
              </h3>
              <div class="space-y-4">
                <div v-for="item in [
                  { label: 'MAC_ADDRESS_SIGNED', value: '00:16:3E:4F:7A:B2' },
                  { label: 'SOURCE_DEST_CHECK', value: 'ENABLED' },
                  { label: 'SECONDARY_IP_SLOTS', value: '0_ACTIVE' }
                ]" :key="item.label" class="py-4 border-b-2 border-[#eaeded] flex flex-col">
                  <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-2 italic">// {{
                    item.label }}</span>
                  <span class="text-sm font-black text-[#232f3e] uppercase">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Storage Tab -->
        <div v-else-if="activeTab === 'storage'" class="space-y-10">
          <div class="flex items-end justify-between border-b-2 border-[#eaeded] pb-6">
            <h3 class="text-xl font-black text-[#232f3e] uppercase tracking-tight">Block_Volume_Inventory</h3>
            <button @click="goToAttachVolume"
              class="px-8 py-3 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
              Attach_New_Volume
            </button>
          </div>
          <div class="overflow-x-auto border-2 border-[#eaeded]">
            <table class="w-full text-left border-collapse">
              <thead
                class="bg-[#fafafa] text-[10px] font-black uppercase tracking-[0.2em] text-[#545b64] border-b-2 border-[#eaeded]">
                <tr>
                  <th class="p-8 border-r-2 border-[#eaeded]">Volume_Descriptor</th>
                  <th class="p-8 border-r-2 border-[#eaeded]">Device_Bus</th>
                  <th class="p-8 border-r-2 border-[#eaeded]">Capacity_Alloc</th>
                  <th class="p-8 border-r-2 border-[#eaeded]">Media_Tier</th>
                  <th class="p-8">Lifecycle_State</th>
                </tr>
              </thead>
              <tbody class="text-sm divide-y-2 divide-[#eaeded] font-black uppercase">
                <tr v-for="vol in attachedVolumes" :key="vol.id" class="hover:bg-[#fafafa] transition-colors">
                  <td class="p-8 border-r-2 border-[#eaeded] text-blue-600">{{ vol.id }}</td>
                  <td class="p-8 border-r-2 border-[#eaeded] text-[#232f3e]">{{ vol.device || '/dev/vdb' }}</td>
                  <td class="p-8 border-r-2 border-[#eaeded] text-[#232f3e]">{{ vol.size }} GIB</td>
                  <td class="p-8 border-r-2 border-[#eaeded] text-[#545b64]">{{ vol.type }}</td>
                  <td class="p-8">
                    <div class="flex items-center justify-between">
                      <span :class="[
                        'text-[10px] font-black px-3 py-1 border-2 tracking-widest',
                        vol.state?.toLowerCase() === 'available' ? 'text-blue-600 border-blue-600/20 bg-blue-500/5' :
                          vol.state?.toLowerCase() === 'attached' ? 'text-emerald-600 border-emerald-600/20 bg-emerald-500/5' :
                            'text-amber-600 border-amber-600/20 bg-amber-500/5'
                      ]">{{ vol.state }}</span>
                      <div class="flex gap-4">
                        <button @click="openStorageConfirm('expand', vol.id, vol.size)"
                          class="text-blue-600 hover:underline decoration-2 underline-offset-4">EXPAND</button>
                        <button @click="openStorageConfirm('detach', vol.id)"
                          class="text-rose-600 hover:underline decoration-2 underline-offset-4">DETACH</button>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr v-if="attachedVolumes.length === 0">
                  <td colspan="5"
                    class="p-12 text-center text-[#879196] italic opacity-50 uppercase tracking-widest text-[10px]">
                    No volumes attached to this node
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Component Details Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-16 mt-12">
            <div class="space-y-8">
              <h3 class="text-xl font-black text-[#232f3e] flex items-center gap-4 uppercase tracking-tight">
                <span class="w-1.5 h-6 bg-blue-600"></span>
                Storage_Subsystem_Status
              </h3>
              <div class="p-8 bg-[#fafafa] border-2 border-[#eaeded] space-y-6">
                <div class="flex justify-between items-center">
                  <span class="text-[10px] font-black text-[#879196] uppercase tracking-widest italic">//
                    I/O_PERFORMANCE</span>
                  <span class="text-xs font-black text-[#232f3e]">OPTIMIZED_3000_IOPS</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-[10px] font-black text-[#879196] uppercase tracking-widest italic">//
                    ENCRYPTION_LAYER</span>
                  <span class="text-xs font-black text-emerald-600">AES_256_ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Checks Tab Content -->
        <div v-else-if="activeTab === 'checks'" class="space-y-12">
          <!-- Summary Card -->
          <div class="bg-[#fafafa] border-2 border-[#232f3e] p-8 flex items-center justify-between">
            <div class="flex items-center gap-6">
              <div
                :class="['w-16 h-16 border-2 flex items-center justify-center font-black text-2xl uppercase',
                  computeStore.instanceStatusChecks.every(c => c.status === 'passed') ? 'text-emerald-600 border-emerald-600 bg-emerald-500/5' : 'text-amber-600 border-amber-600 bg-amber-500/5']">
                {{computeStore.instanceStatusChecks.filter(c => c.status === 'passed').length}}/{{
                  computeStore.instanceStatusChecks.length }}
              </div>
              <div>
                <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter italic">Status_Check_Matrix
                </h3>
                <p class="text-[10px] text-[#879196] font-black uppercase tracking-widest mt-1">
                  // HEALTHY_NODE_CONFIRMATION_PROTOCOL
                </p>
              </div>
            </div>
            <button @click="refreshStatusChecks"
              class="px-8 py-3 border-2 border-[#232f3e] text-[#232f3e] text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] hover:text-white transition-all">
              REFRESH_CYCLES
            </button>
          </div>

          <!-- Individual Checks Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div v-for="check in computeStore.instanceStatusChecks" :key="check.id"
              class="bg-white border-2 border-[#eaeded] hover:border-[#232f3e] transition-colors p-8 space-y-6 group">
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] italic">// {{ check.id
                }}</span>
                <span :class="['px-3 py-1 border-2 text-[10px] font-black uppercase tracking-widest',
                  check.status === 'passed' ? 'text-emerald-600 border-emerald-600/20 bg-emerald-500/5' :
                    check.status === 'pending' ? 'text-blue-600 border-blue-600/20 bg-blue-500/5' :
                      'text-amber-600 border-amber-600/20 bg-amber-500/5']">
                  {{ check.status }}
                </span>
              </div>

              <div class="space-y-2">
                <h4
                  class="text-lg font-black text-[#232f3e] uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                  {{ check.name }}
                </h4>
                <p class="text-[11px] text-[#879196] font-bold uppercase tracking-widest leading-relaxed">
                  {{ check.details }}
                </p>
              </div>

              <div
                class="pt-4 border-t border-[#eaeded] flex items-center justify-between text-[8px] font-black text-[#879196] uppercase tracking-widest">
                <span>Last_Refreshed</span>
                <span class="text-[#232f3e] italic">{{ new Date(check.updated_at).toLocaleTimeString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Monitoring Tab Content -->
        <div v-else-if="activeTab === 'monitoring'" class="space-y-12">
          <!-- Monitoring Header -->
          <div class="flex items-center justify-between border-b-2 border-[#eaeded] pb-8">
            <div class="space-y-2">
              <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter italic">Telemetric_Resource_Scan
              </h3>
              <p class="text-[10px] text-[#879196] font-black uppercase tracking-widest italic">//
                REALTIME_METRIC_AGGREGATOR
              </p>
            </div>
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-3">
                <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest">Auto_Refresh</span>
                <button @click="toggleAutoRefresh"
                  :class="['w-12 h-6 border-2 transition-all p-1 flex relative', isAutoRefreshEnabled ? 'border-emerald-600 bg-emerald-500/5' : 'border-[#eaeded] bg-[#fafafa]']">
                  <div
                    :class="['w-3.5 h-3.5 transition-all', isAutoRefreshEnabled ? 'bg-emerald-600 translate-x-6' : 'bg-[#879196] translation-x-0']">
                  </div>
                </button>
              </div>
              <button @click="computeStore.fetchInstanceMetrics(instanceId)"
                class="px-6 py-2 border-2 border-[#232f3e] text-[9px] font-black uppercase tracking-widest hover:bg-[#232f3e] hover:text-white transition-all">
                POLL_NOW
              </button>
            </div>
          </div>

          <!-- Gauges Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- CPU Gauge -->
            <div class="bg-[#fafafa] border-2 border-[#232f3e] p-12 relative overflow-hidden group">
              <div
                class="absolute right-0 top-0 w-24 h-24 bg-white/10 -rotate-45 translate-x-12 -translate-y-12 border-l-2 border-[#232f3e]">
              </div>
              <div class="relative z-10 space-y-8 text-center pt-8">
                <span class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em] mb-4 block italic">//
                  CPU_UTILIZATION_FLUX</span>
                <div class="inline-flex items-center justify-center relative">
                  <svg class="w-48 h-48 -rotate-90">
                    <circle cx="96" cy="96" r="88" fill="none" stroke="#eaeded" stroke-width="8" />
                    <circle cx="96" cy="96" r="88" fill="none" class="transition-all duration-1000"
                      :stroke="(computeStore.currentInstanceMetrics?.cpu_usage ?? 0) > 80 ? '#e11d48' : '#2563eb'"
                      stroke-width="12" :stroke-dasharray="2 * Math.PI * 88"
                      :stroke-dashoffset="2 * Math.PI * 88 * (1 - (computeStore.currentInstanceMetrics?.cpu_usage || 0) / 100)" />
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center pt-4">
                    <span class="text-5xl font-black text-[#232f3e] tracking-tighter">{{
                      computeStore.currentInstanceMetrics?.cpu_usage || 0 }}%</span>
                    <span class="text-[9px] font-black text-blue-600 tracking-widest uppercase mt-1">Active_Load</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- RAM Gauge -->
            <div class="bg-[#fafafa] border-2 border-[#232f3e] p-12 relative overflow-hidden group">
              <div
                class="absolute right-0 top-0 w-24 h-24 bg-white/10 -rotate-45 translate-x-12 -translate-y-12 border-l-2 border-[#232f3e]">
              </div>
              <div class="relative z-10 space-y-8 text-center pt-8">
                <span class="text-[10px] font-black text-[#879196] uppercase tracking-[0.3em] mb-4 block italic">//
                  MEMORY_MAP_INTENSITY</span>
                <div class="inline-flex items-center justify-center relative">
                  <svg class="w-48 h-48 -rotate-90">
                    <circle cx="96" cy="96" r="88" fill="none" stroke="#eaeded" stroke-width="8" />
                    <circle cx="96" cy="96" r="88" fill="none" class="transition-all duration-1000"
                      :stroke="(memoryPercent ?? 0) > 85 ? '#e11d48' : '#2563eb'" stroke-width="12"
                      :stroke-dasharray="2 * Math.PI * 88"
                      :stroke-dashoffset="2 * Math.PI * 88 * (1 - (memoryPercent || 0) / 100)" />
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center pt-4">
                    <span class="text-5xl font-black text-[#232f3e] tracking-tighter">{{
                      computeStore.currentInstanceMetrics?.ram_usage_mb || 0 }}</span>
                    <span class="text-[9px] font-black text-blue-600 tracking-widest uppercase mt-1">MiB_Consumed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Secondary Metrics Grid -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div v-for="metric in [
              { label: 'Network_Ingress', value: (computeStore.currentInstanceMetrics?.network_in_kbps || 0) + ' KB/S', icon: 'down' },
              { label: 'Network_Egress', value: (computeStore.currentInstanceMetrics?.network_out_kbps || 0) + ' KB/S', icon: 'up' },
              { label: 'Disk_Read_Iops', value: computeStore.currentInstanceMetrics?.disk_read_iops || 0, icon: 'read' },
              { label: 'Disk_Write_Iops', value: computeStore.currentInstanceMetrics?.disk_write_iops || 0, icon: 'write' }
            ]" :key="metric.label"
              class="bg-white border-2 border-[#eaeded] p-6 space-y-4 hover:border-[#232f3e] transition-colors">
              <span class="text-[8px] font-black text-[#879196] uppercase tracking-widest italic">// {{ metric.label
              }}</span>
              <div class="flex items-end justify-between">
                <span class="text-2xl font-black text-[#232f3e] tracking-tight truncate">{{ metric.value }}</span>
                <div class="w-8 h-8 rounded-full bg-[#fafafa] flex items-center justify-center text-blue-600">
                  <svg v-if="metric.icon === 'down'" class="w-4 h-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <svg v-else-if="metric.icon === 'up'" class="w-4 h-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tags Tab Content -->
        <div v-else-if="activeTab === 'tags'" class="space-y-12">
          <!-- Add Tag Form -->
          <div class="bg-[#fafafa] border-2 border-[#232f3e] p-8 space-y-8">
            <h3 class="text-xl font-black text-[#232f3e] uppercase tracking-tighter italic flex items-center gap-4">
              <span class="w-1.5 h-6 bg-blue-600"></span>
              Assign_New_Metadata
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-4">
                <label class="text-[10px] font-black text-[#879196] uppercase tracking-widest block italic">//
                  TAG_KEY</label>
                <input v-model="newTag.key" type="text" placeholder="e.g., Environment"
                  class="w-full bg-white border-4 border-[#eaeded] p-4 text-sm font-black uppercase tracking-tight focus:border-blue-600 outline-none transition-colors">
              </div>
              <div class="space-y-4">
                <label class="text-[10px] font-black text-[#879196] uppercase tracking-widest block italic">//
                  TAG_VALUE</label>
                <input v-model="newTag.value" type="text" placeholder="e.g., Production"
                  class="w-full bg-white border-4 border-[#eaeded] p-4 text-sm font-black uppercase tracking-tight focus:border-blue-600 outline-none transition-colors">
              </div>
            </div>

            <div class="flex justify-end">
              <button @click="handleAddTag" :disabled="isAddingTag || !newTag.key.trim()"
                class="px-12 py-4 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50">
                <span v-if="!isAddingTag">COMMIT_METADATA</span>
                <span v-else class="animate-pulse">COMMITTING...</span>
              </button>
            </div>
          </div>

          <!-- Existing Tags Table -->
          <div class="border-2 border-[#eaeded] overflow-hidden">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-[#fafafa] border-b-2 border-[#eaeded]">
                  <th
                    class="p-8 text-left text-[10px] font-black text-[#879196] uppercase tracking-widest italic w-1/3 border-r-2 border-[#eaeded]">
                    // IDENTIFIER_KEY
                  </th>
                  <th
                    class="p-8 text-left text-[10px] font-black text-[#879196] uppercase tracking-widest italic border-r-2 border-[#eaeded]">
                    // ASSIGNED_VALUE
                  </th>
                  <th
                    class="p-8 text-right text-[10px] font-black text-[#879196] uppercase tracking-widest italic w-32">
                    // ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tag in computeStore.instanceTags" :key="tag.key"
                  class="border-b border-[#eaeded] hover:bg-blue-500/5 transition-colors group">
                  <td class="p-8 border-r-2 border-[#eaeded] text-blue-600 font-black text-xs uppercase tracking-tight">
                    {{ tag.key }}
                  </td>
                  <td class="p-8 border-r-2 border-[#eaeded] text-[#232f3e] font-bold text-xs">
                    {{ tag.value || '(empty)' }}
                  </td>
                  <td class="p-8 text-right">
                    <button @click="handleRemoveTag(tag.key)"
                      class="text-rose-600 hover:text-rose-800 text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                      REMOVE
                    </button>
                  </td>
                </tr>
                <tr v-if="computeStore.instanceTags.length === 0">
                  <td colspan="3"
                    class="p-16 text-center text-[#879196] italic uppercase tracking-[0.3em] font-black opacity-30 text-[11px]">
                    No metadata assigned to this node
                  </td>
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

    <!-- Storage Confirmation Modal -->
    <div v-if="isStorageModalOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-[#232f3e]/90 backdrop-blur-sm">
      <div class="bg-white border-2 border-[#232f3e] p-12 max-w-lg w-full relative overflow-hidden">
        <div
          class="absolute right-0 top-0 w-24 h-24 bg-[#fafafa] -rotate-45 translate-x-12 -translate-y-12 border-l-2 border-[#232f3e]">
        </div>
        <div class="space-y-8 relative z-10">
          <div class="flex items-center gap-4 text-rose-600">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 class="text-2xl font-black uppercase tracking-tighter italic">Confirm_Storage_Protocol</h3>
          </div>

          <p class="text-sm font-black text-[#545b64] uppercase tracking-widest leading-relaxed">
            Are you sure you want to <span class="text-blue-600">{{ storageActionType }}</span> this volume ({{
              targetVolumeId
            }})?
            This action may result in temporary I/O latency or data unavailability.
          </p>

          <!-- Expand Size Input -->
          <div v-if="storageActionType === 'expand'" class="space-y-4">
            <label class="text-[10px] font-black text-[#879196] uppercase tracking-widest block italic">//
              NEW_CAPACITY_TARGET_GIB</label>
            <div class="relative">
              <input v-model.number="newVolumeSize" type="number" step="10"
                class="w-full bg-[#fafafa] border-4 border-[#232f3e] p-5 text-sm font-black uppercase tracking-tight focus:ring-0 focus:border-blue-600 transition-colors outline-none">
              <span
                class="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 uppercase tracking-widest">GIB_UNIT</span>
            </div>
          </div>

          <div class="flex justify-end gap-6 pt-4">
            <button @click="isStorageModalOpen = false" :disabled="isOperating"
              class="text-[10px] font-black uppercase tracking-widest text-[#879196] hover:text-[#232f3e] transition-colors">
              Abort_Operation
            </button>
            <button @click="handleStorageConfirm" :disabled="isOperating"
              class="px-10 py-4 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50">
              <span v-if="!isOperating">Confirm_Cycles</span>
              <span v-else class="animate-pulse">Processing...</span>
            </button>
          </div>
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
    <ConnectInstanceModal :is-open="isConnectModalOpen" :instance-id="instanceId" :public-ip="computeStore.currentInstance?.publicIp"
      @close="isConnectModalOpen = false" />

    <ChangeVpcModal :is-open="isVpcModalOpen" :resource-id="instanceId"
      :current-vpc-id="computeStore.currentInstance?.vpc_id" :vpcs="computeStore.vpcs"
      :is-loading="computeStore.isLoading" @close="isVpcModalOpen = false" @refresh="handleVpcRefresh"
      @create="handleVpcCreate" @change="handleVpcChange" />
    <!-- Snapshot Modal -->
    <div v-if="isSnapshotModalOpen"
      class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm">
      <div class="bg-white border-4 border-[#232f3e] w-full max-w-xl shadow-[30px_30px_0px_rgba(35,47,62,0.1)]">
        <div class="p-8 border-b-4 border-[#232f3e] flex justify-between items-center bg-[#fafafa]">
          <h2 class="text-2xl font-black text-[#232f3e] uppercase tracking-tighter italic">Initiate_Snapshot_Protocol
          </h2>
          <button @click="isSnapshotModalOpen = false" class="text-[#879196] hover:text-[#232f3e]">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-8 space-y-8">
          <div class="space-y-4">
            <label class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] italic">//
              SNAPSHOT_IDENTIFIER</label>
            <input v-model="snapshotForm.name" type="text"
              class="w-full bg-white border-4 border-[#eaeded] p-5 text-sm font-black uppercase tracking-tight focus:border-blue-600 outline-none transition-colors">
          </div>

          <div class="space-y-4">
            <label class="text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] italic">//
              STATE_DESCRIPTION</label>
            <textarea v-model="snapshotForm.description" rows="3"
              class="w-full bg-white border-4 border-[#eaeded] p-5 text-sm font-black uppercase tracking-tight focus:border-blue-600 outline-none transition-colors resize-none"></textarea>
          </div>

          <div class="flex gap-4 pt-4">
            <button @click="isSnapshotModalOpen = false"
              class="flex-1 py-5 border-2 border-[#232f3e] text-[#232f3e] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#fafafa] transition-all">
              ABORT_PROTOCOL
            </button>
            <button @click="handleSnapshotCreate" :disabled="isCreatingSnapshot || !snapshotForm.name.trim()"
              class="flex-1 py-5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#232f3e] transition-all disabled:opacity-50">
              <span v-if="!isCreatingSnapshot">EXECUTE_SNAPSHOT</span>
              <span v-else class="animate-pulse">SNAPSHOT_IN_PROGRESS...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
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
