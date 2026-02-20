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
  <div class="min-h-screen bg-[#05080F] text-slate-200 pb-32 font-sans relative overflow-hidden">
    <!-- Ambient background effects -->
    <div class="absolute inset-0 pointer-events-none opacity-20">
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
      <div class="absolute bottom-0 right-10 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]"></div>
    </div>

    <div class="relative z-10 p-12 px-8 md:px-20 space-y-10 pt-16">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <a href="#" @click.prevent="router.push('/dashboard')" class="text-slate-500 hover:text-blue-400 transition-colors">AWS</a>
            <span class="text-slate-700">/</span>
            <a href="#" @click.prevent="goBack" class="text-slate-500 hover:text-blue-400 transition-colors">EC2</a>
            <span class="text-slate-700">/</span>
            <span class="text-slate-400">Instances</span>
          </nav>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-white tracking-tight">Instances <span class="text-slate-500 text-xl font-medium ml-2">({{ computeStore.instances.length }})</span></h1>
              <p class="text-xs text-slate-500 font-medium mt-1">Manage and monitor your virtual servers in the cloud.</p>
            </div>
          </div>
        </div>
        <div class="flex gap-4">
           <button class="px-6 py-2.5 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all active:scale-95 shadow-lg">
            Instance State
          </button>
          <button @click="navigateToLaunch" class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95 shadow-xl flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Launch Instances
          </button>
        </div>
      </div>

      <!-- Filters & Controls -->
      <div class="glass-panel rounded-2xl border border-white/10 p-4 flex flex-wrap items-center gap-4">
          <div class="relative flex-1 min-w-[300px]">
              <svg class="absolute left-4 top-3 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Filter instances (e.g. Instance State: Running)" 
                class="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all">
          </div>
          <button @click="computeStore.fetchInstances()" :class="{'animate-spin text-blue-400': computeStore.isLoading}" class="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-slate-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
          </button>
      </div>

      <!-- Analytics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Total Instances Card -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl hover:border-blue-500/30 transition-all group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span class="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
          </div>
          <div class="text-3xl font-bold text-white mb-1">{{ computeStore.instances.filter(i => i.state === 'Running').length }}</div>
          <div class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Running Instances</div>
        </div>

        <!-- CPU Usage Card -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl hover:border-indigo-500/30 transition-all group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Avg</span>
          </div>
          <div class="text-3xl font-bold text-white mb-1">42<span class="text-xl text-slate-500">%</span></div>
          <div class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">CPU Utilization</div>
        </div>

        <!-- Memory Usage Card -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl hover:border-purple-500/30 transition-all group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total</span>
          </div>
          <div class="text-3xl font-bold text-white mb-1">28<span class="text-xl text-slate-500">GB</span></div>
          <div class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Memory Allocated</div>
        </div>

        <!-- Monthly Cost Card -->
        <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl hover:border-amber-500/30 transition-all group relative overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl"></div>
          <div class="flex items-center justify-between mb-4 relative z-10">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-[9px] font-black text-emerald-400 uppercase tracking-widest">-8.2%</span>
          </div>
          <div class="text-3xl font-bold text-white mb-1 relative z-10">$234<span class="text-xl text-slate-500">.50</span></div>
          <div class="text-[10px] text-slate-500 font-medium uppercase tracking-wider relative z-10">Monthly Cost</div>
        </div>
      </div>

      <!-- Resource Usage & Billing Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Resource Usage Chart -->
        <div class="lg:col-span-2 glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-sm font-bold text-white uppercase tracking-widest">Resource Usage</h3>
              <p class="text-[10px] text-slate-500 mt-1 font-medium">Last 24 hours across all instances</p>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                <span class="text-[9px] text-slate-400 uppercase font-black">CPU</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-purple-500"></div>
                <span class="text-[9px] text-slate-400 uppercase font-black">Memory</span>
              </div>
            </div>
          </div>
          <div class="h-40 flex items-end gap-1">
            <div v-for="n in 48" :key="n"
              class="flex-1 flex flex-col gap-1">
              <div class="bg-gradient-to-t from-blue-600/20 to-blue-500/40 rounded-t-sm hover:from-blue-600/40 hover:to-blue-500/80 transition-all cursor-pointer"
                :style="{ height: (Math.sin(n/6) * 30 + 50 + Math.random() * 20) + '%' }"></div>
              <div class="bg-gradient-to-t from-purple-600/20 to-purple-500/40 rounded-t-sm hover:from-purple-600/40 hover:to-purple-500/80 transition-all cursor-pointer"
                :style="{ height: (Math.cos(n/5) * 25 + 45 + Math.random() * 15) + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Billing Breakdown -->
        <div class="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
          <h3 class="text-sm font-bold text-white uppercase tracking-widest mb-6">Cost Breakdown</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 01-2 2v4a2 2 0 012 2h14a2 2 0 012-2v-4a2 2 0 01-2-2" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-bold text-white">Compute</div>
                  <div class="text-[9px] text-slate-500">EC2 instances</div>
                </div>
              </div>
              <span class="text-sm font-bold text-blue-400">$189.20</span>
            </div>

            <div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-bold text-white">Storage</div>
                  <div class="text-[9px] text-slate-500">EBS volumes</div>
                </div>
              </div>
              <span class="text-sm font-bold text-purple-400">$32.80</span>
            </div>

            <div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-bold text-white">Data Transfer</div>
                  <div class="text-[9px] text-slate-500">Network out</div>
                </div>
              </div>
              <span class="text-sm font-bold text-emerald-400">$12.50</span>
            </div>

            <div class="pt-4 mt-4 border-t border-white/10">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Total</span>
                <span class="text-2xl font-bold text-white">$234.50</span>
              </div>
              <div class="text-[9px] text-slate-500 text-right mt-1">February 2026</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative group">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th class="p-6 border-r border-white/5">Name</th>
                <th class="p-6 border-r border-white/5">Instance ID</th>
                <th class="p-6 border-r border-white/5 text-center">Instance State</th>
                <th class="p-6 border-r border-white/5">Instance Type</th>
                <th class="p-6 border-r border-white/5">Status Check</th>
                <th class="p-6 border-r border-white/5">Public IPv4 address</th>
                <th class="p-6">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.05]">
              <tr v-for="instance in computeStore.instances" :key="instance.id" 
                  class="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                  @click="navigateToDetails(instance.id)">
                <td class="p-6 border-r border-white/5">
                    <span class="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{{ instance.name || '-' }}</span>
                </td>
                <td class="p-6 border-r border-white/5">
                    <span class="text-xs font-bold text-blue-400 font-mono">{{ instance.id }}</span>
                </td>
                <td class="p-6 border-r border-white/5">
                    <div class="flex flex-col items-center gap-1.5">
                        <span :class="[
                            'flex items-center gap-1.5 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border',
                            instance.state === 'Running' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            instance.state === 'Stopped' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                            instance.state === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        ]">
                            <span :class="[
                                'w-1 h-1 rounded-full', 
                                instance.state === 'Running' ? 'bg-emerald-500 animate-pulse' : 
                                instance.state === 'pending' ? 'bg-amber-500 animate-pulse' : 
                                'bg-rose-500'
                            ]"></span>
                            {{ instance.state }}
                        </span>
                    </div>
                </td>
                <td class="p-6 border-r border-white/5 text-xs text-slate-400 font-medium">
                    {{ instance.type }}
                </td>
                <td class="p-6 border-r border-white/5 text-xs">
                    <span :class="instance.statusCheck.includes('passed') ? 'text-emerald-400' : 'text-slate-500'">
                        {{ instance.statusCheck }}
                    </span>
                </td>
                <td class="p-6 border-r border-white/5 text-xs text-white font-mono">
                    {{ instance.publicIp }}
                </td>
                <td class="p-6" @click.stop>
                    <div class="flex items-center gap-2">
                        <button @click="handleAction('start', instance.id)" v-if="instance.state !== 'Running'"
                            class="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors" title="Start">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        <button @click="handleAction('stop', instance.id)" v-if="instance.state === 'Running'"
                            class="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors" title="Stop">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        <button @click="handleAction('restart', instance.id)"
                            class="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors" title="Restart">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button @click="handleAction('delete', instance.id)"
                            class="p-2 rounded-lg bg-slate-500/10 text-slate-500 hover:bg-rose-500/20 hover:text-rose-500 transition-colors" title="Delete">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </td>
              </tr>
              <tr v-if="computeStore.instances.length === 0 && !computeStore.isLoading">
                  <td colspan="7" class="p-12 text-center">
                      <div class="flex flex-col items-center gap-4">
                          <div class="w-16 h-16 rounded-full bg-slate-500/5 flex items-center justify-center text-slate-600">
                              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                          </div>
                          <p class="text-sm font-bold text-slate-500 uppercase tracking-widest">No instances found</p>
                          <button @click="navigateToLaunch" class="text-blue-400 text-xs font-black uppercase tracking-widest hover:text-blue-300 transition-colors">
                            Launch your first instance &rarr;
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
    <div class="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 flex items-center justify-end px-8 md:px-16 py-4 gap-4 z-50 backdrop-blur-xl">
      <button @click="goBack" 
        class="px-8 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all active:scale-95 shadow-lg">
        Go Back
      </button>
      <button @click="navigateToLaunch"
        class="px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95 shadow-xl">
        Launch New Instance
      </button>
    </div>
  </div>
</template>

<style scoped>
.glass-panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
</style>
