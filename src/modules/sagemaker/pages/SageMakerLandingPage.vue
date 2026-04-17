<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSageMakerStore } from '../store/sagemakerStore'

const router = useRouter()
const store = useSageMakerStore()

const stats = computed(() => {
  const total = store.trainingJobs.length
  const active = store.trainingJobs.filter(j => j.status === 'Training' || j.status === 'Initializing').length
  const completed = store.trainingJobs.filter(j => j.status === 'Completed').length
  const failed = store.trainingJobs.filter(j => j.status === 'Failed').length
  return { total, active, completed, failed }
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    case 'Training': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    case 'Initializing': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    case 'Failed': return 'text-red-500 bg-red-500/10 border-red-500/20'
    case 'Canceled': return 'text-slate-500 bg-slate-500/10 border-slate-500/20'
    default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20'
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#05080F] text-white font-sans selection:bg-pink-500/30">
    <div class="max-w-[1600px] mx-auto px-8 pt-24 pb-20">
      
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 border-b border-white/10 pb-8">
        <div>
          <div class="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold tracking-widest uppercase">
            <span class="w-2 h-2 rounded-full bg-pink-500"></span>
            Machine Learning Workspace
          </div>
          <h1 class="text-5xl font-bold tracking-tight mb-4 font-display">Sage<span class="text-pink-500">Maker</span> Studio</h1>
          <p class="text-slate-400 max-w-xl text-lg font-light leading-relaxed">
            Train, tune, and deploy machine learning models at scale. Fully integrated with Hyper Storage for secure, high-throughput data processing.
          </p>
        </div>
        <div class="flex items-center gap-4">
          <button class="px-6 py-3 border border-white/20 text-sm font-bold tracking-wide hover:bg-white/5 transition-colors rounded-lg">
            View Analytics
          </button>
          <router-link to="/sagemaker/train/create" class="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-sm font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] rounded-lg">
            Create Training Job
          </router-link>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <div class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-bl-full translate-x-8 -translate-y-8 group-hover:bg-pink-500/20 transition-colors"></div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Total Jobs</p>
          <p class="text-4xl font-black">{{ stats.total }}</p>
        </div>
        <div class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full translate-x-8 -translate-y-8 group-hover:bg-blue-500/20 transition-colors"></div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Active Training</p>
          <p class="text-4xl font-black text-blue-400">{{ stats.active }}</p>
        </div>
        <div class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full translate-x-8 -translate-y-8 group-hover:bg-emerald-500/20 transition-colors"></div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Completed</p>
          <p class="text-4xl font-black text-emerald-400">{{ stats.completed }}</p>
        </div>
        <div class="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full translate-x-8 -translate-y-8 group-hover:bg-red-500/20 transition-colors"></div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Failed</p>
          <p class="text-4xl font-black text-red-400">{{ stats.failed }}</p>
        </div>
      </div>

      <!-- Jobs Registry -->
      <div class="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div class="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <h2 class="text-xl font-bold tracking-tight">Training Jobs Registry</h2>
        </div>
        
        <div v-if="store.trainingJobs.length === 0" class="p-16 text-center text-slate-500">
          <div class="w-16 h-16 border-2 border-dashed border-white/10 rounded-xl mx-auto flex items-center justify-center mb-4">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p class="text-sm font-mono uppercase tracking-widest">No active training jobs</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-white/10 bg-black/10">
                <th class="py-5 px-8 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase font-mono">Job & ID</th>
                <th class="py-5 px-8 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase font-mono">Status</th>
                <th class="py-5 px-8 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase font-mono">Compute</th>
                <th class="py-5 px-8 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase font-mono hidden lg:table-cell">Duration</th>
                <th class="py-5 px-8 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase font-mono text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="job in store.trainingJobs" :key="job.id" class="border-b border-white/5 hover:bg-white/[0.04] transition-colors group">
                <td class="py-5 px-8">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 font-bold group-hover:border-pink-500/50 group-hover:text-pink-400 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <button @click="router.push(`/sagemaker/jobs/${job.id}`)" class="text-sm font-bold hover:text-pink-400 transition-colors">
                        {{ job.name }}
                      </button>
                      <div class="text-xs font-mono text-slate-500">{{ job.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-5 px-8">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 border text-[10px] font-bold uppercase tracking-widest rounded-full" :class="getStatusColor(job.status)">
                    <span v-if="job.status === 'Training' || job.status === 'Initializing'" class="w-1.5 h-1.5 bg-current rounded-full animate-ping mr-1"></span>
                    <span v-else class="w-1 h-1 bg-current rounded-full"></span>
                    {{ job.status }}
                  </span>
                </td>
                <td class="py-5 px-8">
                  <div class="text-sm font-mono truncate text-slate-300">{{ job.instance }}</div>
                </td>
                <td class="py-5 px-8 hidden lg:table-cell">
                  <div class="text-sm font-mono text-slate-400">{{ job.duration }}</div>
                </td>
                <td class="py-5 px-8 text-center space-x-3">
                  <button @click="router.push(`/sagemaker/jobs/${job.id}`)" class="text-[10px] font-bold text-slate-400 hover:text-pink-400 uppercase tracking-widest transition-colors font-mono hover:bg-pink-500/10 px-3 py-1.5 rounded">
                    Inspect
                  </button>
                  <button v-if="job.status === 'Training' || job.status === 'Initializing'" @click="store.cancelTrainingJob(job.id)" class="text-[10px] font-bold text-slate-400 hover:text-red-400 uppercase tracking-widest transition-colors font-mono hover:bg-red-500/10 px-3 py-1.5 rounded">
                    Cancel
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
