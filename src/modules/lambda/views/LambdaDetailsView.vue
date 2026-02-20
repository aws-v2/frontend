<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLambdaStore } from '../store/lambdaStore'

const route = useRoute()
const router = useRouter()
const lambdaStore = useLambdaStore()
const functionId = route.params.id as string

const activeTab = ref('code')
const tabs = [
    { id: 'code', label: 'Code', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { id: 'test', label: 'Test', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'monitor', label: 'Monitor', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'config', label: 'Configuration', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
]

const currentFunction = computed(() => lambdaStore.currentFunction)

onMounted(async () => {
    await lambdaStore.fetchFunctionById(functionId)
})

const goBack = () => {
    router.push({ name: 'lambda-landing' })
}
</script>

<template>
  <div class="min-h-screen bg-[#05080F] text-slate-200 pb-32 font-sans relative overflow-hidden">
    <!-- Background effects -->
    <div class="absolute inset-0 pointer-events-none opacity-20">
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px]"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-8 space-y-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
        <a href="#" @click.prevent="router.push('/dashboard')" class="text-slate-500 hover:text-amber-400 transition-colors">AWS</a>
        <span class="text-slate-700">/</span>
        <a href="#" @click.prevent="goBack" class="text-slate-500 hover:text-amber-400 transition-colors">Lambda</a>
        <span class="text-slate-700">/</span>
        <a href="#" @click.prevent="goBack" class="text-slate-500 hover:text-amber-400 transition-colors">Functions</a>
        <span class="text-slate-700">/</span>
        <span class="text-slate-400">{{ currentFunction?.name || 'Loading...' }}</span>
      </nav>

      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div class="flex items-start gap-6">
          <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-4xl font-bold text-white tracking-tight">{{ currentFunction?.name }}</h1>
              <span class="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                {{ currentFunction?.status }}
              </span>
            </div>
            <p class="text-sm text-slate-500 font-medium max-w-xl">{{ currentFunction?.description || 'No description provided.' }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button class="px-6 py-2.5 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all active:scale-95">
            Test
          </button>
          <button class="px-8 py-2.5 bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all active:scale-95">
            Deploy
          </button>
        </div>
      </div>

      <!-- Quick Stats Card -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="stat in [{label: 'Runtime', value: currentFunction?.runtime}, {label: 'Memory', value: '128 MB'}, {label: 'Timeout', value: '3s'}, {label: 'Last Modified', value: currentFunction?.lastModified}]" 
            :key="stat.label"
            class="glass-panel p-6 rounded-2xl border border-white/5">
            <span class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{{ stat.label }}</span>
            <span class="text-sm font-bold text-white">{{ stat.value }}</span>
          </div>
      </div>

      <!-- Main Tabs Selector -->
      <div class="flex gap-8 border-b border-white/5">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="pb-4 relative transition-all group"
          :class="activeTab === tab.id ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'"
        >
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
            </svg>
            <span class="text-xs font-black uppercase tracking-widest">{{ tab.label }}</span>
          </div>
          <div 
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 transition-all duration-300"
            :class="activeTab === tab.id ? 'opacity-100' : 'opacity-0 scale-x-0'"
          ></div>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="mt-8">
        <!-- Code Tab -->
        <div v-if="activeTab === 'code'" class="space-y-6">
            <div class="glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div class="flex items-center justify-between px-8 py-4 bg-white/[0.03] border-b border-white/5">
                    <div class="flex items-center gap-4">
                        <div class="flex gap-1.5">
                            <div class="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                        </div>
                        <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest border-l border-white/10 pl-4">index.js</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] text-slate-500 font-medium">Auto-save: enabled</span>
                    </div>
                </div>
                <div class="bg-[#0b0e14] min-h-[500px] p-8 font-mono text-sm leading-relaxed overflow-x-auto">
                    <pre class="text-slate-300"><code>export const handler = async (event) => {
  // TODO: Implement your business logic here
  console.log("Function {{ currentFunction?.name }} invoked with event:", event);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from {{ currentFunction?.name }}!",
      timestamp: new Date().toISOString()
    })
  };
};</code></pre>
                </div>
                <div class="bg-white/[0.02] border-t border-white/5 px-8 py-3 flex justify-between items-center">
                    <span class="text-[10px] text-slate-600 font-mono italic">Ln 4, Col 12</span>
                    <span class="text-[10px] text-slate-600 font-mono uppercase tracking-widest">JavaScript (UTF-8)</span>
                </div>
            </div>
        </div>

        <!-- Placeholder for other tabs -->
        <div v-else class="glass-panel p-24 rounded-3xl border border-white/10 border-dashed flex flex-col items-center justify-center text-center">
            <div class="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center text-slate-600 mb-6">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">{{ tabs.find(t => t.id === activeTab)?.label }} section</h3>
            <p class="text-sm text-slate-500 max-w-sm">This section is currently under development. Here you will be able to manage your function's {{ activeTab }} settings.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-panel {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}
</style>
