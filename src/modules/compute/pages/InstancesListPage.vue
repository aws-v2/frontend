<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'

const router = useRouter()
const computeStore = useComputeStore()

onMounted(async () => {
  await computeStore.fetchInstances()
})

const navigateToDetails = (id: string) => {
  router.push({ name: 'instance-details', params: { id } })
}

const navigateToLaunch = () => {
  router.push({ name: 'launch-instance' })
}

const goBack = () => {
  router.push('/compute')
}

// Action Handlers
const handleAction = async (action: 'start' | 'stop' | 'restart' | 'delete', id: string) => {
  if (action === 'delete') {
    if (!confirm('Are you sure you want to delete this instance?')) return
    await computeStore.deleteInstance(id)
  } else if (action === 'start') {
    await computeStore.startInstance(id)
  } else if (action === 'stop') {
    await computeStore.stopInstance(id)
  } else if (action === 'restart') {
    await computeStore.restartInstance(id)
  }
}
</script>

<template>
  <div class="min-h-screen bg-white text-[#16191f] font-urbanist pb-32 relative overflow-hidden">
    <!-- Structural Grid Background -->
    <div
      class="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none">
    </div>

    <div class="relative z-10 p-12 px-8 md:px-20 space-y-12 pt-24">
      <!-- Header Section -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b-2 border-[#eaeded] pb-12">
        <div class="space-y-6">
          <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em]">
            <a href="#" @click.prevent="router.push('/dashboard')"
              class="text-[#879196] hover:text-blue-600 transition-colors">AWS_GLOBAL</a>
            <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
            <a href="#" @click.prevent="goBack"
              class="text-[#879196] hover:text-blue-600 transition-colors">EC2_ENGINE</a>
            <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
            <span class="text-[#232f3e]">Node_Fleet</span>
          </nav>

          <div class="flex items-center gap-8">
            <div
              class="w-16 h-16 bg-[#232f3e] flex items-center justify-center text-white relative overflow-hidden group">
              <div
                class="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              </div>
              <svg class="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 class="text-5xl font-black text-[#232f3e] tracking-tighter uppercase leading-none">Instances</h1>
              <p class="text-[10px] text-[#879196] font-black uppercase tracking-[0.2em] mt-4 italic">// ACTIVE_NODES:
                {{ computeStore.instances.length }} // FLEET_MANAGEMENT_PROTOCOL</p>
            </div>
          </div>
        </div>

        <div class="flex gap-4">
          <button @click="navigateToLaunch"
            class="px-10 py-5 bg-[#232f3e] text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all flex items-center gap-4">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
            </svg>
            Launch_Instance
          </button>
        </div>
      </div>

      <!-- Filters & Analytics Matrix -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Search -->
        <div
          class="lg:col-span-8 bg-white border-2 border-[#232f3e] p-6 flex items-center gap-6 relative group overflow-hidden">
          <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600"></div>
          <svg class="w-5 h-5 text-[#232f3e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="QUERY_RESOURCES_PROTOCOL..."
            class="flex-grow bg-transparent border-none text-[#232f3e] font-black placeholder:text-[#eaeded] uppercase tracking-widest outline-none text-sm">
          <button @click="computeStore.fetchInstances()" :class="{ 'animate-spin text-blue-600': computeStore.isLoading }"
            class="p-2 text-[#232f3e] hover:text-blue-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="lg:col-span-4 grid grid-cols-2 gap-4">
          <div class="bg-[#fafafa] border-2 border-[#eaeded] p-6 flex flex-col justify-center">
            <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-1 italic">//
              HEALTHY_NODES</span>
            <span class="text-xl font-black text-emerald-600 uppercase">{{computeStore.instances.filter(i => i.state
              === 'Running').length }}</span>
          </div>
          <div class="bg-[#fafafa] border-2 border-[#eaeded] p-6 flex flex-col justify-center">
            <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-1 italic">//
              ESTIMATED_BURN</span>
            <span class="text-xl font-black text-[#232f3e] uppercase">$234.50</span>
          </div>
        </div>
      </div>

      <!-- Resource Table -->
      <div class="bg-white border-2 border-[#232f3e] overflow-hidden relative">
        <div
          class="absolute right-0 top-0 w-32 h-32 bg-[#fafafa] -rotate-45 translate-x-16 -translate-y-16 border-l-2 border-[#232f3e]">
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead
              class="bg-[#fafafa] border-b-2 border-[#eaeded] text-[10px] font-black uppercase tracking-[0.2em] text-[#879196]">
              <tr>
                <th class="p-8 border-r-2 border-[#eaeded]">Node_Name</th>
                <th class="p-8 border-r-2 border-[#eaeded]">Instance_ID</th>
                <th class="p-8 border-r-2 border-[#eaeded]">Logical_State</th>
                <th class="p-8 border-r-2 border-[#eaeded]">Resource_Type</th>
                <th class="p-8 border-r-2 border-[#eaeded]">Network_IP</th>
                <th class="p-8">Control_Ops</th>
              </tr>
            </thead>
            <tbody class="divide-y-2 divide-[#eaeded] text-sm">
              <tr v-for="instance in computeStore.instances" :key="instance.id"
                class="group hover:bg-[#fafafa] transition-colors cursor-pointer"
                @click="navigateToDetails(instance.id)">
                <td class="p-8 border-r-2 border-[#eaeded]">
                  <span
                    class="font-black text-[#232f3e] group-hover:text-blue-600 transition-colors uppercase tracking-tight">{{
                      instance.name || '// UNNAMED_NODE' }}</span>
                </td>
                <td class="p-8 border-r-2 border-[#eaeded] font-mono text-[#879196] font-bold">
                  {{ instance.id }}
                </td>
                <td class="p-8 border-r-2 border-[#eaeded]">
                  <span :class="[
                    'flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1 border-2 tracking-widest w-fit',
                    instance.state === 'Running' ? 'text-emerald-600 border-emerald-600/20 bg-emerald-500/5' :
                      instance.state === 'Stopped' ? 'text-rose-600 border-rose-600/20 bg-rose-500/5' :
                        'text-[#879196] border-[#eaeded] bg-[#fafafa]'
                  ]">
                    <span
                      :class="['w-1.5 h-1.5', instance.state === 'Running' ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600']"></span>
                    {{ instance.state }}
                  </span>
                </td>
                <td class="p-8 border-r-2 border-[#eaeded] font-black text-[#232f3e] uppercase">
                  {{ instance.type }}
                </td>
                <td class="p-8 border-r-2 border-[#eaeded] font-mono text-[#879196] font-bold">
                  {{ instance.publicIp || '0.0.0.0' }}
                </td>
                <td class="p-8" @click.stop>
                  <div class="flex items-center gap-3">
                    <button @click="handleAction('start', instance.id)" v-if="instance.state !== 'Running'"
                      class="p-3 border-2 border-[#eaeded] text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all"
                      title="START_PROTOCOL">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clip-rule="evenodd" />
                      </svg>
                    </button>
                    <button @click="handleAction('stop', instance.id)" v-if="instance.state === 'Running'"
                      class="p-3 border-2 border-[#eaeded] text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all"
                      title="STOP_PROTOCOL">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                          clip-rule="evenodd" />
                      </svg>
                    </button>
                    <button @click="handleAction('restart', instance.id)"
                      class="p-3 border-2 border-[#eaeded] text-amber-600 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all"
                      title="CYCLES_REBOOT">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button @click="handleAction('delete', instance.id)"
                      class="p-3 border-2 border-[#eaeded] text-[#232f3e] hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all"
                      title="DECOMMISSION">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="computeStore.instances.length === 0 && !computeStore.isLoading">
                <td colspan="6" class="p-24 text-center">
                  <div class="flex flex-col items-center gap-6">
                    <div class="w-20 h-20 border-2 border-[#eaeded] flex items-center justify-center text-[#879196]">
                      <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p class="text-[11px] font-black text-[#879196] uppercase tracking-[0.4em]">NULL_FLEET_TOPOLOGY</p>
                    <button @click="navigateToLaunch"
                      class="px-8 py-3 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
                      Initialize_Resource_Stream
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Footer Actions (Sticky) -->
    <div
      class="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white border-2 border-[#232f3e] px-12 py-5 flex items-center gap-12 z-50 shadow-2xl">
      <div class="hidden md:flex flex-col pr-12 border-r-2 border-[#eaeded]">
        <span class="text-[9px] font-black text-[#879196] uppercase tracking-widest mb-1 italic">Active_Fleet</span>
        <span class="text-xs font-black text-[#232f3e] uppercase tracking-tight">{{ computeStore.instances.length }}
          Nodes_Registered</span>
      </div>
      <button @click="goBack"
        class="text-[10px] font-black uppercase tracking-widest text-[#879196] hover:text-[#232f3e] transition-colors">
        Abort_View
      </button>
      <button @click="navigateToLaunch"
        class="px-12 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#232f3e] transition-all">
        Launch_Protocol
      </button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
  font-family: 'Urbanist', sans-serif;
}
</style>
