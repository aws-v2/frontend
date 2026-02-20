<script setup lang="ts">
import { ref } from 'vue'

const functionName = ref('')
const runtime = ref('Node.js 24.x')
const architecture = ref('x86_64')
const enableDurableExecution = ref(false)

// Additional configurations state
const additionalConfigExpanded = ref(false)
const computeType = ref('standard')
const launchInfrastructure = ref(false)
const vpcEnabled = ref(false)
const trustedLocationMode = ref('off')

const runtimes = [
  'Node.js 24.x',
  'Node.js 22.x',
  'Python 3.13',
  'Python 3.12',
  'Java 21',
  'Java 17',
  'Ruby 3.3',
  'Ruby 3.2',
  '.NET 8',
  '.NET 6'
]
</script>

<template>
  <div class="space-y-6">
    <!-- Basic Information -->
    <div class="glass-panel p-8 rounded-3xl border border-white/10 shadow-xl">
      <div class="flex items-center gap-1.5 mb-8">
        <h3 class="text-xl font-bold text-white">Basic information</h3>
        <span class="text-amber-400 cursor-help">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </span>
      </div>

      <div class="space-y-8 max-w-2xl">
        <!-- Function Name -->
        <div>
          <label class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Function name</label>
          <p class="text-[11px] text-slate-400 mb-4">Enter a name that describes the purpose of your function.</p>
          <input v-model="functionName" type="text" placeholder="my-awesome-function" 
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder:text-slate-600" />
          <p class="text-[10px] text-slate-500 mt-2 font-medium">Function name must be 1 to 64 characters, unique to the Region, and can't include spaces.</p>
        </div>

        <!-- Runtime -->
        <div>
          <div class="flex items-center gap-1.5 mb-2">
            <label class="block text-xs font-black uppercase tracking-widest text-slate-500">Runtime</label>
            <span class="text-amber-400 cursor-help">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
          <p class="text-[11px] text-slate-400 mb-4">Choose the language to use to write your function.</p>
          <select v-model="runtime" 
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all cursor-pointer appearance-none">
            <option v-for="r in runtimes" :key="r" :value="r" class="bg-[#1a1c23]">{{ r }}</option>
          </select>
        </div>

        <!-- Durable Execution -->
        <div class="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div class="flex items-center gap-1.5 mb-2">
            <label class="block text-xs font-black uppercase tracking-widest text-slate-500">Durable execution</label>
            <span class="text-[10px] italic bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold ml-2">NEW</span>
          </div>
          <p class="text-[11px] text-slate-400 mb-4">Enable durable execution to simplify building resilient multi-step applications.</p>
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative">
                <input type="checkbox" v-model="enableDurableExecution" class="sr-only">
                <div class="w-10 h-6 bg-white/10 rounded-full transition-colors group-hover:bg-white/20" :class="enableDurableExecution ? 'bg-amber-600' : ''"></div>
                <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" :class="enableDurableExecution ? 'translate-x-4' : ''"></div>
            </div>
            <span class="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Enable Durable Execution</span>
          </label>
        </div>

        <!-- Architecture -->
        <div>
          <div class="flex items-center gap-1.5 mb-4">
            <label class="block text-xs font-black uppercase tracking-widest text-slate-500">Architecture</label>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <label v-for="arch in ['arm64', 'x86_64']" :key="arch"
              class="flex flex-col p-4 rounded-xl border transition-all cursor-pointer group"
              :class="architecture === arch ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-bold transition-colors" :class="architecture === arch ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'">{{ arch }}</span>
                <input type="radio" :value="arch" v-model="architecture" class="sr-only">
                <div class="w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center"
                    :class="architecture === arch ? 'border-amber-500 bg-amber-500' : 'border-slate-700'">
                    <div v-if="architecture === arch" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
              </div>
              <span class="text-[10px] text-slate-500">{{ arch === 'arm64' ? 'Graviton2 processor' : 'Intel/AMD x86_64' }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Configurations Expandable -->
    <div class="glass-panel border border-white/5 rounded-3xl overflow-hidden shadow-xl">
      <div @click="additionalConfigExpanded = !additionalConfigExpanded"
        class="p-6 cursor-pointer hover:bg-white/[0.02] transition-all flex items-center gap-4">
        <div class="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-400 transition-transform" :class="additionalConfigExpanded ? 'rotate-90' : ''">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>
        <div class="flex-grow">
          <h3 class="font-bold text-white text-sm">Additional configurations</h3>
          <p class="text-[11px] text-slate-500 font-normal mt-1">Networking, security, and governance settings.</p>
        </div>
      </div>

      <!-- Expanded Content -->
      <div v-if="additionalConfigExpanded" class="px-8 pb-8 space-y-8 max-w-2xl border-t border-white/5 pt-8">
        <!-- Compute type -->
        <div>
          <label class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Compute type</label>
          <div class="space-y-4">
            <label v-for="type in [{id: 'standard', label: 'Lambda standard', sub: 'Default compute option'}, {id: 'snapstart', label: 'Lambda SnapStart', sub: 'Improve cold start performance'}]" :key="type.id"
              class="flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer group"
              :class="computeType === type.id ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'">
              <div class="mt-1">
                <input type="radio" :value="type.id" v-model="computeType" class="sr-only">
                <div class="w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center"
                    :class="computeType === type.id ? 'border-amber-500 bg-amber-500' : 'border-slate-700'">
                    <div v-if="computeType === type.id" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
              </div>
              <div class="flex-grow">
                <span class="text-sm font-bold block transition-colors" :class="computeType === type.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'">{{ type.label }}</span>
                <span class="text-[11px] text-slate-500 block mt-1">{{ type.sub }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Networking Toggle -->
        <div class="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
          <label class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">VPC Networking</label>
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative">
                <input type="checkbox" v-model="vpcEnabled" class="sr-only">
                <div class="w-10 h-6 bg-white/10 rounded-full transition-colors group-hover:bg-white/20" :class="vpcEnabled ? 'bg-amber-600' : ''"></div>
                <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" :class="vpcEnabled ? 'translate-x-4' : ''"></div>
            </div>
            <span class="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Enable VPC Access</span>
          </label>
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

